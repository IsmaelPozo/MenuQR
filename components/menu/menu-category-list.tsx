"use client"

import type { MenuCategory, MenuItem } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Edit, Trash2 } from "lucide-react"

interface MenuCategoryListProps {
  categories: MenuCategory[]
  items: MenuItem[]
}

export function MenuCategoryList({ categories, items }: MenuCategoryListProps) {
  const getItemsByCategory = (categoryId: string) => {
    return items.filter((item) => item.category_id === categoryId)
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

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const categoryItems = getItemsByCategory(category.id)
        return (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{category.name}</CardTitle>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/menu/categories/${category.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {categoryItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay platos en esta categoría</p>
              ) : (
                <div className="space-y-3">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{item.name}</h4>
                          {!item.is_available && (
                            <Badge variant="secondary" className="text-xs">
                              No disponible
                            </Badge>
                          )}
                        </div>
                        {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-primary">{item.price.toFixed(2)} €</span>
                        <div className="flex gap-2">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/admin/menu/items/${item.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
