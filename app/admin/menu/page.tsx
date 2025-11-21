import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { MenuCategoryList } from "@/components/menu/menu-category-list"

export default async function MenuPage() {
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
    redirect("/auth/login")
  }

  const { data: categories, error: categoriesError } = await supabase
    .from("menu_categories")
    .select("*")
    .eq("restaurant_id", user.id)
    .order("sort_order", { ascending: true })

  if (categoriesError) {
    console.error("[v0] Error fetching categories:", categoriesError)
  }

  const { data: items, error: itemsError } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", user.id)
    .order("sort_order", { ascending: true })

  if (itemsError) {
    console.error("[v0] Error fetching items:", itemsError)
  }

  if (categoriesError || itemsError) {
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
              <h1 className="text-2xl font-bold">Gestión de Menú</h1>
            </div>
          </div>
          <div className="bg-destructive/10 border border-destructive rounded-lg p-6">
            <h2 className="text-2xl font-bold text-destructive mb-4">Error al cargar el menú</h2>
            <p className="text-muted-foreground mb-4">
              No se pudieron cargar las categorías o platos. Por favor, intenta de nuevo.
            </p>
            <Button asChild variant="outline">
              <Link href="/admin">Volver al inicio</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

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
            <h1 className="text-2xl font-bold">Gestión de Menú</h1>
            <p className="text-sm text-muted-foreground">Administra categorías y platos</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Categorías y Platos</h2>
          <Button asChild>
            <Link href="/admin/menu/categories/new">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Categoría
            </Link>
          </Button>
        </div>

        <MenuCategoryList categories={categories || []} items={items || []} />
      </div>
    </div>
  )
}
