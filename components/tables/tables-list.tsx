"use client"

import type { Table } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QrCode, Edit, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface TablesListProps {
  tables: Table[]
}

export function TablesList({ tables }: TablesListProps) {
  const [deletingTable, setDeletingTable] = useState<string | null>(null)
  const router = useRouter()

  const handleDeleteTable = async (tableId: string, tableNumber: number) => {
    if (!confirm(`¿Estás seguro de eliminar la Mesa ${tableNumber}?`)) return

    setDeletingTable(tableId)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("tables").delete().eq("id", tableId)

      if (error) throw error

      toast.success("Mesa eliminada correctamente")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error deleting table:", error)
      toast.error("Error al eliminar la mesa")
    } finally {
      setDeletingTable(null)
    }
  }

  if (tables.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">No hay mesas creadas todavía</p>
          <Button asChild>
            <Link href="/admin/tables/new">Crear primera mesa</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "occupied":
        return "bg-red-500/10 text-red-700 dark:text-red-400"
      case "reserved":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
      default:
        return ""
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Disponible"
      case "occupied":
        return "Ocupada"
      case "reserved":
        return "Reservada"
      default:
        return status
    }
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tables.map((table) => (
        <Card key={table.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold">Mesa {table.table_number}</h3>
                <Badge className={getStatusColor(table.status)}>{getStatusText(table.status)}</Badge>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/tables/${table.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTable(table.id, table.table_number)}
                  disabled={deletingTable === table.id}
                >
                  {deletingTable === table.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center p-4 bg-white rounded-lg border border-border">
                <QrCode className="h-24 w-24 text-foreground" />
              </div>
              <p className="text-xs text-center text-muted-foreground font-mono">{table.qr_code}</p>
              <Button asChild variant="outline" className="w-full bg-transparent">
                <Link href={`/menu/${table.qr_code}`} target="_blank">
                  Ver Menú
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
