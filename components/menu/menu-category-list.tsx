"use client"

import type { MenuCategory, MenuItem } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DeleteConfirmationDialog } from "@/components/ui/delete-confirmation-dialog"
import Link from "next/link"
import { Edit, Trash2, Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { MenuItemForm } from "./menu-item-form"
import { CategoryForm } from "./category-form"


interface MenuCategoryListProps {
  categories: MenuCategory[]
  items: MenuItem[]
}

export function MenuCategoryList({ categories, items }: MenuCategoryListProps) {
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null)
  const [deletingItem, setDeletingItem] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteDialogData, setDeleteDialogData] = useState<{
    type: "category" | "item"
    id: string
    name: string
  } | null>(null)
  const router = useRouter()

  const getItemsByCategory = (categoryId: string) => {
    return items.filter((item) => item.category_id === categoryId)
  }

  const getCategoryName = (name: unknown): string => {
    if (typeof name === "string") return name
    if (typeof name === "object" && name !== null) {
      const obj = name as Record<string, string>
      // Try to get English first, then Spanish, then first available
      return obj.en || obj.es || Object.values(obj)[0] || "Sin nombre"
    }
    return "Sin nombre"
  }

  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)


  const getItemName = (name: unknown): string => {
    if (typeof name === "string") return name
    if (typeof name === "object" && name !== null) {
      const obj = name as Record<string, string>
      return obj.en || obj.es || Object.values(obj)[0] || "Sin nombre"
    }
    return "Sin nombre"
  }

  const getItemDescription = (description: unknown): string => {
    if (typeof description === "string") return description
    if (typeof description === "object" && description !== null) {
      const obj = description as Record<string, string>
      return obj.en || obj.es || Object.values(obj)[0] || ""
    }
    return ""
  }

  const handleDeleteClick = (type: "category" | "item", id: string, name: string) => {
    setDeleteDialogData({ type, id, name })
    setShowDeleteDialog(true)
  }

  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null)


  const handleConfirmDelete = async () => {
    if (!deleteDialogData) return

    const { type, id, name } = deleteDialogData

    if (type === "category") {
      setDeletingCategory(id)
    } else {
      setDeletingItem(id)
    }
        const supabase = createClient()
    if (type === "category") {
       const { error } = await supabase
          .from("menu_items")
          .delete()
          .eq("category_id", id)
           if (error) throw error;
    } else {
       const { error } = await supabase
          .from("menu_items")
          .delete()
          .eq("id", id)
           if (error) throw error;
    }
        const { error } = await supabase
          .from("menu_categories")
          .delete()
          .eq("id", id)

       if (error) throw error;

      const message = type === "category" ? "Categoría eliminada correctamente" : "Plato eliminado correctamente"
      toast.success(message)
      router.refresh()
    
      if (type === "category") {
        setDeletingCategory(null)
      } else {
        setDeletingItem(null)
      }
      setShowDeleteDialog(false)
      setDeleteDialogData(null)
    }
  
  

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">No hay categorías creadas todavía</p>
          <Button asChild>
            <Link href="/admin/menu/categories/new">Crear primera categoría</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (editingItem) {
    return (
      <div className="space-y-6">
        <MenuItemForm
          restaurantId={editingItem.restaurant_id}
          defaultLanguage="es"
          categories={categories}
          item={editingItem}
          onDone={() => {
            setEditingItem(null)
            router.refresh() // 👈 actualiza el listado
          }}
        />
      </div>
    )
  }

if (editingCategory) {
  return (
    <div className="space-y-6">
      <CategoryForm
        restaurantId={editingCategory.restaurant_id}
        defaultLanguage="es"
        category={{
          ...editingCategory,
          name: typeof editingCategory.name === "string"
            ? { es: editingCategory.name }
            : editingCategory.name,
        }}
        onDone={() => {
          setEditingCategory(null)
          router.refresh()
        }}
      />
    </div>
  )
}



  return (
    <>
      <div className="space-y-6">
        {categories.map((category) => {
          const categoryItems = getItemsByCategory(category.id)
          const categoryName = getCategoryName(category.name)
          return (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{categoryName}</CardTitle>
                  <div className="flex gap-2">
                    <Button asChild variant="default" size="sm">
                      <Link href={`/admin/menu/items/new?category=${category.id}`}>
                        <Plus className="h-4 w-4 mr-1" />
                        Añadir Plato
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingCategory(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick("category", category.id, categoryName)}
                      disabled={deletingCategory === category.id}
                    >
                      {deletingCategory === category.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {categoryItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay platos en esta categoría</p>
                ) : (
                  <div className="space-y-3">
                    {categoryItems.map((item) => {
                      const itemName = getItemName(item.name)
                      const itemDescription = getItemDescription(item.description)
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{itemName}</h4>
                              {!item.is_available && (
                                <Badge variant="secondary" className="text-xs">
                                  No disponible
                                </Badge>
                              )}
                            </div>
                            {itemDescription && <p className="text-sm text-muted-foreground">{itemDescription}</p>}
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-semibold text-primary">{item.price.toFixed(2)} €</span>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingItem(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick("item", item.id, itemName)}
                                disabled={deletingItem === item.id}
                              >
                                {deletingItem === item.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                                ) : (
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        title={`Eliminar ${deleteDialogData?.type === "category" ? "categoría" : "plato"}`}
        description={`¿Estás seguro de eliminar "${deleteDialogData?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false)
          setDeleteDialogData(null)
        }}
        isLoading={deletingCategory !== null || deletingItem !== null}
      />
    </>
  )
}
