"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface CategoryFormProps {
  restaurantId: string
  category?: {
    id: string
    name: string
    sort_order: number
  }
}

export function CategoryForm({ restaurantId, category }: CategoryFormProps) {
  const [name, setName] = useState(category?.name || "")
  const [sortOrder, setSortOrder] = useState(category?.sort_order?.toString() || "0")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      if (category) {
        const { error } = await supabase
          .from("menu_categories")
          .update({
            name,
            sort_order: Number.parseInt(sortOrder),
          })
          .eq("id", category.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("menu_categories").insert({
          restaurant_id: restaurantId,
          name,
          sort_order: Number.parseInt(sortOrder),
        })

        if (error) throw error
      }

      router.push("/admin/menu")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al guardar la categoría")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{category ? "Editar Categoría" : "Nueva Categoría"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Categoría</Label>
            <Input
              id="name"
              type="text"
              placeholder="Ej: Entrantes, Platos Principales, Postres"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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
            <p className="text-xs text-muted-foreground">Las categorías se ordenarán de menor a mayor número</p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : category ? "Actualizar" : "Crear Categoría"}
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
