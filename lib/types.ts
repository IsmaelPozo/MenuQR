export interface Restaurant {
  id: string
  name: string
  email: string
  address?: string
  phone?: string
  logo_url?: string
  default_language: string
  created_at: string
  updated_at: string
}

export interface Table {
  id: string
  restaurant_id: string
  table_number: number
  qr_code: string
  status: "available" | "occupied" | "reserved"
  created_at: string
  restaurants?: Restaurant
}

export interface MenuCategory {
  id: string
  restaurant_id: string
  name: string
  sort_order: number
  created_at: string
}

export interface MenuItem {
  id: string
  restaurant_id: string
  category_id: string
  name: string
  description?: string
  price: number
  image_url?: string
  is_available: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  restaurant_id: string
  table_id: string
  customer_name?: string
  total_amount: number
  status: "received" | "preparing" | "ready" | "served" | "paid"
  payment_status: "pending" | "individual" | "table_complete"
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  menu_items?: {
    name: string
    price: number
  }
}
