const express = require("express")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const db = require("../config/database")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Verificar que JWT_SECRET esté configurado
if (!process.env.JWT_SECRET) {
  console.error("❌ ERROR: JWT_SECRET no está configurado en las variables de entorno")
  process.exit(1)
}

// Register restaurant
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, address, phone, defaultLanguage } = req.body

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" })
    }

    // Check if restaurant already exists
    const [existing] = await db.execute("SELECT id FROM restaurants WHERE email = ?", [email])

    if (existing.length > 0) {
      return res.status(400).json({ error: "Restaurant with this email already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create restaurant
    const [result] = await db.execute(
      `INSERT INTO restaurants (name, email, password, address, phone, default_language) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, address || null, phone || null, defaultLanguage || "es"],
    )

    const restaurantId = result.insertId

    // Generate JWT token
    const token = jwt.sign({ restaurantId, email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    })

    res.status(201).json({
      message: "Restaurant registered successfully",
      token,
      restaurant: {
        id: restaurantId,
        name,
        email,
        address,
        phone,
        defaultLanguage: defaultLanguage || "es",
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Failed to register restaurant" })
  }
})

// Login restaurant
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    // Find restaurant
    const [restaurants] = await db.execute(
      "SELECT id, name, email, password, address, phone, default_language FROM restaurants WHERE email = ?",
      [email],
    )

    if (restaurants.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const restaurant = restaurants[0]

    // Verify password
    const isValidPassword = await bcrypt.compare(password, restaurant.password)
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Generate JWT token
    const token = jwt.sign({ restaurantId: restaurant.id, email: restaurant.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    })

    res.json({
      message: "Login successful",
      token,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        email: restaurant.email,
        address: restaurant.address,
        phone: restaurant.phone,
        defaultLanguage: restaurant.default_language,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Failed to login" })
  }
})

// Get current restaurant info
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const [restaurants] = await db.execute(
      "SELECT id, name, email, address, phone, logo_url, default_language FROM restaurants WHERE id = ?",
      [req.restaurant.id],
    )

    if (restaurants.length === 0) {
      return res.status(404).json({ error: "Restaurant not found" })
    }

    res.json({ restaurant: restaurants[0] })
  } catch (error) {
    console.error("Get restaurant error:", error)
    res.status(500).json({ error: "Failed to get restaurant info" })
  }
})

module.exports = router
