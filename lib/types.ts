export interface Restaurant {
  id: string
  name: string
  email: string
  address?: string
  phone?: string
  logo_url?: string
  default_language: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  subscription_status: "trialing" | "active" | "past_due" | "canceled" | "incomplete"
  subscription_start_date: string
  trial_end_date?: string
  monthly_fee: number
  next_billing_date?: string
  stripe_connect_account_id?: string
  payment_enabled: boolean
  bank_account_last4?: string
  bank_account_name?: string
  referral_code?: string
  referred_by?: string
  referral_count: number
  referral_discount: number
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
  amount_paid: number
  is_fully_paid: boolean
  status: "pending_payment" | "received" | "preparing" | "ready" | "served" | "paid"
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
  is_paid: boolean
  paid_by?: string
  created_at: string
  menu_items?: {
    name: string
    price: number
  }
}

export interface OrderPayment {
  id: string
  order_id: string
  table_id: string
  amount: number
  payment_type: "individual" | "table" | "partial"
  stripe_payment_intent_id?: string
  customer_name?: string
  paid_item_ids: string[]
  status: "pending" | "completed" | "failed"
  created_at: string
}

export interface SubscriptionPayment {
  id: string
  restaurant_id: string
  stripe_payment_intent_id?: string
  amount: number
  currency: string
  status: "pending" | "succeeded" | "failed" | "refunded"
  billing_period_start: string
  billing_period_end: string
  paid_at?: string
  created_at: string
}

export interface Referral {
  id: string
  referrer_id: string
  referred_id: string
  status: "pending" | "active" | "inactive"
  discount_amount: number
  created_at: string
}
