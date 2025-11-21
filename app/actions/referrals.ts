"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getReferralData() {
  const supabase = await createClient()

  if (!supabase) {
    return {
      referralCode: "",
      referralCount: 0,
      currentDiscount: 0,
      monthlyFee: 25,
      finalPrice: 25,
      referrals: [],
      potentialSavings: 10,
      referralsNeeded: 5,
      maxReferrals: 5,
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("No autenticado")
  }

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("referral_code, referral_count, referral_discount, monthly_fee")
    .eq("id", user.id)
    .single()

  if (error) throw error

  // Get active referrals
  const { data: referrals, error: referralsError } = await supabase
    .from("referrals")
    .select(
      `
      *,
      referred:referred_id (name, email, subscription_status)
    `,
    )
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false })

  if (referralsError) throw referralsError

  // Calculate potential savings
  const maxDiscount = 10 // Maximum 10€ discount
  const currentDiscount = restaurant.referral_discount || 0
  const potentialSavings = maxDiscount - currentDiscount
  const referralsNeeded = Math.ceil(potentialSavings / 2)

  return {
    referralCode: restaurant.referral_code,
    referralCount: restaurant.referral_count || 0,
    currentDiscount: currentDiscount,
    monthlyFee: restaurant.monthly_fee,
    finalPrice: Math.max(restaurant.monthly_fee - currentDiscount, 15),
    referrals: referrals || [],
    potentialSavings,
    referralsNeeded,
    maxReferrals: 5, // 5 referrals = 10€ discount
  }
}

export async function validateReferralCode(code: string) {
  const supabase = await createClient()

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("id, name, referral_code")
    .eq("referral_code", code.toUpperCase())
    .single()

  if (error || !restaurant) {
    return { valid: false, message: "Código de referido no válido" }
  }

  return { valid: true, referrer: restaurant }
}

export async function applyReferralCode(referralCode: string, newRestaurantId: string) {
  const supabase = await createClient()

  // Validate referral code
  const { data: referrer, error: referrerError } = await supabase
    .from("restaurants")
    .select("id")
    .eq("referral_code", referralCode.toUpperCase())
    .single()

  if (referrerError || !referrer) {
    throw new Error("Código de referido no válido")
  }

  // Can't refer yourself
  if (referrer.id === newRestaurantId) {
    throw new Error("No puedes usar tu propio código de referido")
  }

  // Update referred_by field
  const { error: updateError } = await supabase
    .from("restaurants")
    .update({ referred_by: referrer.id })
    .eq("id", newRestaurantId)

  if (updateError) throw updateError

  // Create referral record
  const { error: referralError } = await supabase.from("referrals").insert({
    referrer_id: referrer.id,
    referred_id: newRestaurantId,
    status: "pending",
  })

  if (referralError) throw referralError

  revalidatePath("/admin/referrals")
}

export async function getMyReferrer() {
  const supabase = await createClient()

  if (!supabase) {
    return null
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("No autenticado")
  }

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select(
      `
      referred_by,
      referrer:referred_by (name, email, referral_code)
    `,
    )
    .eq("id", user.id)
    .single()

  return restaurant?.referrer || null
}

export async function shareReferralCode(method: "email" | "whatsapp" | "copy", referralCode: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://menuqr.app"
  const referralUrl = `${baseUrl}/auth/register?ref=${referralCode}`

  const message = `¡Únete a MenuQR y obtén 3 meses gratis! Usa mi código de referido: ${referralCode}\n\nRegistrate aquí: ${referralUrl}\n\n¡Ambos obtendremos 2€ de descuento mensual!`

  switch (method) {
    case "email":
      return `mailto:?subject=Únete a MenuQR&body=${encodeURIComponent(message)}`
    case "whatsapp":
      return `https://wa.me/?text=${encodeURIComponent(message)}`
    case "copy":
      return referralUrl
    default:
      return referralUrl
  }
}
