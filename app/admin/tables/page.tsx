import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { TablesList } from "@/components/tables/tables-list"

export default async function TablesPage() {
  console.log("[v0] Tables page: Fetching data")
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

  const { data: tables, error } = await supabase
    .from("tables")
    .select("*")
    .eq("restaurant_id", user.id)
    .order("table_number", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching tables:", error)
  }

  console.log("[v0] Tables data loaded:", tables?.length)

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Gestión de Mesas</h1>
            <p className="text-sm text-muted-foreground">Administra las mesas y códigos QR</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Mesas del Restaurante</h2>
          <Button asChild>
            <Link href="/admin/tables/new">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Mesa
            </Link>
          </Button>
        </div>

        <TablesList tables={tables || []} />
      </div>
    </div>
  )
}
