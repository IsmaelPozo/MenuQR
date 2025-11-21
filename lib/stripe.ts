import "server-only"

import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2024-12-18.acacia",
})

// Subscription configuration
export const SUBSCRIPTION_CONFIG = {
  monthlyFeeEuros: 25.0,
  trialMonths: 3,
  currency: "eur",
  billingCycle: "monthly" as const,
}

// Helper to convert euros to cents for Stripe
export function eurosToCents(euros: number): number {
  return Math.round(euros * 100)
}

// Helper to convert cents to euros
export function centsToEuros(cents: number): number {
  return cents / 100
}
