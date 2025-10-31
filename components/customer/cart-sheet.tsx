"use client"

import type React from "react"

import { useState } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Minus, Plus, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { MenuItem } from "@/lib/types"
import { PaymentOptions } from "./payment-options"

interface CartItem extends MenuItem {
  quantity: number
}

interface CartSheetProps {
  isOpen: boolean
  onClose: () => void
  cart: CartItem[]
  onUpdateQuantity: (itemId: string, quantity: number) => void
  tableId: string
  restaurantId: string
  onOrderComplete: () => void
}

export function CartSheet({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  tableId,
  restaurantId,
  onOrderComplete,
}: CartSheetProps) {
  const [customerName, setCustomerName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState(false)

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const supabase = createClient()

    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          restaurant_id: restaurantId,
          table_id: tableId,
          customer_name: customerName || null,
          total_amount: total,
          status: "pending_payment",
          payment_status: "pending",
        })
        .select()
        .single()

      if (orderError) throw orderError

      const orderItems = cart.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      await supabase.from("tables").update({ status: "occupied" }).eq("id", tableId)

      setOrderId(order.id)
      setShowPayment(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al crear el pedido")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePaymentComplete = () => {
    setShowPayment(false)
    setOrderId(null)
    onOrderComplete()
    alert("¡Pago completado! Tu pedido ha sido enviado a la cocina.")
  }

  if (showPayment && orderId) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Pagar Pedido</SheetTitle>
            <SheetDescription>Elige cómo quieres pagar</SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            <PaymentOptions
              orderId={orderId}
              tableId={tableId}
              restaurantId={restaurantId}
              items={cart.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                unit_price: item.price,
                total_price: item.price * item.quantity,
                is_paid: false,
                menu_items: {
                  name: item.name,
                  price: item.price,
                },
              }))}
              totalAmount={total}
              customerName={customerName}
              onPaymentComplete={handlePaymentComplete}
            />
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Tu Pedido</SheetTitle>
          <SheetDescription>Revisa tu pedido antes de proceder al pago</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmitOrder} className="mt-6 space-y-6">
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.price.toFixed(2)} € × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="font-semibold min-w-6 text-center">{item.quantity}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onUpdateQuantity(item.id, 0)}
                    className="h-8 w-8 p-0 text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">{total.toFixed(2)} €</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_name">Tu Nombre (Opcional)</Label>
            <Input
              id="customer_name"
              type="text"
              placeholder="Ej: Juan"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || cart.length === 0}>
            {isSubmitting ? "Creando pedido..." : "Continuar al Pago"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
