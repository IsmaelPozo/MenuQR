"use client"

import { useState, useEffect } from "react"
import type { Restaurant, SubscriptionPayment } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getSubscriptionStatus, startSubscriptionCheckout, getPaymentHistory } from "@/app/actions/subscription"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { CalendarIcon, CreditCardIcon, AlertCircleIcon, CheckCircleIcon, Gift, TrendingDown } from "lucide-react"
import Link from "next/link"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface BillingDashboardProps {
  restaurant: Restaurant
}

export function BillingDashboard({ restaurant }: BillingDashboardProps) {
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null)
  const [payments, setPayments] = useState<SubscriptionPayment[]>([])
  const [showCheckout, setShowCheckout] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [subInfo, paymentHistory] = await Promise.all([getSubscriptionStatus(), getPaymentHistory()])
      setSubscriptionInfo(subInfo)
      setPayments(paymentHistory)
    } catch (error) {
      console.error("Error loading billing data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleStartCheckout() {
    try {
      const secret = await startSubscriptionCheckout()
      setClientSecret(secret)
      setShowCheckout(true)
    } catch (error) {
      console.error("Error starting checkout:", error)
    }
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  const statusColors = {
    trialing: "bg-blue-500",
    active: "bg-green-500",
    past_due: "bg-red-500",
    canceled: "bg-gray-500",
    incomplete: "bg-yellow-500",
  }

  const statusLabels = {
    trialing: "Período de prueba",
    active: "Activa",
    past_due: "Pago pendiente",
    canceled: "Cancelada",
    incomplete: "Incompleta",
  }

  const basePrice = restaurant.monthly_fee || 25
  const referralDiscount = subscriptionInfo?.referralDiscount || 0
  const finalPrice = subscriptionInfo?.finalPrice || basePrice

  return (
    <div className="space-y-6">
      {referralDiscount > 0 && (
        <Card className="border-green-500 bg-green-50">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-900">Descuento por Referidos Activo</p>
                  <p className="text-sm text-green-700">
                    Estás ahorrando {referralDiscount.toFixed(2)}€ al mes gracias a tus referidos
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" className="bg-white">
                <Link href="/admin/referrals">
                  <Gift className="h-4 w-4 mr-2" />
                  Ver Referidos
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Subscription Status Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Estado de la Suscripción</h2>
            <Badge className={statusColors[restaurant.subscription_status]}>
              {statusLabels[restaurant.subscription_status]}
            </Badge>
          </div>
          <div className="text-right">
            {referralDiscount > 0 ? (
              <div>
                <p className="text-sm text-muted-foreground line-through">{basePrice.toFixed(2)}€</p>
                <p className="text-2xl font-bold text-green-600">{finalPrice.toFixed(2)}€</p>
                <p className="text-xs text-green-600">-{referralDiscount.toFixed(2)}€ descuento</p>
              </div>
            ) : (
              <div>
                <p className="text-2xl font-bold">{basePrice.toFixed(2)}€</p>
                <p className="text-sm text-muted-foreground">por mes</p>
              </div>
            )}
          </div>
        </div>

        {subscriptionInfo?.isInTrial && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Período de prueba gratuito</p>
                <p className="text-sm text-blue-700">
                  Te quedan {subscriptionInfo.daysUntilTrialEnd} días de prueba gratuita. Los primeros 3 meses son
                  completamente gratis.
                </p>
              </div>
            </div>
          </div>
        )}

        {restaurant.subscription_status === "past_due" && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircleIcon className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Pago pendiente</p>
                <p className="text-sm text-red-700">
                  Tu último pago no se pudo procesar. Por favor, actualiza tu método de pago.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Fecha de inicio</p>
              <p className="font-medium">{new Date(restaurant.subscription_start_date).toLocaleDateString("es-ES")}</p>
            </div>
          </div>

          {restaurant.next_billing_date && (
            <div className="flex items-center gap-3">
              <CreditCardIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Próximo pago</p>
                <p className="font-medium">{new Date(restaurant.next_billing_date).toLocaleDateString("es-ES")}</p>
              </div>
            </div>
          )}
        </div>

        {!subscriptionInfo?.isInTrial && restaurant.subscription_status !== "active" && (
          <Button onClick={handleStartCheckout} className="w-full mt-4">
            Activar Suscripción
          </Button>
        )}
      </Card>

      {/* Checkout Modal */}
      {showCheckout && clientSecret && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Completar Pago</h2>
          <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </Card>
      )}

      {/* Payment History */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Historial de Pagos</h2>
        {payments.length === 0 ? (
          <p className="text-muted-foreground">No hay pagos registrados aún.</p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {payment.status === "succeeded" ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircleIcon className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">
                      {new Date(payment.billing_period_start).toLocaleDateString("es-ES")} -{" "}
                      {new Date(payment.billing_period_end).toLocaleDateString("es-ES")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {payment.status === "succeeded" ? "Pagado" : "Fallido"}
                      {payment.paid_at && ` el ${new Date(payment.paid_at).toLocaleDateString("es-ES")}`}
                    </p>
                  </div>
                </div>
                <p className="font-semibold">{payment.amount}€</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
