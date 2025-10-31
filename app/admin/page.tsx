import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { QrCode, UtensilsCrossed, ChefHat, Settings, LogOut } from "lucide-react"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get restaurant info
  const { data: restaurant } = await supabase.from("restaurants").select("*").eq("id", user.id).single()

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
