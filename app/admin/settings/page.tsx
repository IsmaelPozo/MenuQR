import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { SettingsForm } from "@/components/settings/settings-form"

export default async function SettingsPage() {
  console.log("[v0] Settings page: Fetching data")
  const supabase = await createClient()

  if (!supabase) {
    console.error("[v0] Supabase client not available")
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-destructive/10 border border-destructive rounded-lg p-6">
            <h2 className="text-2xl font-bold text-destructive mb-4">Error de Configuración</h2>
            <p className="text-muted-foreground mb-4">
              No se puede acceder a la base de datos. Por favor, configura las variables de entorno de Supabase.
            </p>
            <Button asChild variant="outline">
              <Link href="/admin">Volver al inicio</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log("[v0] No user found, redirecting to login")
    redirect("/auth/login")
  }

  const { data: restaurant, error } = await supabase.from("restaurants").select("*").eq("id", user.id).single()

  if (error) {
    console.error("[v0] Error fetching restaurant:", error)
  }

  console.log("[v0] Restaurant data loaded:", restaurant?.name)

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
              <h1 className="text-2xl font-bold">Configuración</h1>
              <p className="text-sm text-muted-foreground">Actualiza la información de tu restaurante</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <SettingsForm restaurant={restaurant} />
      </main>
    </div>
  )
}
