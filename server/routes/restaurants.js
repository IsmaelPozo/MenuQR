const express = require("express")
const db = require("../config/database")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Get restaurant profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const [restaurants] = await db.execute(
      "SELECT id, name, email, address, phone, logo_url, default_language FROM restaurants WHERE id = ?",
      [req.restaurant.id],
    )

    if (restaurants.length === 0) {
      return res.status(404).json({ error: "Restaurant not found" })
    }

    res.json(restaurants[0])
  } catch (error) {
    console.error("Get restaurant profile error:", error)
    res.status(500).json({ error: "Failed to get restaurant profile" })
  }
})

// Update restaurant profile
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    const { name, address, phone, default_language } = req.body

    await db.execute("UPDATE restaurants SET name = ?, address = ?, phone = ?, default_language = ? WHERE id = ?", [
      name,
      address,
      phone,
      default_language,
      req.restaurant.id,
    ])

    res.json({ message: "Restaurant profile updated successfully" })
  } catch (error) {
    console.error("Update restaurant profile error:", error)
    res.status(500).json({ error: "Failed to update restaurant profile" })
  }
})

module.exports = router
