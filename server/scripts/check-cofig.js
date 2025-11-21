require("dotenv").config()

console.log("🔍 Verificando configuración del servidor...\n")

const requiredEnvVars = {
  JWT_SECRET: "Clave secreta para JWT (debe ser una cadena larga y segura)",
  DB_HOST: "Host de la base de datos",
  DB_USER: "Usuario de la base de datos",
  DB_NAME: "Nombre de la base de datos",
  DB_PASSWORD: "Contraseña de la base de datos (puede estar vacía)",
}

const optionalEnvVars = {
  PORT: "Puerto del servidor (por defecto: 5000)",
  CLIENT_URL: "URL del cliente (por defecto: http://localhost:3000)",
  JWT_EXPIRES_IN: "Tiempo de expiración del JWT (por defecto: 7d)",
  NODE_ENV: "Entorno de ejecución (development/production)",
}

let hasErrors = false

console.log("📋 Variables de entorno requeridas:")
Object.entries(requiredEnvVars).forEach(([key, description]) => {
  const value = process.env[key]
  const status = value ? "✅" : "❌"
  const displayValue = key === "JWT_SECRET" && value ? "[CONFIGURADO]" : value || "[NO CONFIGURADO]"

  console.log(`   ${status} ${key}: ${displayValue}`)
  if (key !== "DB_PASSWORD" && !value) {
    hasErrors = true
  }
})

console.log("\n📋 Variables de entorno opcionales:")
Object.entries(optionalEnvVars).forEach(([key, description]) => {
  const value = process.env[key]
  const status = value ? "✅" : "⚠️"
  const displayValue = value || "[USANDO VALOR POR DEFECTO]"

  console.log(`   ${status} ${key}: ${displayValue}`)
})

if (hasErrors) {
  console.log("\n❌ ERROR: Hay variables de entorno requeridas que no están configuradas.")
  console.log("Por favor, configura estas variables en el archivo server/.env")
  process.exit(1)
} else {
  console.log("\n✅ Todas las variables de entorno requeridas están configuradas correctamente.")
}
