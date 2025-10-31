const { body, validationResult } = require("express-validator")

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Validation failed",
      details: errors.array(),
    })
  }
  next()
}

// Restaurant registration validation
const validateRestaurantRegistration = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage("Restaurant name must be between 2 and 255 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("address").optional().trim().isLength({ max: 500 }).withMessage("Address must not exceed 500 characters"),
  body("phone").optional().trim().isLength({ max: 50 }).withMessage("Phone must not exceed 50 characters"),
  body("defaultLanguage")
    .optional()
    .isIn(["es", "en", "fr", "de"])
    .withMessage("Default language must be one of: es, en, fr, de"),
  handleValidationErrors,
]

// Login validation
const validateLogin = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
]

// Menu category validation
const validateMenuCategory = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Spanish name is required and must not exceed 255 characters"),

  body("sort_order").optional().isInt({ min: 0 }).withMessage("Sort order must be a non-negative integer"),
  handleValidationErrors,
]

// Menu item validation
const validateMenuItem = [
  body("category_id").isInt({ min: 1 }).withMessage("Valid category ID is required"),
  body("name")
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage("Name is required and must not exceed 255 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("image_url").optional().isURL().withMessage("Image URL must be a valid URL"),
  body("is_available").optional().isBoolean().withMessage("Availability must be a boolean value"),
  body("sort_order").optional().isInt({ min: 0 }).withMessage("Sort order must be a non-negative integer"),
  handleValidationErrors,
]

// Table setup validation
const validateTableSetup = [
  body("numberOfTables").isInt({ min: 1, max: 100 }).withMessage("Number of tables must be between 1 and 100"),
  handleValidationErrors,
]

// Order creation validation
const validateOrderCreation = [
  body("qrCode").trim().notEmpty().withMessage("QR code is required"),
  body("customerName")
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage("Customer name must not exceed 255 characters"),
  body("items").isArray({ min: 1 }).withMessage("At least one item is required"),
  body("items.*.id").isInt({ min: 1 }).withMessage("Valid item ID is required"),
  body("items.*.quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
  handleValidationErrors,
]

module.exports = {
  validateRestaurantRegistration,
  validateLogin,
  validateMenuCategory,
  validateMenuItem,
  validateTableSetup,
  validateOrderCreation,
  handleValidationErrors,
}
