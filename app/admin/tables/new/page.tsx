import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"
import { TableForm } from "@/components/tables/table-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default async function NewTablePage() {
  const supabase = await createClient()

  if (!supabase) {
    return (
      <div className="min-h-screen bg-muted/30 p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de Configuración</AlertTitle>
          <AlertDescription>
            La base de datos no está configurada. Por favor, configura las variables de entorno de Supabase.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/tables">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Nueva Mesa</h1>
              <p className="text-sm text-muted-foreground">Añade una nueva mesa a tu restaurante</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <TableForm restaurantId={user.id} />
      </main>
    </div>
  )
}
