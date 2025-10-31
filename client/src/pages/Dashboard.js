"use client"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useAuth } from "../contexts/AuthContext"
import axios from "axios"
import { Menu, QrCode, ChefHat, TrendingUp, Clock, DollarSign } from "lucide-react"

const Dashboard = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalTables: 0,
    activeOrders: 0,
    todayRevenue: 0,
    menuItems: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [tablesRes, ordersRes, menuRes] = await Promise.all([
        axios.get("/api/tables"),
        axios.get("/api/orders"),
        axios.get("/api/menu"),
      ])

      const tables = tablesRes.data.tables || []
      const orders = ordersRes.data.orders || []
      const menu = menuRes.data.menu || {}

      // Calculate stats
      const activeOrders = orders.filter((order) => !["served", "paid"].includes(order.status)).length
      const todayOrders = orders.filter((order) => {
        const orderDate = new Date(order.created_at)
        const today = new Date()
        return orderDate.toDateString() === today.toDateString()
      })
      const todayRevenue = todayOrders.reduce((sum, order) => sum + Number.parseFloat(order.total_amount), 0)
      const menuItems = Object.values(menu).reduce((total, category) => total + category.items.length, 0)

      setStats({
        totalTables: tables.length,
        activeOrders,
        todayRevenue,
        menuItems,
      })

      // Get recent orders (last 5)
      setRecentOrders(orders.slice(0, 5))
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido, {user?.name}</h1>
          <p className="text-gray-600">Aquí tienes un resumen de tu restaurante</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mesas Totales</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalTables}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <QrCode className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pedidos Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos Hoy</p>
                  <p className="text-2xl font-bold text-gray-900">€{stats.todayRevenue.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Platos en Menú</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.menuItems}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Menu className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold">Acciones Rápidas</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/menu-management"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Menu className="w-8 h-8 text-primary mb-2" />
                  <span className="text-sm font-medium">Gestionar Menú</span>
                </Link>

                <Link
                  to="/tables"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <QrCode className="w-8 h-8 text-primary mb-2" />
                  <span className="text-sm font-medium">Códigos QR</span>
                </Link>

                <Link
                  to="/kitchen"
                  className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ChefHat className="w-8 h-8 text-primary mb-2" />
                  <span className="text-sm font-medium">Cocina</span>
                </Link>

                <div className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <TrendingUp className="w-8 h-8 text-primary mb-2" />
                  <span className="text-sm font-medium">Estadísticas</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-xl font-semibold">Pedidos Recientes</h2>
            </div>
            <div className="card-body">
              {recentOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay pedidos recientes</p>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Mesa {order.table_number}</p>
                        <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleTimeString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">€{Number.parseFloat(order.total_amount).toFixed(2)}</p>
                        <span className={getStatusBadge(order.status)}>{t(`orders.${order.status}`)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
