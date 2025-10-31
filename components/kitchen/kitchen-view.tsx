"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, ChefHat } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface OrderWithDetails {
  id: string
  table_id: string
  customer_name: string | null
  total_amount: number
  status: string
  created_at: string
  tables: {
    table_number: number
  }
  order_items: Array<{
    id: string
    quantity: number
    menu_items: {
      name: string
      price: number
    }
  }>
}

interface KitchenViewProps {
  orders: OrderWithDetails[]
}

export function KitchenView({ orders }: KitchenViewProps) {
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set())
  const router = useRouter()

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrders((prev) => new Set(prev).add(orderId))
    const supabase = createClient()

    try {
      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("Error updating order:", error)
      alert("Error al actualizar el pedido")
    } finally {
      setUpdatingOrders((prev) => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400"
      case "preparing":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400"
      case "ready":
        return "bg-green-500/10 text-green-700 dark:text-green-400"
      case "served":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400"
      default:
        return ""
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "received":
        return "Recibido"
      case "preparing":
        return "Preparando"
      case "ready":
        return "Listo"
      case "served":
        return "Servido"
      default:
        return status
    }
  }

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "received":
        return "preparing"
      case "preparing":
        return "ready"
      case "ready":
        return "served"
      default:
        return null
    }
  }

  const getNextStatusText = (currentStatus: string) => {
    switch (currentStatus) {
      case "received":
        return "Comenzar a Preparar"
      case "preparing":
        return "Marcar como Listo"
      case "ready":
        return "Marcar como Servido"
      default:
        return null
    }
  }

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return "Ahora"
    if (diffMins === 1) return "1 min"
    if (diffMins < 60) return `${diffMins} mins`

    const diffHours = Math.floor(diffMins / 60)
    if (diffHours === 1) return "1 hora"
    return `${diffHours} horas`
  }

  const ordersByStatus = {
    received: orders.filter((o) => o.status === "received"),
    preparing: orders.filter((o) => o.status === "preparing"),
    ready: orders.filter((o) => o.status === "ready"),
    served: orders.filter((o) => o.status === "served"),
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <ChefHat className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No hay pedidos pendientes</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {/* Received Orders */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400">{ordersByStatus.received.length}</Badge>
          Recibidos
        </h2>
        {ordersByStatus.received.map((order) => (
          <Card key={order.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">Mesa {order.tables.table_number}</CardTitle>
                  {order.customer_name && <p className="text-sm text-muted-foreground">{order.customer_name}</p>}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {getTimeSince(order.created_at)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.menu_items.name}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                disabled={updatingOrders.has(order.id)}
                className="w-full"
                size="sm"
              >
                {updatingOrders.has(order.id) ? "Actualizando..." : getNextStatusText(order.status)}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preparing Orders */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
            {ordersByStatus.preparing.length}
          </Badge>
          Preparando
        </h2>
        {ordersByStatus.preparing.map((order) => (
          <Card key={order.id} className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">Mesa {order.tables.table_number}</CardTitle>
                  {order.customer_name && <p className="text-sm text-muted-foreground">{order.customer_name}</p>}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {getTimeSince(order.created_at)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.menu_items.name}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                disabled={updatingOrders.has(order.id)}
                className="w-full"
                size="sm"
              >
                {updatingOrders.has(order.id) ? "Actualizando..." : getNextStatusText(order.status)}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ready Orders */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">{ordersByStatus.ready.length}</Badge>
          Listos
        </h2>
        {ordersByStatus.ready.map((order) => (
          <Card key={order.id} className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">Mesa {order.tables.table_number}</CardTitle>
                  {order.customer_name && <p className="text-sm text-muted-foreground">{order.customer_name}</p>}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {getTimeSince(order.created_at)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.menu_items.name}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                disabled={updatingOrders.has(order.id)}
                className="w-full"
                size="sm"
              >
                {updatingOrders.has(order.id) ? "Actualizando..." : getNextStatusText(order.status)}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Served Orders */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Badge className="bg-gray-500/10 text-gray-700 dark:text-gray-400">{ordersByStatus.served.length}</Badge>
          Servidos
        </h2>
        {ordersByStatus.served.map((order) => (
          <Card key={order.id} className="border-l-4 border-l-gray-500 opacity-75">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">Mesa {order.tables.table_number}</CardTitle>
                  {order.customer_name && <p className="text-sm text-muted-foreground">{order.customer_name}</p>}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {getTimeSince(order.created_at)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.menu_items.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
