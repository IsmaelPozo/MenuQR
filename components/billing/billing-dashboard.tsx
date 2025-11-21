"use client"

import { useState, useEffect } from "react"
import type { Restaurant, SubscriptionPayment } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getSubscriptionStatus, startSubscriptionCheckout, getPaymentHistory } from "@/app/actions/subscription"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import {
  CalendarIcon,
  CreditCardIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  Gift,
  TrendingDown,
  Download,
  Loader2,
  Euro,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

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
  const [checkoutLoading, setCheckoutLoading] = useState(false)

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
      toast.error("Error al cargar los datos de facturación")
    } finally {
      setLoading(false)
    }
  }

  async function handleStartCheckout() {
    setCheckoutLoading(true)
    try {
      const secret = await startSubscriptionCheckout()
      setClientSecret(secret)
      setShowCheckout(true)
      toast.success("Redirigiendo al proceso de pago...")
    } catch (error) {
      console.error("Error starting checkout:", error)
      toast.error("Error al iniciar el proceso de pago")
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
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
        <Card className="border-green-500 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingDown className="h-7 w-7 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-900 text-lg">¡Descuento Activo por Referidos!</p>
                  <p className="text-sm text-green-700 mt-1">
                    Estás ahorrando <span className="font-bold">{referralDiscount.toFixed(2)}€</span> al mes gracias a
                    tus referidos
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" className="bg-white hover:bg-green-50">
                <Link href="/admin/referrals">
                  <Gift className="h-4 w-4 mr-2" />
                  Ver Referidos
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Estado de la Suscripción</CardTitle>
              <CardDescription className="mt-2">Gestiona tu plan y facturación mensual</CardDescription>
            </div>
            <Badge className={`${statusColors[restaurant.subscription_status]} text-white px-3 py-1`}>
              {statusLabels[restaurant.subscription_status]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Precio mensual</p>
                {referralDiscount > 0 ? (
                  <div className="flex items-baseline gap-3">
                    <p className="text-3xl font-bold text-green-600">{finalPrice.toFixed(2)}€</p>
                    <p className="text-lg text-muted-foreground line-through">{basePrice.toFixed(2)}€</p>
                  </div>
                ) : (
                  <p className="text-3xl font-bold">{basePrice.toFixed(2)}€</p>
                )}
                {referralDiscount > 0 && (
                  <p className="text-sm text-green-600 mt-1 font-medium">
                    Ahorro de {referralDiscount.toFixed(2)}€/mes
                  </p>
                )}
              </div>
              <Euro className="h-12 w-12 text-muted-foreground/30" />
            </div>
          </div>

          {subscriptionInfo?.isInTrial && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-blue-900">Período de prueba gratuito activo</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Te quedan <span className="font-bold">{subscriptionInfo.daysUntilTrialEnd} días</span> de prueba
                    gratuita. Los primeros 3 meses son completamente gratis.
                  </p>
                </div>
              </div>
            </div>
          )}

          {restaurant.subscription_status === "past_due" && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircleIcon className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-red-900">Pago pendiente - Acción requerida</p>
                  <p className="text-sm text-red-700 mt-1">
                    Tu último pago no se pudo procesar. Por favor, actualiza tu método de pago para continuar usando el
                    servicio.
                  </p>
                </div>
              </div>
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
              <CalendarIcon className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fecha de inicio</p>
                <p className="font-semibold mt-1">
                  {new Date(restaurant.subscription_start_date).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {restaurant.next_billing_date && (
              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                <CreditCardIcon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Próximo pago</p>
                  <p className="font-semibold mt-1">
                    {new Date(restaurant.next_billing_date).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {!subscriptionInfo?.isInTrial && restaurant.subscription_status !== "active" && (
            <Button onClick={handleStartCheckout} className="w-full" size="lg" disabled={checkoutLoading}>
              {checkoutLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  Activar Suscripción
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {showCheckout && clientSecret && (
        <Card>
          <CardHeader>
            <CardTitle>Completar Pago</CardTitle>
            <CardDescription>Ingresa los datos de tu tarjeta para activar tu suscripción</CardDescription>
          </CardHeader>
          <CardContent>
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Historial de Pagos</CardTitle>
          <CardDescription>Revisa todos tus pagos y facturas anteriores</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCardIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No hay pagos registrados aún.</p>
              <p className="text-sm text-muted-foreground mt-1">Tus pagos aparecerán aquí una vez realizados.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        payment.status === "succeeded" ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      {payment.status === "succeeded" ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircleIcon className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {new Date(payment.billing_period_start).toLocaleDateString("es-ES", {
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.billing_period_start).toLocaleDateString("es-ES")} -{" "}
                        {new Date(payment.billing_period_end).toLocaleDateString("es-ES")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {payment.status === "succeeded" ? "Pagado" : "Fallido"}
                        {payment.paid_at && ` el ${new Date(payment.paid_at).toLocaleDateString("es-ES")}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold">{payment.amount.toFixed(2)}€</p>
                    {payment.status === "succeeded" && (
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
