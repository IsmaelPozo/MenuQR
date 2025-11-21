"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { QrCode, UtensilsCrossed, ChefHat } from "lucide-react"
import { AppHeader } from "@/components/layout/app-header"
import { AppFooter } from "@/components/layout/app-footer"
import { useTranslation } from "@/lib/i18n/use-translation"

export default function HomePage() {
  const t = useTranslation()

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-5xl font-bold mb-6 text-balance">{t.home.title}</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">{t.home.subtitle}</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button asChild size="lg">
              <Link href="/auth/register">{t.auth.getStarted}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">{t.auth.login}</Link>
            </Button>
          </div>
        </section>

        <section className="bg-muted py-20">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12">{t.home.features}</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg border border-border">
                <QrCode className="h-12 w-12 text-primary mb-4" />
                <h4 className="text-xl font-semibold mb-2">{t.home.qrMenuTitle}</h4>
                <p className="text-muted-foreground">{t.home.qrMenuDescription}</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <UtensilsCrossed className="h-12 w-12 text-primary mb-4" />
                <h4 className="text-xl font-semibold mb-2">{t.home.realtimeOrdersTitle}</h4>
                <p className="text-muted-foreground">{t.home.realtimeOrdersDescription}</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <ChefHat className="h-12 w-12 text-primary mb-4" />
                <h4 className="text-xl font-semibold mb-2">{t.home.kitchenPanelTitle}</h4>
                <p className="text-muted-foreground">{t.home.kitchenPanelDescription}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  )
}
