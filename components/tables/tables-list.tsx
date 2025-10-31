"use client"

import type { Table } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QrCode, Edit } from "lucide-react"
import Link from "next/link"

interface TablesListProps {
  tables: Table[]
}

export function TablesList({ tables }: TablesListProps) {
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
              <Button asChild variant="ghost" size="sm">
                <Link href={`/admin/tables/${table.id}/edit`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
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
