"use server"

import { createClient } from "@/lib/supabase/server"
import { validateReferralCode } from "./referrals"

export async function ensureRestaurantExists() {
  const supabase = await createClient()

  if (!supabase) {
    throw new Error("Database connection not available")
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("User not authenticated")
  }

  // Check if restaurant already exists
  const { data: existingRestaurant } = await supabase.from("restaurants").select("id").eq("id", user.id).single()

  if (existingRestaurant) {
    return existingRestaurant
  }

  const userData = user.user_metadata || {}
  const referralCode = userData.referral_code

  // Validate and apply referral code if provided
  let referredBy: string | null = null
  if (referralCode) {
    try {
      const result = await validateReferralCode(referralCode)
      if (result.valid && result.referrer?.id) {
        referredBy = result.referrer.id
      }
    } catch (error) {
      console.log("Referral validation failed:", error)
    }
  }

  // Create restaurant record
  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .insert([
      {
        id: user.id,
        email: user.email,
        name: userData.name || "Mi Restaurante",
        phone: userData.phone || null,
        address: userData.address || null,
        default_language: userData.default_language || "es",
        referred_by: referredBy,
        referral_code: generateReferralCode(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create restaurant: ${error.message}`)
  }

  return restaurant
}

function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
