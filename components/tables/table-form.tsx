"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Table } from "@/lib/types"

interface TableFormProps {
  restaurantId: string
  table?: Table
}

export function TableForm({ restaurantId, table }: TableFormProps) {
  const [tableNumber, setTableNumber] = useState(table?.table_number?.toString() || "")
  const [status, setStatus] = useState<"available" | "occupied" | "reserved">(table?.status || "available")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      if (table) {
        const { error } = await supabase
          .from("tables")
          .update({
            table_number: Number.parseInt(tableNumber),
            status,
          })
          .eq("id", table.id)

        if (error) throw error
      } else {
        const qrCode = `table_${restaurantId}_${tableNumber}_${Date.now()}`
        const { error } = await supabase.from("tables").insert({
          restaurant_id: restaurantId,
          table_number: Number.parseInt(tableNumber),
          qr_code: qrCode,
          status,
        })

        if (error) throw error
      }

      router.push("/admin/tables")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al guardar la mesa")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{table ? "Editar Mesa" : "Nueva Mesa"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="table_number">Número de Mesa</Label>
            <Input
              id="table_number"
              type="number"
              placeholder="1"
              required
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={status} onValueChange={(value: "available" | "occupied" | "reserved") => setStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="occupied">Ocupada</SelectItem>
                <SelectItem value="reserved">Reservada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Guardando..." : table ? "Actualizar" : "Crear Mesa"}
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
