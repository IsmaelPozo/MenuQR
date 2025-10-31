"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Users, Split } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { createPaymentIntent, confirmPayment } from "@/app/actions/order-payments"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface OrderItem {
  id: string
  quantity: number
  unit_price: number
  total_price: number
  is_paid: boolean
  menu_items: {
    name: string
    price: number
  }
}

interface PaymentOptionsProps {
  orderId: string
  tableId: string
  restaurantId: string
  items: OrderItem[]
  totalAmount: number
  customerName?: string
  onPaymentComplete: () => void
}

function PaymentForm({
  clientSecret,
  paymentId,
  onSuccess,
}: {
  clientSecret: string
  paymentId: string
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setIsProcessing(true)
    setError(null)

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    })

    if (submitError) {
      setError(submitError.message || "Error al procesar el pago")
      setIsProcessing(false)
      return
    }

    // Confirm payment in database
    await confirmPayment(paymentId)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={!stripe || isProcessing} className="w-full" size="lg">
        {isProcessing ? "Procesando..." : "Pagar Ahora"}
      </Button>
    </form>
  )
}

export function PaymentOptions({
  orderId,
  tableId,
  restaurantId,
  items,
  totalAmount,
  customerName,
  onPaymentComplete,
}: PaymentOptionsProps) {
  const [paymentType, setPaymentType] = useState<"individual" | "table" | "partial" | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const unpaidItems = items.filter((item) => !item.is_paid)
  const selectedTotal = unpaidItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.total_price, 0)

  const handlePaymentTypeSelect = async (type: "individual" | "table" | "partial") => {
    setPaymentType(type)

    if (type === "table") {
      // Pay entire table
      await initiatePayment(
        type,
        totalAmount,
        unpaidItems.map((i) => i.id),
      )
    }
  }

  const handlePartialPayment = async () => {
    if (selectedItems.length === 0) return
    await initiatePayment("partial", selectedTotal, selectedItems)
  }

  const initiatePayment = async (type: "individual" | "table" | "partial", amount: number, itemIds: string[]) => {
    setIsLoading(true)
    try {
      const result = await createPaymentIntent({
        tableId,
        orderId,
        amount,
        paymentType: type,
        customerName,
        itemIds,
        restaurantId,
      })

      setClientSecret(result.clientSecret!)
      setPaymentId(result.paymentId)
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error al iniciar el pago")
    } finally {
      setIsLoading(false)
    }
  }

  if (clientSecret && paymentId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Completar Pago</CardTitle>
          <CardDescription>
            Total a pagar: <span className="font-bold text-primary">{selectedTotal.toFixed(2)} €</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm clientSecret={clientSecret} paymentId={paymentId} onSuccess={onPaymentComplete} />
          </Elements>
        </CardContent>
      </Card>
    )
  }

  if (paymentType === "partial") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Selecciona tus Platos</CardTitle>
          <CardDescription>Marca los platos que quieres pagar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {unpaidItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
              <Checkbox
                id={item.id}
                checked={selectedItems.includes(item.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedItems([...selectedItems, item.id])
                  } else {
                    setSelectedItems(selectedItems.filter((id) => id !== item.id))
                  }
                }}
              />
              <Label htmlFor={item.id} className="flex-1 cursor-pointer">
                <div className="flex justify-between">
                  <span>
                    {item.quantity}x {item.menu_items.name}
                  </span>
                  <span className="font-semibold">{item.total_price.toFixed(2)} €</span>
                </div>
              </Label>
            </div>
          ))}

          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between text-lg font-bold mb-4">
              <span>Total Seleccionado</span>
              <span className="text-primary">{selectedTotal.toFixed(2)} €</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPaymentType(null)} className="flex-1">
                Volver
              </Button>
              <Button
                onClick={handlePartialPayment}
                disabled={selectedItems.length === 0 || isLoading}
                className="flex-1"
              >
                {isLoading ? "Procesando..." : "Continuar al Pago"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card
        className="cursor-pointer hover:border-primary transition-colors"
        onClick={() => handlePaymentTypeSelect("table")}
      >
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle>Pagar Mesa Completa</CardTitle>
              <CardDescription>Paga todos los pedidos de la mesa</CardDescription>
              <Badge className="mt-2" variant="secondary">
                {totalAmount.toFixed(2)} €
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => setPaymentType("partial")}>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Split className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle>Pagar Mis Platos</CardTitle>
              <CardDescription>Selecciona solo lo que consumiste</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}
