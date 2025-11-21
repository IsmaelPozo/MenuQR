"use server"

import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"
import { revalidatePath } from "next/cache"

export async function getTableOrders(tableId: string) {
  const supabase = await createClient()

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        id,
        quantity,
        unit_price,
        total_price,
        is_paid,
        paid_by,
        menu_items (
          id,
          name,
          price
        )
      )
    `,
    )
    .eq("table_id", tableId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return orders
}

export async function createPaymentIntent(params: {
  tableId: string
  orderId: string
  amount: number
  paymentType: "individual" | "table" | "partial"
  customerName?: string
  itemIds?: string[]
  restaurantId: string
}) {
  const supabase = await createClient()

  // Get restaurant's Stripe Connect account
  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("stripe_connect_account_id, payment_enabled")
    .eq("id", params.restaurantId)
    .single()

  if (!restaurant?.payment_enabled || !restaurant.stripe_connect_account_id) {
    throw new Error("El restaurante no tiene configurado el sistema de pagos")
  }

  // Create Stripe payment intent with platform fee (3%)
  const platformFee = Math.round(params.amount * 0.03 * 100) // 3% fee in cents
  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: Math.round(params.amount * 100), // Convert to cents
      currency: "eur",
      application_fee_amount: platformFee,
      metadata: {
        table_id: params.tableId,
        order_id: params.orderId,
        payment_type: params.paymentType,
        customer_name: params.customerName || "",
        item_ids: params.itemIds?.join(",") || "",
      },
    },
    {
      stripeAccount: restaurant.stripe_connect_account_id,
    },
  )

  // Create payment record
  const { data: payment, error } = await supabase
    .from("order_payments")
    .insert({
      order_id: params.orderId,
      table_id: params.tableId,
      amount: params.amount,
      payment_type: params.paymentType,
      stripe_payment_intent_id: paymentIntent.id,
      customer_name: params.customerName,
      paid_item_ids: params.itemIds || [],
      status: "pending",
    })
    .select()
    .single()

  if (error) throw error

  return {
    clientSecret: paymentIntent.client_secret,
    paymentId: payment.id,
  }
}

export async function confirmPayment(paymentId: string, itemIds?: string[]) {
  const supabase = await createClient()

  // Update payment status
  const { error: paymentError } = await supabase
    .from("order_payments")
    .update({ status: "completed" })
    .eq("id", paymentId)

  if (paymentError) throw paymentError

  // Mark items as paid if itemIds provided
  if (itemIds && itemIds.length > 0) {
    const { error: itemsError } = await supabase.from("order_items").update({ is_paid: true }).in("id", itemIds)

    if (itemsError) throw itemsError
  }

  revalidatePath("/admin/kitchen")
  revalidatePath("/menu/[qrCode]", "page")
}

export async function getUnpaidItems(tableId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("order_items")
    .select(
      `
      *,
      orders!inner (
        id,
        table_id,
        customer_name,
        created_at
      ),
      menu_items (
        name,
        price
      )
    `,
    )
    .eq("orders.table_id", tableId)
    .eq("is_paid", false)

  if (error) throw error
  return data
}
