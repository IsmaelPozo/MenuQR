import Link from "next/link"
import { Button } from "@/components/ui/button"
import { QrCode, UtensilsCrossed, ChefHat } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">QR Menu</h1>
          </div>
          <nav className="flex gap-4">
            <Button asChild variant="ghost">
              <Link href="/auth/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Registrar Restaurante</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-5xl font-bold mb-6 text-balance">Sistema de Menú Digital con Código QR</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Moderniza tu restaurante con menús digitales accesibles mediante código QR. Gestiona pedidos en tiempo real
            y mejora la experiencia de tus clientes.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/auth/register">Comenzar Gratis</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/menu/demo">Ver Demo</Link>
            </Button>
          </div>
        </section>

        <section className="bg-muted py-20">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12">Características</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg border border-border">
                <QrCode className="h-12 w-12 text-primary mb-4" />
                <h4 className="text-xl font-semibold mb-2">Menú con QR</h4>
                <p className="text-muted-foreground">
                  Los clientes escanean el código QR de su mesa y acceden al menú digital instantáneamente.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <UtensilsCrossed className="h-12 w-12 text-primary mb-4" />
                <h4 className="text-xl font-semibold mb-2">Pedidos en Tiempo Real</h4>
                <p className="text-muted-foreground">
                  Los pedidos llegan directamente a la cocina sin intermediarios, reduciendo errores.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <ChefHat className="h-12 w-12 text-primary mb-4" />
                <h4 className="text-xl font-semibold mb-2">Panel de Cocina</h4>
                <p className="text-muted-foreground">
                  Vista dedicada para la cocina con gestión de estados de pedidos y prioridades.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 QR Menu. Sistema de menú digital para restaurantes.</p>
        </div>
      </footer>
    </div>
  )
}
