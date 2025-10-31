"use server"

import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"

export async function createConnectAccount() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("No autenticado")
  }

  const { data: restaurant } = await supabase.from("restaurants").select("*").eq("id", user.id).single()

  if (!restaurant) throw new Error("Restaurante no encontrado")

  // Create Stripe Connect account if doesn't exist
  if (!restaurant.stripe_connect_account_id) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "ES",
      email: restaurant.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: "company",
      business_profile: {
        name: restaurant.name,
        support_email: restaurant.email,
      },
    })

    await supabase.from("restaurants").update({ stripe_connect_account_id: account.id }).eq("id", restaurant.id)

    return account.id
  }

  return restaurant.stripe_connect_account_id
}

export async function createAccountLink() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("No autenticado")
  }

  const { data: restaurant } = await supabase.from("restaurants").select("*").eq("id", user.id).single()

  if (!restaurant) throw new Error("Restaurante no encontrado")

  let accountId = restaurant.stripe_connect_account_id

  // Create account if doesn't exist
  if (!accountId) {
    accountId = await createConnectAccount()
  }

  // Create account link for onboarding
  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/payments/refresh`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/payments/return`,
    type: "account_onboarding",
  })

  return accountLink.url
}

export async function getAccountStatus() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("No autenticado")
  }

  const { data: restaurant } = await supabase.from("restaurants").select("*").eq("id", user.id).single()

  if (!restaurant || !restaurant.stripe_connect_account_id) {
    return {
      connected: false,
      detailsSubmitted: false,
      chargesEnabled: false,
      payoutsEnabled: false,
    }
  }

  const account = await stripe.accounts.retrieve(restaurant.stripe_connect_account_id)

  // Update payment_enabled status in database
  const paymentEnabled = account.charges_enabled && account.payouts_enabled
  if (restaurant.payment_enabled !== paymentEnabled) {
    await supabase.from("restaurants").update({ payment_enabled: paymentEnabled }).eq("id", restaurant.id)
  }

  return {
    connected: true,
    detailsSubmitted: account.details_submitted,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    accountId: account.id,
  }
}

export async function createLoginLink() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("No autenticado")
  }

  const { data: restaurant } = await supabase.from("restaurants").select("*").eq("id", user.id).single()

  if (!restaurant || !restaurant.stripe_connect_account_id) {
    throw new Error("No hay cuenta de Stripe Connect configurada")
  }

  const loginLink = await stripe.accounts.createLoginLink(restaurant.stripe_connect_account_id)

  return loginLink.url
}

export async function createPaymentIntent(orderId: string) {
  const supabase = await createClient()

  // Get order details
  const { data: order } = await supabase.from("orders").select("*, restaurants(*)").eq("id", orderId).single()

  if (!order) throw new Error("Pedido no encontrado")

  const restaurant = order.restaurants as any

  if (!restaurant.stripe_connect_account_id || !restaurant.payment_enabled) {
    throw new Error("El restaurante no tiene pagos configurados")
  }

  // Create payment intent with application fee
  const applicationFeeAmount = Math.round(order.total_amount * 100 * 0.03) // 3% platform fee
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.total_amount * 100),
    currency: "eur",
    application_fee_amount: applicationFeeAmount,
    transfer_data: {
      destination: restaurant.stripe_connect_account_id,
    },
    metadata: {
      order_id: orderId,
      restaurant_id: restaurant.id,
    },
  })

  return paymentIntent.client_secret
}
