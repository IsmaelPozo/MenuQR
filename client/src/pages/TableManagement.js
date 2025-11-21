"use client"
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import axios from "axios"
import toast from "react-hot-toast"
import { QRCodeCanvas } from "qrcode.react"
import { QrCode, Printer, Settings } from "lucide-react"

const TableManagement = () => {
  const { t } = useTranslation()
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [numberOfTables, setNumberOfTables] = useState(10)
  const [qrCodes, setQrCodes] = useState({})

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const response = await axios.get("/api/tables")
      setTables(response.data)
      setNumberOfTables(response.data.length)
    } catch (error) {
      console.error("Error fetching tables:", error)
      toast.error("Error al cargar las mesas")
    } finally {
      setLoading(false)
    }
  }

const handleSetupTables = async (e) => {
  e.preventDefault()
  try {
    // Paso 1: obtener mesas existentes
    const { data: existingTables } = await axios.get("/api/tables")

    // Paso 2: eliminar cada mesa
    await Promise.all(
      existingTables.map((table) =>
        axios.delete(`/api/tables/${table.id}`).catch((err) => {
          console.error(`Error eliminando mesa ${table.id}:`, err)
        })
      )
    )

    // Paso 3: crear nuevas mesas del 1 al numberOfTables
    const createPromises = []
    for (let i = 1; i <= parseInt(numberOfTables); i++) {
      createPromises.push(
        axios.post("/api/tables", {
          table_number: i,
        })
      )
    }

    await Promise.all(createPromises)

    toast.success(t("tables.tablesSetup"))
    fetchTables()
  } catch (error) {
    console.error("Error setting up tables:", error)
    toast.error("Error al configurar las mesas")
  }
}


  const generateQRCode = async (tableId) => {
    try {
      const response = await axios.get(`/api/tables/${tableId}/qr`)
      setQrCodes((prev) => ({
        ...prev,
        [tableId]: response.data,
      }))
    } catch (error) {
      console.error("Error generating QR code:", error)
      toast.error("Error al generar el código QR")
    }
  }

  const printQRCode = (table, qrData) => {
    const printWindow = window.open("", "_blank")
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Mesa ${table.table_number}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 20px;
            }
            .qr-container {
              border: 2px solid #ccc;
              padding: 20px;
              margin: 20px auto;
              width: fit-content;
            }
            .table-info {
              margin-bottom: 20px;
            }
            .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="table-info">
            <h2>Mesa ${table.table_number}</h2>
            <p>Escanea este código para ver nuestro menú</p>
          </div>
          <div class="qr-container">
            <img src="${qrData.qrCode}" alt="QR Code" />
          </div>
          <div class="footer">
            <p>${qrData.menuUrl}</p>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const updateTableStatus = async (tableId, status) => {
    try {
      await axios.patch(`/api/tables/${tableId}/status`, { status })
      toast.success("Estado de mesa actualizado")
      fetchTables()
    } catch (error) {
      console.error("Error updating table status:", error)
      toast.error("Error al actualizar el estado de la mesa")
    }
  }

  const getStatusBadge = (status) => {
    const statusClasses = {
      available: "status-badge status-available",
      occupied: "status-badge status-occupied",
      reserved: "status-badge",
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("tables.management")}</h1>
          <p className="text-gray-600">Configura las mesas y genera códigos QR para cada una</p>
        </div>

        {/* Setup Tables */}
        <div className="card mb-8">
          <div className="card-header">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Settings size={20} />
              {t("tables.setupTables")}
            </h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSetupTables} className="flex items-center gap-4">
              <div className="form-group mb-0">
                <label htmlFor="numberOfTables" className="form-label">
                  {t("tables.numberOfTables")}
                </label>
                <input
                  id="numberOfTables"
                  type="number"
                  min="1"
                  max="100"
                  className="form-input"
                  style={{ width: "120px" }}
                  value={numberOfTables}
                  onChange={(e) => setNumberOfTables(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                {t("tables.setupTables")}
              </button>
            </form>
            <p className="text-sm text-gray-600 mt-2">
              Esto eliminará las mesas existentes y creará {numberOfTables} nuevas mesas
            </p>
          </div>
        </div>

        {/* Tables Grid */}
        {tables && tables.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay mesas configuradas</h3>
              <p className="text-gray-600 mb-4">Configura el número de mesas para comenzar</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tables?.map((table) => (
              <div key={table.id} className="card">
                <div className="card-header">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Mesa {table.table_number}</h3>
                    <span className={getStatusBadge(table.status)}>{t(`tables.${table.status}`)}</span>
                  </div>
                </div>
                <div className="card-body text-center">
                  {/* QR Code Display */}
                  <div className="mb-4">
                    {qrCodes?.[table.id] ? (
                      <div className="inline-block p-2 bg-white border border-gray-200 rounded">
                        <QRCodeCanvas value={qrCodes[table.id]?.menuUrl} size={120} bgColor="#ffffff" fgColor="#134252" />
                      </div>
                    ) : (
                      <div className="w-32 h-32 mx-auto bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                        <QrCode size={40} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button onClick={() => generateQRCode(table.id)} className="btn btn-primary btn-sm w-full">
                      <QrCode size={16} />
                      {t("tables.generateQR")}
                    </button>

                    {qrCodes[table.id] && (
                      <button
                        onClick={() => printQRCode(table, qrCodes[table.id])}
                        className="btn btn-secondary btn-sm w-full"
                      >
                        <Printer size={16} />
                        {t("tables.printQR")}
                      </button>
                    )}

                    {/* Status Update */}
                    <select
                      value={table.status}
                      onChange={(e) => updateTableStatus(table.id, e.target.value)}
                      className="form-input text-sm w-full"
                    >
                      <option value="available">{t("tables.available")}</option>
                      <option value="occupied">{t("tables.occupied")}</option>
                      <option value="reserved">{t("tables.reserved")}</option>
                    </select>
                  </div>

                  {/* QR URL */}
                  {qrCodes[table.id] && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600 break-all">
                      {qrCodes[table.id].menuUrl}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TableManagement
