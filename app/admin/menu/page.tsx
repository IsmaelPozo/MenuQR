import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { MenuCategoryList } from "@/components/menu/menu-category-list"

export default async function MenuPage() {
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

  const { data: items } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", user.id)
    .order("sort_order", { ascending: true })

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
              <h1 className="text-2xl font-bold">Gestión de Menú</h1>
              <p className="text-sm text-muted-foreground">Administra categorías y platos</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Categorías y Platos</h2>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/admin/menu/categories/new">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Categoría
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/menu/items/new">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Plato
              </Link>
            </Button>
          </div>
        </div>

        <MenuCategoryList categories={categories || []} items={items || []} />
      </main>
    </div>
  )
}
