import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import {
  QrCode,
  UtensilsCrossed,
  ChefHat,
  Settings,
  LogOut,
  CreditCard,
  Wallet,
  Gift,
  TrendingDown,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ensureRestaurantExists } from "@/app/actions/restaurants"

export default async function AdminPage() {
  const supabase = await createClient()

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Configuration Error</CardTitle>
            <CardDescription>
              Database connection is not configured. Please set up your Supabase environment variables.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  try {
    await ensureRestaurantExists()
  } catch (error) {
    console.error("Error ensuring restaurant exists:", error)
  }

  // Get restaurant info
  const { data: restaurant } = await supabase.from("restaurants").select("*").eq("id", user.id).single()

  const referralDiscount = restaurant?.referral_discount || 0
  const referralCount = restaurant?.referral_count || 0
  const maxReferrals = 5
  const potentialSavings = Math.max(10 - referralDiscount, 0)

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">QR Menu</h1>
              <p className="text-sm text-muted-foreground">{restaurant?.name}</p>
            </div>
          </div>
          <form action="/api/auth/logout" method="post">
            <Button variant="ghost" size="sm" type="submit">
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </form>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Panel de Administración</h2>
          <p className="text-muted-foreground">Gestiona tu restaurante, menú, mesas y pedidos desde aquí</p>
        </div>

        <Card className="mb-6 border-2 border-primary bg-gradient-to-r from-primary/5 to-amber-500/5">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Gift className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Programa de Referidos</CardTitle>
                  <CardDescription>Recomienda MenuQR y ahorra hasta 10€/mes</CardDescription>
                </div>
              </div>
              <Button asChild>
                <Link href="/admin/referrals">Ver Detalles</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg">
                <TrendingDown className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-600">-{referralDiscount.toFixed(2)}€</p>
                  <p className="text-sm text-muted-foreground">Descuento actual/mes</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg">
                <Gift className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">
                    {referralCount}/{maxReferrals}
                  </p>
                  <p className="text-sm text-muted-foreground">Referidos activos</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-background rounded-lg">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  Hasta -{potentialSavings.toFixed(2)}€ más
                </Badge>
                <p className="text-xs text-muted-foreground">Ahorro potencial</p>
              </div>
            </div>
            {referralCount === 0 && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-900 font-medium">
                  ¡Empieza a ahorrar hoy! Comparte tu código de referido y obtén 2€ de descuento por cada restaurante
                  que se registre.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <UtensilsCrossed className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Gestión de Menú</CardTitle>
              <CardDescription>Administra categorías, platos, precios y disponibilidad</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/menu">Gestionar Menú</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <QrCode className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Mesas y Códigos QR</CardTitle>
              <CardDescription>Configura mesas y genera códigos QR para cada una</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/tables">Gestionar Mesas</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <ChefHat className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Vista de Cocina</CardTitle>
              <CardDescription>Visualiza y gestiona pedidos en tiempo real</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/admin/kitchen">Ir a Cocina</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CreditCard className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Facturación</CardTitle>
              <CardDescription>Gestiona tu suscripción y pagos mensuales</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/admin/billing">Ver Facturación</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Wallet className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Pagos de Clientes</CardTitle>
              <CardDescription>Configura cómo recibir pagos de tus clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/admin/payments">Configurar Pagos</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Settings className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Configuración</CardTitle>
              <CardDescription>Ajusta la información de tu restaurante</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href="/admin/settings">Configuración</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Información del Restaurante</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{restaurant?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Teléfono</p>
              <p className="font-medium">{restaurant?.phone || "No configurado"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dirección</p>
              <p className="font-medium">{restaurant?.address || "No configurada"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Idioma Predeterminado</p>
              <p className="font-medium">{restaurant?.default_language?.toUpperCase()}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
