import { createClient } from "@/lib/supabase/server"
import { PaymentConfiguration } from "@/components/payments/payment-configuration"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function PaymentsPage() {
  console.log("[v0] Payments page: Loading")
  const supabase = await createClient()

  if (!supabase) {
    console.error("[v0] Payments page: Supabase client not available")
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de Configuración</AlertTitle>
          <AlertDescription>
            No se puede acceder a la base de datos. Por favor, configura las variables de entorno de Supabase.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error("[v0] Payments page: No user found")
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de Autenticación</AlertTitle>
          <AlertDescription>No se pudo verificar tu sesión. Por favor, inicia sesión nuevamente.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link href="/auth/login">Iniciar Sesión</Link>
          </Button>
        </div>
      </div>
    )
  }

  console.log("[v0] Payments page: Fetching restaurant data for user:", user.id)

  const { data: restaurant, error } = await supabase.from("restaurants").select("*").eq("id", user.id).single()

  if (error) {
    console.error("[v0] Payments page: Error fetching restaurant:", error)
  }

  if (!restaurant) {
    console.warn("[v0] Payments page: No restaurant found for user")
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Restaurante No Encontrado</AlertTitle>
          <AlertDescription>
            No se encontró información del restaurante. Por favor, completa la configuración inicial.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <Link href="/admin/settings">Ir a Configuración</Link>
          </Button>
        </div>
      </div>
    )
  }

  console.log("[v0] Payments page: Restaurant found:", restaurant.name)

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Configuración de Pagos</h1>
              <p className="text-sm text-muted-foreground">Conecta tu cuenta de Stripe para recibir pagos</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        <PaymentConfiguration restaurant={restaurant} />
      </main>
    </div>
  )
}
