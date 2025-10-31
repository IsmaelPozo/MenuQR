import { createClient } from "@/lib/supabase/server"
import { CustomerMenu } from "@/components/customer/customer-menu"

export default async function DemoMenuPage() {
  const supabase = await createClient()

  // Get demo restaurant (first one)
  const { data: restaurant } = await supabase.from("restaurants").select("*").limit(1).single()

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No hay restaurantes disponibles para la demo</p>
      </div>
    )
  }

  // Get first table
  const { data: table } = await supabase.from("tables").select("*").eq("restaurant_id", restaurant.id).limit(1).single()

  if (!table) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No hay mesas disponibles para la demo</p>
      </div>
    )
  }

  // Get menu categories and items
  const { data: categories } = await supabase
    .from("menu_categories")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .order("sort_order", { ascending: true })

  const { data: items } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", restaurant.id)
    .eq("is_available", true)
    .order("sort_order", { ascending: true })

  return (
    <CustomerMenu
      table={{ ...table, restaurants: restaurant }}
      restaurant={restaurant}
      categories={categories || []}
      items={items || []}
    />
  )
}
