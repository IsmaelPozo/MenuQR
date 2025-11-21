"use server"

import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"

export async function createConnectAccount() {
  const supabase = await createClient()

  if (!supabase) {
    throw new Error("Database not configured")
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("No autenticado")
  }

  const { data: restaurant } = await supabase.from("restaurants").select("*").eq("id", user.id).single()

  if (!restaurant) throw new Error("Restaurante no encontrado")

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error("[v0] Payments: STRIPE_SECRET_KEY not configured")
    throw new Error("Stripe no está configurado. Contacta al administrador.")
  }

  try {
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
  } catch (error) {
    console.error("[v0] Payments: Error creating Stripe account:", error)
    throw new Error("Error al conectar con Stripe. Por favor, intenta de nuevo más tarde.")
  }
}

export async function createAccountLink() {
  const supabase = await createClient()

  if (!supabase) {
    throw new Error("Database not configured")
  }

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

  try {
    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/payments/refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/payments/return`,
      type: "account_onboarding",
    })

    return accountLink.url
  } catch (error) {
    console.error("[v0] Payments: Error creating account link:", error)
    throw new Error("Error al crear enlace de configuración. Por favor, intenta de nuevo.")
  }
}

export async function getAccountStatus() {
  const supabase = await createClient()

  if (!supabase) {
    return {
      connected: false,
      detailsSubmitted: false,
      chargesEnabled: false,
      payoutsEnabled: false,
    }
  }

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

  try {
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
  } catch (error) {
    console.error("[v0] Payments: Error retrieving account status:", error)
    return {
      connected: false,
      detailsSubmitted: false,
      chargesEnabled: false,
      payoutsEnabled: false,
    }
  }
}

export async function createLoginLink() {
  const supabase = await createClient()

  if (!supabase) {
    throw new Error("Database not configured")
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("No autenticado")
  }

  const { data: restaurant } = await supabase.from("restaurants").select("*").eq("id", restaurant.id).single()

  if (!restaurant || !restaurant.stripe_connect_account_id) {
    throw new Error("No hay cuenta de Stripe Connect configurada")
  }

  try {
    const loginLink = await stripe.accounts.createLoginLink(restaurant.stripe_connect_account_id)
    return loginLink.url
  } catch (error) {
    console.error("[v0] Payments: Error creating login link:", error)
    throw new Error("Error al acceder al dashboard. Por favor, intenta de nuevo.")
  }
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

  try {
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
  } catch (error) {
    console.error("[v0] Payments: Error creating payment intent:", error)
    throw new Error("Error al procesar el pago. Por favor, intenta de nuevo.")
  }
}
