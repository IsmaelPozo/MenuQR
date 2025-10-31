"use client"

import { useState, useEffect } from "react"
import type { Restaurant } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createAccountLink, getAccountStatus, createLoginLink } from "@/app/actions/payments"
import { CheckCircleIcon, XCircleIcon, CreditCardIcon, ExternalLinkIcon, AlertCircleIcon } from "lucide-react"

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
    } finally {
      setLoading(false)
    }
  }

  async function handleConnect() {
    setActionLoading(true)
    try {
      const url = await createAccountLink()
      window.location.href = url
    } catch (error) {
      console.error("Error creating account link:", error)
      setActionLoading(false)
    }
  }

  async function handleDashboard() {
    setActionLoading(true)
    try {
      const url = await createLoginLink()
      window.open(url, "_blank")
    } catch (error) {
      console.error("Error creating login link:", error)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Estado de la Cuenta de Pagos</h2>
            {accountStatus?.connected ? (
              <Badge className="bg-green-500">
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                Conectada
              </Badge>
            ) : (
              <Badge variant="secondary">
                <XCircleIcon className="h-3 w-3 mr-1" />
                No Conectada
              </Badge>
            )}
          </div>
          <CreditCardIcon className="h-8 w-8 text-muted-foreground" />
        </div>

        {!accountStatus?.connected && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Configura tu cuenta de pagos</p>
                <p className="text-sm text-blue-700">
                  Conecta tu cuenta bancaria para recibir pagos de tus clientes directamente. El proceso es seguro y
                  toma solo unos minutos.
                </p>
              </div>
            </div>
          </div>
        )}

        {accountStatus?.connected && (
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Detalles completados</span>
              {accountStatus.detailsSubmitted ? (
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Pagos habilitados</span>
              {accountStatus.chargesEnabled ? (
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">Transferencias habilitadas</span>
              {accountStatus.payoutsEnabled ? (
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-600" />
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {!accountStatus?.connected || !accountStatus?.detailsSubmitted ? (
            <Button onClick={handleConnect} disabled={actionLoading}>
              {accountStatus?.connected ? "Completar Configuración" : "Conectar Cuenta de Pagos"}
            </Button>
          ) : (
            <Button onClick={handleDashboard} disabled={actionLoading} variant="outline">
              <ExternalLinkIcon className="h-4 w-4 mr-2" />
              Abrir Dashboard de Stripe
            </Button>
          )}
        </div>
      </Card>

      {/* Information Card */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Cómo Funciona</h2>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              1
            </div>
            <div>
              <p className="font-medium">Conecta tu cuenta bancaria</p>
              <p className="text-sm text-muted-foreground">
                Proporciona tus datos bancarios de forma segura a través de Stripe
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              2
            </div>
            <div>
              <p className="font-medium">Los clientes pagan sus pedidos</p>
              <p className="text-sm text-muted-foreground">
                Tus clientes pueden pagar directamente desde el menú QR con tarjeta
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              3
            </div>
            <div>
              <p className="font-medium">Recibe el dinero automáticamente</p>
              <p className="text-sm text-muted-foreground">
                Los pagos se transfieren a tu cuenta bancaria automáticamente (menos una comisión del 3%)
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
