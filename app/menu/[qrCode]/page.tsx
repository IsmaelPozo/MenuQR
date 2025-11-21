import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { CustomerMenu } from "@/components/customer/customer-menu"

interface MenuPageProps {
  params: Promise<{
    qrCode: string
  }>
}

export default async function MenuPage({ params }: MenuPageProps) {
  const { qrCode } = await params
  const supabase = await createClient()
  if (!supabase) throw new Error('Could not create supabase client')

  // Get table info
  const { data: table } = await supabase.from("tables").select("*, restaurants(*)").eq("qr_code", qrCode).single()

  if (!table) {
    notFound()
  }

  // Get menu categories and items
  const { data: categories } = await supabase
    .from("menu_categories")
    .select("*")
    .eq("restaurant_id", table.restaurant_id)
    .order("sort_order", { ascending: true })

  const { data: items } = await supabase
    .from("menu_items")
    .select("*")
    .eq("restaurant_id", table.restaurant_id)
    .eq("is_available", true)
    .order("sort_order", { ascending: true })
  
  return <CustomerMenu table={table} restaurant={table.restaurants} categories={categories || []} items={items || []} />
}
