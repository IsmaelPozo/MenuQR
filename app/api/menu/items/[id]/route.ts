import { createServerClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ message: "No autenticado" }, { status: 401 })
    }

    const itemId = params.id

    // Verify restaurant owns this item
    const { data: item } = await supabase.from("menu_items").select("restaurant_id").eq("id", itemId).single()

    if (!item || item.restaurant_id !== user.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 })
    }

    // Delete item
    const { error } = await supabase.from("menu_items").delete().eq("id", itemId)

    if (error) throw error

    return NextResponse.json({ message: "Plato eliminado correctamente" })
  } catch (error) {
    console.error("[v0] Error deleting item:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error al eliminar el plato" },
      { status: 500 },
    )
  }
}
