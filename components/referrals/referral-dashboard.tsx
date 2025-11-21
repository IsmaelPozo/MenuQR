"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Gift, Copy, Mail, MessageCircle, Users, TrendingDown, Euro, Check } from "lucide-react"
import { shareReferralCode } from "@/app/actions/referrals"
import { useState } from "react"
import toast from "react-hot-toast"

interface ReferralData {
  referralCode: string
  referralCount: number
  currentDiscount: number
  monthlyFee: number
  finalPrice: number
  referrals: Array<{
    id: string
    status: string
    created_at: string
    referred: {
      name: string
      email: string
      subscription_status: string
    }
  }>
  potentialSavings: number
  referralsNeeded: number
  maxReferrals: number
}

export function ReferralDashboard({ data }: { data: ReferralData }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async (method: "email" | "whatsapp" | "copy") => {
    const url = await shareReferralCode(method, data.referralCode)

    if (method === "copy") {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast.success("¡Enlace copiado al portapapeles!")
      setTimeout(() => setCopied(false), 2000)
    } else {
      window.open(url, "_blank")
    }
  }

  const progressPercentage = (data.referralCount / data.maxReferrals) * 100

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Descuento Actual</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">-{data.currentDiscount.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">Por mes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Precio Final</CardTitle>
            <Euro className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.finalPrice.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">De {data.monthlyFee.toFixed(2)}€ originales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referidos Activos</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.referralCount}</div>
            <p className="text-xs text-muted-foreground">De {data.maxReferrals} máximo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ahorro Potencial</CardTitle>
            <Gift className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">-{data.potentialSavings.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">{data.referralsNeeded} referidos más</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso de Descuentos</CardTitle>
          <CardDescription>Cada referido activo te da 2€ de descuento. Máximo: 10€ (precio mínimo 15€)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-gradient-to-r from-primary to-amber-500 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-sm">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col items-center">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      i < data.referralCount ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i < data.referralCount ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className="text-xs mt-1">-{i * 2}€</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Code Card */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Tu Código de Referido
          </CardTitle>
          <CardDescription>Comparte este código con otros restaurantes para obtener descuentos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={data.referralCode} readOnly className="font-mono text-lg font-bold" />
            <Button variant="outline" size="icon" onClick={() => handleShare("copy")}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => handleShare("email")}>
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => handleShare("whatsapp")}>
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Cómo funciona:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Comparte tu código con otros restaurantes</li>
              <li>Cuando se registren con tu código, ambos obtienen 2€ de descuento</li>
              <li>El descuento se aplica cuando empiezan a pagar (después del período de prueba)</li>
              <li>Puedes acumular hasta 10€ de descuento (5 referidos)</li>
              <li>El precio mínimo es 15€/mes</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle>Tus Referidos</CardTitle>
          <CardDescription>Restaurantes que se han registrado con tu código</CardDescription>
        </CardHeader>
        <CardContent>
          {data.referrals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aún no tienes referidos</p>
              <p className="text-sm">¡Comparte tu código para empezar a ahorrar!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{referral.referred.name}</p>
                    <p className="text-sm text-muted-foreground">{referral.referred.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Registrado: {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      referral.status === "active" ? "default" : referral.status === "pending" ? "secondary" : "outline"
                    }
                  >
                    {referral.status === "active"
                      ? "Activo (-2€)"
                      : referral.status === "pending"
                        ? "Pendiente"
                        : "Inactivo"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
