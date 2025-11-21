const express = require("express")
const multer = require("multer")
const db = require("../config/database")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Configurar multer para manejar archivos en memoria
const storage = multer.memoryStorage()
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Solo permitir imágenes
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Solo se permiten archivos de imagen"), false)
    }
  },
})

// Subir imagen para un elemento del menú
router.post("/menu-item/:itemId/image", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    const { itemId } = req.params
    const restaurantId = req.restaurant.id

    if (!req.file) {
      return res.status(400).json({ error: "No se proporcionó ningún archivo" })
    }

    // Verificar que el elemento del menú pertenece al restaurante
    const [menuItems] = await db.execute("SELECT id FROM menu_items WHERE id = ? AND restaurant_id = ?", [
      itemId,
      restaurantId,
    ])

    if (menuItems.length === 0) {
      return res.status(404).json({ error: "Elemento del menú no encontrado" })
    }

    // Guardar la imagen en la base de datos
    await db.execute("UPDATE menu_items SET image_data = ?, image_mime_type = ? WHERE id = ?", [
      req.file.buffer,
      req.file.mimetype,
      itemId,
    ])

    console.log(`📸 Imagen subida para elemento ${itemId}: ${req.file.originalname} (${req.file.size} bytes)`)

    res.json({
      message: "Imagen subida exitosamente",
      itemId: itemId,
      filename: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
    })
  } catch (error) {
    console.error("Error subiendo imagen:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Obtener imagen de un elemento del menú
router.get("/images/menu-item/:itemId", async (req, res) => {
  try {
    const { itemId } = req.params

    const [menuItems] = await db.execute(
      "SELECT image_data, image_mime_type FROM menu_items WHERE id = ? AND image_data IS NOT NULL",
      [itemId],
    )

    if (menuItems.length === 0) {
      return res.status(404).json({ error: "Imagen no encontrada" })
    }

    const { image_data, image_mime_type } = menuItems[0]

    // Configurar headers para cache
    res.set({
      "Content-Type": image_mime_type,
      "Content-Length": image_data.length,
      "Cache-Control": "public, max-age=86400", // Cache por 24 horas
    })

    res.send(image_data)
  } catch (error) {
    console.error("Error obteniendo imagen:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Eliminar imagen de un elemento del menú
router.delete("/menu-item/:itemId/image", authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params
    const restaurantId = req.restaurant.id

    // Verificar que el elemento del menú pertenece al restaurante
    const [menuItems] = await db.execute("SELECT id FROM menu_items WHERE id = ? AND restaurant_id = ?", [
      itemId,
      restaurantId,
    ])

    if (menuItems.length === 0) {
      return res.status(404).json({ error: "Elemento del menú no encontrado" })
    }

    // Eliminar la imagen
    await db.execute("UPDATE menu_items SET image_data = NULL, image_mime_type = NULL WHERE id = ?", [itemId])

    console.log(`🗑️ Imagen eliminada para elemento ${itemId}`)

    res.json({ message: "Imagen eliminada exitosamente" })
  } catch (error) {
    console.error("Error eliminando imagen:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

module.exports = router
