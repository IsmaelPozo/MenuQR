import { getReferralData } from "@/app/actions/referrals"
import { ReferralDashboard } from "@/components/referrals/referral-dashboard"

export default async function ReferralsPage() {
  const referralData = await getReferralData()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Programa de Referidos</h1>
        <p className="text-muted-foreground mt-2">
          Recomienda MenuQR a otros restaurantes y obtén descuentos en tu suscripción mensual
        </p>
      </div>

      <ReferralDashboard data={referralData} />
    </div>
  )
}
