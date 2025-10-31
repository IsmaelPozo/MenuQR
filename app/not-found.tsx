import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <QrCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <CardTitle className="text-2xl">Código QR No Válido</CardTitle>
          <CardDescription>
            El código QR que has escaneado no corresponde a ninguna mesa registrada. Por favor, verifica que estés
            escaneando el código correcto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/">Volver al Inicio</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
