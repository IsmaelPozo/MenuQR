import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import type Stripe from "stripe"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key",
)

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("[v0] Missing Stripe configuration")
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
  }

  const body = await req.text()
  const signature = req.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.metadata?.payment_type === "subscription") {
          const restaurantId = session.metadata.restaurant_id
          const paymentIntentId = session.payment_intent as string

          // Record payment
          await supabaseAdmin.from("subscription_payments").insert({
            restaurant_id: restaurantId,
            stripe_payment_intent_id: paymentIntentId,
            amount: (session.amount_total || 0) / 100,
            currency: session.currency?.toUpperCase() || "EUR",
            status: "succeeded",
            billing_period_start: session.metadata.billing_period_start,
            billing_period_end: session.metadata.billing_period_end,
            paid_at: new Date().toISOString(),
          })

          // Update restaurant subscription status
          const nextBillingDate = new Date()
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
          nextBillingDate.setDate(1) // First day of next month

          await supabaseAdmin
            .from("restaurants")
            .update({
              subscription_status: "active",
              next_billing_date: nextBillingDate.toISOString(),
            })
            .eq("id", restaurantId)
        }
        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Update payment status to failed
        await supabaseAdmin
          .from("subscription_payments")
          .update({ status: "failed" })
          .eq("stripe_payment_intent_id", paymentIntent.id)

        // Update restaurant status
        if (paymentIntent.metadata?.restaurant_id) {
          await supabaseAdmin
            .from("restaurants")
            .update({ subscription_status: "past_due" })
            .eq("id", paymentIntent.metadata.restaurant_id)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Error processing webhook:", err)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
