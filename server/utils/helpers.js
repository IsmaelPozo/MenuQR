// Utility functions for the application

/**
 * Generate a unique QR code string for a table
 * @param {number} restaurantId - The restaurant ID
 * @param {number} tableNumber - The table number
 * @returns {string} - Unique QR code string
 */
const generateTableQRCode = (restaurantId, tableNumber) => {
  const timestamp = Date.now()
  return `table_${restaurantId}_${tableNumber}_${timestamp}`
}

/**
 * Format currency amount
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency symbol (default: €)
 * @returns {string} - Formatted currency string
 */
const formatCurrency = (amount, currency = "€") => {
  return `${currency}${Number.parseFloat(amount).toFixed(2)}`
}

/**
 * Calculate time elapsed since a given timestamp
 * @param {string|Date} timestamp - The timestamp to compare
 * @returns {string} - Human readable time elapsed
 */
const getTimeElapsed = (timestamp) => {
  const now = new Date()
  const past = new Date(timestamp)
  const diffInMinutes = Math.floor((now - past) / (1000 * 60))

  if (diffInMinutes < 1) {
    return "Ahora mismo"
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} min`
  } else {
    const hours = Math.floor(diffInMinutes / 60)
    const minutes = diffInMinutes % 60
    return `${hours}h ${minutes}min`
  }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Generate a random string for tokens or IDs
 * @param {number} length - Length of the string to generate
 * @returns {string} - Random string
 */
const generateRandomString = (length = 10) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Sanitize string input to prevent XSS
 * @param {string} input - String to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeInput = (input) => {
  if (typeof input !== "string") return input
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

/**
 * Get supported languages
 * @returns {Array} - Array of supported language objects
 */
const getSupportedLanguages = () => {
  return [
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
  ]
}

/**
 * Validate language code
 * @param {string} langCode - Language code to validate
 * @returns {boolean} - True if valid language code
 */
const isValidLanguage = (langCode) => {
  const supportedLangs = getSupportedLanguages().map((lang) => lang.code)
  return supportedLangs.includes(langCode)
}

module.exports = {
  generateTableQRCode,
  formatCurrency,
  getTimeElapsed,
  isValidEmail,
  generateRandomString,
  sanitizeInput,
  getSupportedLanguages,
  isValidLanguage,
}
