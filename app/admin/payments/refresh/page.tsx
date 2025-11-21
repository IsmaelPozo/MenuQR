import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircleIcon, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default async function PaymentRefreshPage() {
  const supabase = await createClient()

  if (!supabase) {
    return (
      <div className="container mx-auto py-16 px-4 max-w-2xl">
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
    <div className="container mx-auto py-16 px-4 max-w-2xl">
      <Card className="p-8 text-center">
        <div className="flex justify-center mb-4">
          <AlertCircleIcon className="h-16 w-16 text-yellow-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Configuración Incompleta</h1>
        <p className="text-muted-foreground mb-6">
          La configuración de tu cuenta de pagos no se completó. Por favor, intenta nuevamente.
        </p>
        <Button asChild>
          <Link href="/admin/payments">Reintentar</Link>
        </Button>
      </Card>
    </div>
  )
}
