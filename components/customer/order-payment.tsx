"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { createPaymentIntent } from "@/app/actions/payments"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { CreditCardIcon } from "lucide-react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface OrderPaymentProps {
  orderId: string
  totalAmount: number
  onPaymentComplete?: () => void
}

export function OrderPayment({ orderId, totalAmount, onPaymentComplete }: OrderPaymentProps) {
  const [showCheckout, setShowCheckout] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handlePayNow() {
    setLoading(true)
    try {
      const secret = await createPaymentIntent(orderId)
      setClientSecret(secret)
      setShowCheckout(true)
    } catch (error) {
      console.error("Error creating payment intent:", error)
      alert("Error al procesar el pago. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  if (showCheckout && clientSecret) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Completar Pago</h2>
        <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Total a Pagar</h3>
          <p className="text-3xl font-bold text-primary">{totalAmount.toFixed(2)}€</p>
        </div>
        <CreditCardIcon className="h-12 w-12 text-muted-foreground" />
      </div>
      <Button onClick={handlePayNow} disabled={loading} className="w-full" size="lg">
        {loading ? "Procesando..." : "Pagar Ahora"}
      </Button>
      <p className="text-xs text-muted-foreground text-center mt-2">Pago seguro procesado por Stripe</p>
    </Card>
  )
}
