"use client"

import { useState, useEffect } from "react"
import type { Restaurant } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { createAccountLink, getAccountStatus, createLoginLink } from "@/app/actions/payments"
import {
  CheckCircleIcon,
  XCircleIcon,
  CreditCardIcon,
  ExternalLinkIcon,
  AlertCircleIcon,
  Loader2,
  Building2,
  Banknote,
  Shield,
  Zap,
} from "lucide-react"
import { toast } from "sonner"

interface PaymentConfigurationProps {
  restaurant: Restaurant
}

export function PaymentConfiguration({ restaurant }: PaymentConfigurationProps) {
  const [accountStatus, setAccountStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadAccountStatus()
  }, [])

  async function loadAccountStatus() {
    try {
      const status = await getAccountStatus()
      setAccountStatus(status)
    } catch (error) {
      console.error("Error loading account status:", error)
      toast.error("Error al cargar el estado de la cuenta")
    } finally {
      setLoading(false)
    }
  }

  async function handleConnect() {
    setActionLoading(true)
    try {
      const url = await createAccountLink()
      toast.success("Redirigiendo a Stripe...")
      window.location.href = url
    } catch (error) {
      console.error("Error creating account link:", error)
      toast.error("Error al conectar con Stripe")
      setActionLoading(false)
    }
  }

  async function handleDashboard() {
    setActionLoading(true)
    try {
      const url = await createLoginLink()
      toast.success("Abriendo dashboard de Stripe...")
      window.open(url, "_blank")
    } catch (error) {
      console.error("Error creating login link:", error)
      toast.error("Error al abrir el dashboard")
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const isFullyConfigured =
    accountStatus?.connected &&
    accountStatus?.detailsSubmitted &&
    accountStatus?.chargesEnabled &&
    accountStatus?.payoutsEnabled

  return (
    <div className="space-y-6">
      <Card className={isFullyConfigured ? "border-green-500" : ""}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Estado de la Cuenta de Pagos</CardTitle>
              <CardDescription className="mt-2">
                {isFullyConfigured
                  ? "Tu cuenta está completamente configurada y lista para recibir pagos"
                  : "Configura tu cuenta para empezar a recibir pagos de clientes"}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              {accountStatus?.connected ? (
                <Badge className="bg-green-500 text-white px-3 py-1">
                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                  Conectada
                </Badge>
              ) : (
                <Badge variant="secondary" className="px-3 py-1">
                  <XCircleIcon className="h-3 w-3 mr-1" />
                  No Conectada
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!accountStatus?.connected && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <AlertCircleIcon className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-blue-900 text-lg">Configura tu cuenta de pagos</p>
                  <p className="text-sm text-blue-700 mt-2">
                    Conecta tu cuenta bancaria para recibir pagos de tus clientes directamente. El proceso es seguro,
                    está gestionado por Stripe y toma solo unos minutos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {accountStatus?.connected && (
            <>
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground mb-3">Estado de configuración:</p>
                <div
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                    accountStatus.detailsSubmitted ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        accountStatus.detailsSubmitted ? "bg-green-100" : "bg-yellow-100"
                      }`}
                    >
                      {accountStatus.detailsSubmitted ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircleIcon className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Detalles de la cuenta</p>
                      <p className="text-xs text-muted-foreground">Información bancaria y de negocio</p>
                    </div>
                  </div>
                  {accountStatus.detailsSubmitted ? (
                    <Badge className="bg-green-500">Completado</Badge>
                  ) : (
                    <Badge variant="secondary">Pendiente</Badge>
                  )}
                </div>

                <div
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                    accountStatus.chargesEnabled ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        accountStatus.chargesEnabled ? "bg-green-100" : "bg-yellow-100"
                      }`}
                    >
                      {accountStatus.chargesEnabled ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircleIcon className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Pagos habilitados</p>
                      <p className="text-xs text-muted-foreground">Capacidad para recibir pagos</p>
                    </div>
                  </div>
                  {accountStatus.chargesEnabled ? (
                    <Badge className="bg-green-500">Activo</Badge>
                  ) : (
                    <Badge variant="secondary">Inactivo</Badge>
                  )}
                </div>

                <div
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                    accountStatus.payoutsEnabled ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        accountStatus.payoutsEnabled ? "bg-green-100" : "bg-yellow-100"
                      }`}
                    >
                      {accountStatus.payoutsEnabled ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircleIcon className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">Transferencias habilitadas</p>
                      <p className="text-xs text-muted-foreground">Retiros a tu cuenta bancaria</p>
                    </div>
                  </div>
                  {accountStatus.payoutsEnabled ? (
                    <Badge className="bg-green-500">Activo</Badge>
                  ) : (
                    <Badge variant="secondary">Inactivo</Badge>
                  )}
                </div>
              </div>

              {isFullyConfigured && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">¡Todo listo!</p>
                      <p className="text-sm text-green-700">
                        Tu cuenta está completamente configurada y puedes recibir pagos.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <Separator />

          <div className="flex gap-3">
            {!accountStatus?.connected || !accountStatus?.detailsSubmitted ? (
              <Button onClick={handleConnect} disabled={actionLoading} size="lg" className="flex-1">
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Building2 className="h-4 w-4 mr-2" />
                    {accountStatus?.connected ? "Completar Configuración" : "Conectar Cuenta de Pagos"}
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleDashboard}
                disabled={actionLoading}
                variant="outline"
                size="lg"
                className="flex-1 bg-transparent"
              >
                {actionLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Abriendo...
                  </>
                ) : (
                  <>
                    <ExternalLinkIcon className="h-4 w-4 mr-2" />
                    Abrir Dashboard de Stripe
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Cómo Funciona</CardTitle>
          <CardDescription>Proceso simple y seguro para recibir pagos de tus clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg mb-1">1. Conecta tu cuenta bancaria</p>
                <p className="text-sm text-muted-foreground">
                  Proporciona tus datos bancarios de forma segura a través de Stripe. Toda la información está
                  encriptada y protegida.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCardIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg mb-1">2. Los clientes pagan sus pedidos</p>
                <p className="text-sm text-muted-foreground">
                  Tus clientes pueden pagar directamente desde el menú QR con tarjeta de crédito/débito. El proceso es
                  rápido y seguro.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Banknote className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg mb-1">3. Recibe el dinero automáticamente</p>
                <p className="text-sm text-muted-foreground">
                  Los pagos se transfieren a tu cuenta bancaria automáticamente. Se aplica una comisión del 3% por
                  transacción.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Beneficios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-lg">
              <Shield className="h-8 w-8 text-primary mb-2" />
              <p className="font-medium mb-1">Seguro y Confiable</p>
              <p className="text-xs text-muted-foreground">Procesado por Stripe, líder mundial en pagos</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-lg">
              <Zap className="h-8 w-8 text-primary mb-2" />
              <p className="font-medium mb-1">Pagos Instantáneos</p>
              <p className="text-xs text-muted-foreground">Los clientes pagan al momento sin esperas</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-lg">
              <Banknote className="h-8 w-8 text-primary mb-2" />
              <p className="font-medium mb-1">Transferencias Automáticas</p>
              <p className="text-xs text-muted-foreground">El dinero llega a tu cuenta sin intervención</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
