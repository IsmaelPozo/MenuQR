const express = require("express")
const db = require("../config/database")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

// Create new order
router.post("/", async (req, res) => {
  try {
    const { table_id, items, customer_name, notes } = req.body

    if (!table_id || !items || items.length === 0) {
      return res.status(400).json({ error: "Table ID and items are required" })
    }

    // Calculate total
    let total = 0
    for (const item of items) {
      const [menuItems] = await db.execute("SELECT price FROM menu_items WHERE id = ?", [item.menu_item_id])
      if (menuItems.length > 0) {
        total += menuItems[0].price * item.quantity
      }
    }

    // Create order
    const [orderResult] = await db.execute(
      "INSERT INTO orders (table_id, customer_name, total_amount, notes, status) VALUES (?, ?, ?, ?, ?)",
      [table_id, customer_name || null, total, notes || null, "pending"],
    )

    const orderId = orderResult.insertId

    // Add order items
    for (const item of items) {
      await db.execute(
        "INSERT INTO order_items (order_id, menu_item_id, quantity, price, customizations) VALUES (?, ?, ?, ?, ?)",
        [orderId, item.menu_item_id, item.quantity, item.price, JSON.stringify(item.customizations || {})],
      )
    }

    res.status(201).json({
      message: "Order created successfully",
      orderId: orderId,
      total: total,
    })
  } catch (error) {
    console.error("Create order error:", error)
    res.status(500).json({ error: "Failed to create order" })
  }
})

// Get all orders for restaurant
router.get("/", authenticateToken, async (req, res) => {
  try {
    const [orders] = await db.execute(
      `SELECT o.*, t.table_number 
       FROM orders o 
       JOIN tables t ON o.table_id = t.id 
       WHERE t.restaurant_id = ? 
       ORDER BY o.created_at DESC`,
      [req.restaurant.id],
    )

    res.json(orders)
  } catch (error) {
    console.error("Get orders error:", error)
    res.status(500).json({ error: "Failed to get orders" })
  }
})

// Update order status
router.patch("/:orderId/status", authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params
    const { status } = req.body

    if (!["pending", "preparing", "ready", "delivered", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" })
    }

    await db.execute("UPDATE orders SET status = ? WHERE id = ?", [status, orderId])

    res.json({ message: "Order status updated successfully" })
  } catch (error) {
    console.error("Update order status error:", error)
    res.status(500).json({ error: "Failed to update order status" })
  }
})

module.exports = router
