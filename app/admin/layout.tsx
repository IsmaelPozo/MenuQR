import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppHeader } from "@/components/layout/app-header"
import { AppFooter } from "@/components/layout/app-footer"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log("[v0] Admin layout: Checking authentication")
  const supabase = await createClient()

  if (!supabase) {
    console.error("[v0] Supabase client not available")
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader title="QR Menu Admin" />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="bg-destructive/10 border border-destructive rounded-lg p-6">
            <h2 className="text-2xl font-bold text-destructive mb-4">Error de Configuración</h2>
            <p className="text-muted-foreground mb-4">
              La aplicación no está configurada correctamente. Por favor, verifica que las variables de entorno de
              Supabase estén configuradas.
            </p>
            <p className="text-sm text-muted-foreground">
              Variables requeridas: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
            </p>
          </div>
        </main>
        <AppFooter />
      </div>
    )
  }

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    console.log("[v0] No user found or auth error, redirecting to login")
    redirect("/auth/login")
  }

  console.log("[v0] User authenticated:", data.user.email)

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader title="QR Menu Admin" />
      <main className="flex-1">{children}</main>
      <AppFooter />
    </div>
  )
}
