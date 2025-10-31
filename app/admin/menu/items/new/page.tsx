import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { MenuItemForm } from "@/components/menu/menu-item-form"

export default async function NewMenuItemPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: categories } = await supabase
    .from("menu_categories")
    .select("*")
    .eq("restaurant_id", user.id)
    .order("sort_order", { ascending: true })

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/menu">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Nuevo Plato</h1>
              <p className="text-sm text-muted-foreground">Añade un nuevo plato a tu menú</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <MenuItemForm restaurantId={user.id} categories={categories || []} />
      </main>
    </div>
  )
}
