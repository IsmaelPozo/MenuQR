import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircleIcon } from "lucide-react"

export default async function PaymentRefreshPage() {
  const supabase = await createClient()

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
