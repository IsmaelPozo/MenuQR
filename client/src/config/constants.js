// Application constants
export const APP_CONFIG = {
  name: "QR Menu System",
  version: "1.0.0",
  description: "Sistema de Menú Digital para Restaurantes",
  author: "QR Menu Team",
  supportEmail: "support@qrmenu.com",
}

export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 10000,
}

export const SUPPORTED_LANGUAGES = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
]

export const ORDER_STATUSES = {
  RECEIVED: "received",
  PREPARING: "preparing",
  READY: "ready",
  SERVED: "served",
  PAID: "paid",
}

export const TABLE_STATUSES = {
  AVAILABLE: "available",
  OCCUPIED: "occupied",
  RESERVED: "reserved",
}

export const PAYMENT_STATUSES = {
  PENDING: "pending",
  INDIVIDUAL: "individual",
  TABLE_COMPLETE: "table_complete",
}

export const LOCAL_STORAGE_KEYS = {
  TOKEN: "token",
  LANGUAGE: "language",
  THEME: "theme",
}
