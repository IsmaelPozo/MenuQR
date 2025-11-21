"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { QrCode, Gift } from "lucide-react"
import { validateReferralCode } from "@/app/actions/referrals"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [defaultLanguage, setDefaultLanguage] = useState("es")
  const [referralCode, setReferralCode] = useState("")
  const [referralValid, setReferralValid] = useState<boolean | null>(null)
  const [referralMessage, setReferralMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const refCode = searchParams.get("ref")
    if (refCode) {
      setReferralCode(refCode)
      validateCode(refCode)
    }
  }, [searchParams])

  const validateCode = async (code: string) => {
    if (!code) {
      setReferralValid(null)
      setReferralMessage("")
      return
    }

    try {
      const result = await validateReferralCode(code)
      setReferralValid(result.valid)
      if (result.valid && result.referrer) {
        setReferralMessage(`¡Código válido! Referido por ${result.referrer.name}`)
      } else {
        setReferralMessage(result.message || "Código no válido")
      }
    } catch (error) {
      setReferralValid(false)
      setReferralMessage("Error al validar el código")
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setIsLoading(false)
      return
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/admin`,
          data: {
            name,
            phone,
            address,
            default_language: defaultLanguage,
            referral_code: referralCode || null,
          },
        },
      })

      if (signUpError) throw signUpError

      router.push("/auth/check-email")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al registrar")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <QrCode className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">QR Menu</h1>
          </div>
          {referralCode && referralValid && (
            <Card className="border-primary bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Gift className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">¡Tienes un código de referido!</p>
                    <p className="text-xs text-muted-foreground">{referralMessage}</p>
                    <p className="text-xs text-primary font-medium mt-1">
                      Obtén 3 meses gratis + 2€ de descuento mensual
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Registrar Restaurante</CardTitle>
              <CardDescription>Crea una cuenta para comenzar a usar el sistema de menú digital</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nombre del Restaurante</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Mi Restaurante"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="contacto@restaurante.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+34 123 456 789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="Calle Principal 123"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="language">Idioma Predeterminado</Label>
                    <Select value={defaultLanguage} onValueChange={setDefaultLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="referral">Código de Referido (Opcional)</Label>
                    <div className="relative">
                      <Input
                        id="referral"
                        type="text"
                        placeholder="Ej: ABC12345"
                        value={referralCode}
                        onChange={(e) => {
                          const code = e.target.value.toUpperCase()
                          setReferralCode(code)
                          if (code.length >= 8) {
                            validateCode(code)
                          } else {
                            setReferralValid(null)
                            setReferralMessage("")
                          }
                        }}
                        className={
                          referralValid === true
                            ? "border-green-500"
                            : referralValid === false
                              ? "border-destructive"
                              : ""
                        }
                      />
                      {referralValid === true && <Gift className="absolute right-3 top-3 h-4 w-4 text-green-500" />}
                    </div>
                    {referralMessage && (
                      <p className={`text-xs ${referralValid ? "text-green-600" : "text-destructive"}`}>
                        {referralMessage}
                      </p>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="repeat-password">Repetir Contraseña</Label>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Registrando..." : "Registrar Restaurante"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  ¿Ya tienes una cuenta?{" "}
                  <Link href="/auth/login" className="underline underline-offset-4 text-primary">
                    Iniciar sesión
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
