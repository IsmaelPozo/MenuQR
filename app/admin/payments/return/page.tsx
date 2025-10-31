import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircleIcon } from "lucide-react"

export default async function PaymentReturnPage() {
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
          <CheckCircleIcon className="h-16 w-16 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Configuración Completada</h1>
        <p className="text-muted-foreground mb-6">
          Tu cuenta de pagos ha sido configurada correctamente. Ahora puedes recibir pagos de tus clientes.
        </p>
        <Button asChild>
          <Link href="/admin/payments">Ver Configuración</Link>
        </Button>
      </Card>
    </div>
  )
}
