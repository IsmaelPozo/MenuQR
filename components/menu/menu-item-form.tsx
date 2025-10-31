"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { MenuCategory, MenuItem } from "@/lib/types"

interface MenuItemFormProps {
  restaurantId: string
  categories: MenuCategory[]
  item?: MenuItem
}

export function MenuItemForm({ restaurantId, categories, item }: MenuItemFormProps) {
  const [name, setName] = useState(item?.name || "")
  const [description, setDescription] = useState(item?.description || "")
  const [price, setPrice] = useState(item?.price?.toString() || "")
  const [categoryId, setCategoryId] = useState(item?.category_id || "")
  const [isAvailable, setIsAvailable] = useState(item?.is_available ?? true)
  const [sortOrder, setSortOrder] = useState(item?.sort_order?.toString() || "0")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (!categoryId) {
      setError("Por favor selecciona una categoría")
      setIsLoading(false)
      return
    }

    const supabase = createClient()

    try {
      if (item) {
        const { error } = await supabase
          .from("menu_items")
          .update({
            name,
            description,
            price: Number.parseFloat(price),
            category_id: categoryId,
            is_available: isAvailable,
            sort_order: Number.parseInt(sortOrder),
          })
          .eq("id", item.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("menu_items").insert({
          restaurant_id: restaurantId,
          category_id: categoryId,
          name,
          description,
          price: Number.parseFloat(price),
          is_available: isAvailable,
          sort_order: Number.parseInt(sortOrder),
        })

        if (error) throw error
      }

      router.push("/admin/menu")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al guardar el plato")
    } finally {
      setIsLoading(false)
    }
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">Primero debes crear al menos una categoría</p>
          <Button asChild>
            <a href="/admin/menu/categories/new">Crear Categoría</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{item ? "Editar Plato" : "Nuevo Plato"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Plato</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ej: Paella Valenciana"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe los ingredientes y características del plato"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio (€)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="12.50"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sort_order">Orden de Visualización</Label>
              <Input
                id="sort_order"
                type="number"
                placeholder="0"
                required
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Switch id="available" checked={isAvailable} onCheckedChange={setIsAvailable} />
              <Label htmlFor="available">Disponible</Label>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : item ? "Actualizar" : "Crear Plato"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
