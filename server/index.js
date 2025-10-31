const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
require("dotenv").config()

// Verificar variables de entorno críticas
const requiredEnvVars = ["JWT_SECRET", "DB_HOST", "DB_USER", "DB_NAME"]
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error("❌ ERROR: Las siguientes variables de entorno son requeridas:")
  missingEnvVars.forEach((envVar) => {
    console.error(`   - ${envVar}`)
  })
  console.error("\nPor favor, configura estas variables en el archivo .env")
  process.exit(1)
}

const authRoutes = require("./routes/auth")
const restaurantRoutes = require("./routes/restaurants")
const menuRoutes = require("./routes/menu")
const tableRoutes = require("./routes/tables")
const orderRoutes = require("./routes/orders")
const uploadRoutes = require("./routes/upload")

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
})
app.use(limiter)
app.set('trust proxy', 1); // confía en el primer proxy

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/restaurants", restaurantRoutes)
app.use("/api/menu", menuRoutes)
app.use("/api/tables", tableRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/upload", uploadRoutes)

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
  })
})

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error)

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "Archivo demasiado grande" })
  }

  if (error.message === "Solo se permiten archivos de imagen") {
    return res.status(400).json({ error: error.message })
  }

  res.status(500).json({ error: "Error interno del servidor" })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Endpoint no encontrado" })
})

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`)
  console.log(`📱 Cliente URL: ${process.env.CLIENT_URL || "http://localhost:3000"}`)
})
