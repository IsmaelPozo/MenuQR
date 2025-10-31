const jwt = require("jsonwebtoken")
const db = require("../config/database")

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({ error: "Token de acceso requerido" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Obtener información del restaurante
    const [restaurants] = await db.execute("SELECT * FROM restaurants WHERE id = ?", [decoded.restaurantId])

    if (restaurants.length === 0) {
      return res.status(401).json({ error: "Restaurante no encontrado" })
    }

    req.restaurant = restaurants[0]
    req.user = decoded
    next()
  } catch (error) {
    console.error("Error en autenticación:", error)
    return res.status(403).json({ error: "Token inválido" })
  }
}

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const [restaurants] = await db.execute("SELECT * FROM restaurants WHERE id = ?", [decoded.restaurantId])

      if (restaurants.length > 0) {
        req.restaurant = restaurants[0]
        req.user = decoded
      }
    }

    next()
  } catch (error) {
    // Si hay error en el token opcional, continuar sin autenticación
    next()
  }
}

module.exports = {
  authenticateToken,
  optionalAuth,
}
