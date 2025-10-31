import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { TablesList } from "@/components/tables/tables-list"

export default async function TablesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: tables } = await supabase
    .from("tables")
    .select("*")
    .eq("restaurant_id", user.id)
    .order("table_number", { ascending: true })

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
              <h1 className="text-2xl font-bold">Gestión de Mesas</h1>
              <p className="text-sm text-muted-foreground">Administra las mesas y códigos QR</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
      </main>
    </div>
  )
}
