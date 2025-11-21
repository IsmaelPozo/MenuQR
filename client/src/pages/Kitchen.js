"use client"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import axios from "axios"
import toast from "react-hot-toast"
import { Clock, CheckCircle, Truck, DollarSign } from "lucide-react"

const Kitchen = () => {
  const { t } = useTranslation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchOrders()
    // Set up polling for real-time updates
    const interval = setInterval(fetchOrders, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [filter])

  const fetchOrders = async () => {
    try {
      const params = filter !== "all" ? { status: filter } : {}
      const response = await axios.get("/api/orders", { params })
      setOrders(response.data.orders || [])
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("Error al cargar los pedidos")
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.patch(`/api/orders/${orderId}/status`, { status })
      toast.success(`Pedido actualizado a: ${t(`orders.${status}`)}`)
      fetchOrders()
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Error al actualizar el estado del pedido")
    }
  }

  const updatePaymentStatus = async (orderId, paymentStatus) => {
    try {
      await axios.patch(`/api/orders/${orderId}/payment`, { paymentStatus })
      toast.success("Estado de pago actualizado")
      fetchOrders()
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast.error("Error al actualizar el estado de pago")
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "received":
        return <Clock className="w-5 h-5" />
      case "preparing":
        return <Clock className="w-5 h-5 text-orange-500" />
      case "ready":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "served":
        return <Truck className="w-5 h-5 text-blue-500" />
      default:
        return <Clock className="w-5 h-5" />
    }
  }

  const getStatusBadge = (status) => {
    const statusClasses = {
      received: "status-badge status-received",
      preparing: "status-badge status-preparing",
      ready: "status-badge status-ready",
      served: "status-badge status-served",
    }
    return statusClasses[status] || "status-badge"
  }

  const getTimeElapsed = (timestamp) => {
    const now = new Date()
    const orderTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now - orderTime) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes} min`
    } else {
      const hours = Math.floor(diffInMinutes / 60)
      const minutes = diffInMinutes % 60
      return `${hours}h ${minutes}min`
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (filter === "all") return true
    return order.status === filter
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("orders.kitchen")}</h1>
            <p className="text-gray-600">Gestiona los pedidos de tu restaurante</p>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-secondary"}`}
            >
              Todos ({orders.length})
            </button>
            <button
              onClick={() => setFilter("received")}
              className={`btn btn-sm ${filter === "received" ? "btn-primary" : "btn-secondary"}`}
            >
              Recibidos ({orders.filter((o) => o.status === "received").length})
            </button>
            <button
              onClick={() => setFilter("preparing")}
              className={`btn btn-sm ${filter === "preparing" ? "btn-primary" : "btn-secondary"}`}
            >
              Preparando ({orders.filter((o) => o.status === "preparing").length})
            </button>
            <button
              onClick={() => setFilter("ready")}
              className={`btn btn-sm ${filter === "ready" ? "btn-primary" : "btn-secondary"}`}
            >
              Listos ({orders.filter((o) => o.status === "ready").length})
            </button>
          </div>
        </div>

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === "all" ? "No hay pedidos" : `No hay pedidos ${t(`orders.${filter}`)}`}
              </h3>
              <p className="text-gray-600">Los nuevos pedidos aparecerán aquí automáticamente</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className={`card border-l-4 ${
                  order.status === "received"
                    ? "border-l-blue-500"
                    : order.status === "preparing"
                      ? "border-l-orange-500"
                      : order.status === "ready"
                        ? "border-l-green-500"
                        : "border-l-gray-500"
                }`}
              >
                <div className="card-header">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <h3 className="font-semibold">Mesa {order.table_number}</h3>
                    </div>
                    <div className="text-right">
                      <span className={getStatusBadge(order.status)}>{t(`orders.${order.status}`)}</span>
                      <p className="text-sm text-gray-500 mt-1">{getTimeElapsed(order.created_at)}</p>
                    </div>
                  </div>
                </div>

                <div className="card-body">
                  {/* Customer Info */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Cliente: {order.customer_name || "Cliente"}</p>
                    <p className="text-sm text-gray-600">Pedido: #{order.id.toString().slice(-6)}</p>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Elementos:</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span>{item.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">{item.quantity}</span>
                            <span className="font-medium">€{item.price.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Total */}
                  <div className="border-t pt-3 mb-4">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total:</span>
                      <span className="text-primary">€{Number.parseFloat(order.total_amount).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Status Update Buttons */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updateOrderStatus(order.id, "received")}
                        className={`btn btn-sm ${order.status === "received" ? "btn-primary" : "btn-secondary"}`}
                        disabled={order.status === "received"}
                      >
                        Recibido
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "preparing")}
                        className={`btn btn-sm ${order.status === "preparing" ? "btn-primary" : "btn-secondary"}`}
                        disabled={order.status === "preparing"}
                      >
                        Preparando
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "ready")}
                        className={`btn btn-sm ${order.status === "ready" ? "btn-primary" : "btn-secondary"}`}
                        disabled={order.status === "ready"}
                      >
                        Listo
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "served")}
                        className={`btn btn-sm ${order.status === "served" ? "btn-primary" : "btn-secondary"}`}
                        disabled={order.status === "served"}
                      >
                        Servido
                      </button>
                    </div>

                    {/* Payment Status */}
                    {order.status === "served" && (
                      <div className="border-t pt-3">
                        <p className="text-sm font-medium mb-2">Estado de Pago:</p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => updatePaymentStatus(order.id, "individual")}
                            className={`btn btn-sm ${
                              order.payment_status === "individual" ? "btn-success" : "btn-secondary"
                            }`}
                          >
                            <DollarSign size={14} />
                            Individual
                          </button>
                          <button
                            onClick={() => updatePaymentStatus(order.id, "table_complete")}
                            className={`btn btn-sm ${
                              order.payment_status === "table_complete" ? "btn-success" : "btn-secondary"
                            }`}
                          >
                            <DollarSign size={14} />
                            Mesa
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Kitchen
