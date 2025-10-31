import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BillingDashboard } from "@/components/billing/billing-dashboard"

export default async function BillingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: restaurant } = await supabase.from("restaurants").select("*").eq("id", user.id).single()

  if (!restaurant) {
    redirect("/auth/login")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Facturación y Suscripción</h1>
      <BillingDashboard restaurant={restaurant} />
    </div>
  )
}
