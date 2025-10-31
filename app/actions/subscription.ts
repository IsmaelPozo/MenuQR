"use server"

import { createClient } from "@/lib/supabase/server"
import { stripe, SUBSCRIPTION_CONFIG, eurosToCents } from "@/lib/stripe"
import { revalidatePath } from "next/cache"

export async function getSubscriptionStatus() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("No autenticado")
  }

  const { data: restaurant, error } = await supabase.from("restaurants").select("*").eq("id", user.id).single()

  if (error) throw error

  // Check if trial has ended
  const now = new Date()
  const trialEnd = restaurant.trial_end_date ? new Date(restaurant.trial_end_date) : null
  const isInTrial = trialEnd ? now < trialEnd : false

  const basePrice = restaurant.monthly_fee || 25
  const referralDiscount = restaurant.referral_discount || 0
  const finalPrice = Math.max(basePrice - referralDiscount, 15) // Minimum 15€

  return {
    restaurant,
    isInTrial,
    daysUntilTrialEnd: trialEnd ? Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0,
    referralDiscount,
    finalPrice,
  }
}

export async function createStripeCustomer() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("No autenticado")
  }

  const { data: restaurant } = await supabase.from("restaurants").select("*").eq("id", user.id).single()

  if (!restaurant) throw new Error("Restaurante no encontrado")

  // Create Stripe customer if doesn't exist
  if (!restaurant.stripe_customer_id) {
    const customer = await stripe.customers.create({
      email: restaurant.email,
      name: restaurant.name,
      metadata: {
        restaurant_id: restaurant.id,
      },
    })

    await supabase.from("restaurants").update({ stripe_customer_id: customer.id }).eq("id", restaurant.id)

    return customer.id
  }

  return restaurant.stripe_customer_id
}

export async function startSubscriptionCheckout() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("No autenticado")
  }

  const { data: restaurant } = await supabase.from("restaurants").select("*").eq("id", user.id).single()

  if (!restaurant) throw new Error("Restaurante no encontrado")

  // Ensure customer exists
  const customerId = await createStripeCustomer()

  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const daysRemaining = daysInMonth - now.getDate() + 1

  const basePrice = restaurant.monthly_fee || 25
  const referralDiscount = restaurant.referral_discount || 0
  const finalMonthlyPrice = Math.max(basePrice - referralDiscount, 15)

  const proportionalFee = (finalMonthlyPrice / daysInMonth) * daysRemaining

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: [
      {
        price_data: {
          currency: SUBSCRIPTION_CONFIG.currency,
          product_data: {
            name: "Suscripción MenuQR",
            description: `Pago proporcional del mes actual (${daysRemaining} días)${referralDiscount > 0 ? ` - Descuento por referidos: -${referralDiscount.toFixed(2)}€` : ""}`,
          },
          unit_amount: eurosToCents(proportionalFee),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    metadata: {
      restaurant_id: restaurant.id,
      payment_type: "subscription",
      billing_period_start: now.toISOString(),
      billing_period_end: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString(),
      referral_discount: referralDiscount.toString(),
    },
  })

  return session.client_secret
}

export async function getPaymentHistory() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("No autenticado")
  }

  const { data: payments, error } = await supabase
    .from("subscription_payments")
    .select("*")
    .eq("restaurant_id", user.id)
    .order("created_at", { ascending: false })

  if (error) throw error

  return payments
}

export async function updateMonthlyFee(newFee: number) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("No autenticado")
  }

  if (newFee < 10 || newFee > 1000) {
    throw new Error("La tarifa debe estar entre 10€ y 1000€")
  }

  const { error } = await supabase.from("restaurants").update({ monthly_fee: newFee }).eq("id", user.id)

  if (error) throw error

  revalidatePath("/admin/billing")
}
