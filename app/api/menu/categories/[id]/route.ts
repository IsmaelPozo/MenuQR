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

    const categoryId = params.id

    // Verify restaurant owns this category
    const { data: category } = await supabase
      .from("menu_categories")
      .select("restaurant_id")
      .eq("id", categoryId)
      .single()

    if (!category || category.restaurant_id !== user.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 })
    }

    // Delete category
    const { error } = await supabase.from("menu_categories").delete().eq("id", categoryId)

    if (error) throw error

    return NextResponse.json({ message: "Categoría eliminada correctamente" })
  } catch (error) {
    console.error("[v0] Error deleting category:", error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Error al eliminar la categoría" },
      { status: 500 },
    )
  }
}
