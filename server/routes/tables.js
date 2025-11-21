const express = require("express")
const QRCode = require("qrcode")
const db = require("../config/database")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Obtener todas las mesas del restaurante
router.get("/", authenticateToken, async (req, res) => {
  try {
    const restaurantId = req.restaurant.id

    const [tables] = await db.execute("SELECT * FROM tables WHERE restaurant_id = ? ORDER BY table_number", [
      restaurantId,
    ])

    res.json(tables)
  } catch (error) {
    console.error("Error obteniendo mesas:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Crear nueva mesa
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { table_number, capacity } = req.body
    const restaurantId = req.restaurant.id
    // Verificar que no existe una mesa con el mismo número
    const [existing] = await db.execute("SELECT id FROM tables WHERE restaurant_id = ? AND table_number = ?", [
      restaurantId,
      table_number,
    ])

    if (existing.length > 0) {
      return res.status(400).json({ error: "Ya existe una mesa con ese número" })
    }
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000"
    const menuUrl = `${clientUrl}/menu/${restaurantId}?table=${table_number}`
    const qrCodeDataURL = await QRCode.toDataURL(menuUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })

    const [result] = await db.execute("INSERT INTO tables (restaurant_id, table_number,qr_code) VALUES (?, ?, ?)", [
      restaurantId,
      table_number,
      qrCodeDataURL
    ])

    res.status(201).json({
      id: result.insertId,
      message: "Mesa creada exitosamente",
    })
  } catch (error) {
    console.error("Error creando mesa:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Generar código QR para una mesa
router.get("/:id/qr", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const restaurantId = req.restaurant.id

    // Verificar que la mesa pertenece al restaurante
    const [tables] = await db.execute("SELECT * FROM tables WHERE id = ? AND restaurant_id = ?", [id, restaurantId])

    if (tables.length === 0) {
      return res.status(404).json({ error: "Mesa no encontrada" })
    }

    const table = tables[0]
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000"
    const menuUrl = `${clientUrl}/menu/${restaurantId}?table=${table.table_number}`

    // Generar código QR
    const qrCodeDataURL = await QRCode.toDataURL(menuUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })

    res.json({
      table: table,
      menuUrl: menuUrl,
      qrCode: qrCodeDataURL,
    })
  } catch (error) {
    console.error("Error generando código QR:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Actualizar mesa
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { table_number, capacity, is_active } = req.body
    const restaurantId = req.restaurant.id

    // Verificar que la mesa pertenece al restaurante
    const [existing] = await db.execute("SELECT id FROM tables WHERE id = ? AND restaurant_id = ?", [id, restaurantId])

    if (existing.length === 0) {
      return res.status(404).json({ error: "Mesa no encontrada" })
    }

    // Verificar que no existe otra mesa con el mismo número
    const [duplicate] = await db.execute(
      "SELECT id FROM tables WHERE restaurant_id = ? AND table_number = ? AND id != ?",
      [restaurantId, table_number, id],
    )

    if (duplicate.length > 0) {
      return res.status(400).json({ error: "Ya existe una mesa con ese número" })
    }

    await db.execute("UPDATE tables SET table_number = ?, capacity = ?, is_active = ? WHERE id = ?", [
      table_number,
      capacity,
      is_active,
      id,
    ])

    res.json({ message: "Mesa actualizada exitosamente" })
  } catch (error) {
    console.error("Error actualizando mesa:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Eliminar mesa
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const restaurantId = req.restaurant.id

    // Verificar que la mesa pertenece al restaurante
    const [existing] = await db.execute("SELECT id FROM tables WHERE id = ? AND restaurant_id = ?", [id, restaurantId])

    if (existing.length === 0) {
      return res.status(404).json({ error: "Mesa no encontrada" })
    }

    await db.execute("DELETE FROM tables WHERE id = ?", [id])

    res.json({ message: "Mesa eliminada exitosamente" })
  } catch (error) {
    console.error("Error eliminando mesa:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

module.exports = router
