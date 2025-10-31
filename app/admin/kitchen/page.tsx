import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { KitchenView } from "@/components/kitchen/kitchen-view"

export default async function KitchenPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      *,
      tables(table_number),
      order_items(
        *,
        menu_items(name, price)
      )
    `,
    )
    .eq("restaurant_id", user.id)
    .eq("is_fully_paid", true)
    .neq("status", "paid")
    .order("created_at", { ascending: true })

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
              <h1 className="text-2xl font-bold">Vista de Cocina</h1>
              <p className="text-sm text-muted-foreground">Pedidos pagados listos para preparar</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <KitchenView orders={orders || []} />
      </main>
    </div>
  )
}
