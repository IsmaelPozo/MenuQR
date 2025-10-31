const mysql = require("mysql2/promise")

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root1234",
  database: process.env.DB_NAME || "qr_menu_app",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
}

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig)

// Función para probar la conexión
async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log("✅ Conexión a MySQL establecida correctamente")
    connection.release()
    return true
  } catch (error) {
    console.error("❌ Error conectando a MySQL:", error.message)
    return false
  }
}

// Probar conexión al iniciar
testConnection()

module.exports = pool
