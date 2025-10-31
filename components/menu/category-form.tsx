"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { translateText } from "@/app/actions/translate"
import { SUPPORTED_LANGUAGES, type LanguageCode, type TranslatedText, getTranslation } from "@/lib/languages"
import { Loader2, Languages } from "lucide-react"

interface CategoryFormProps {
  restaurantId: string
  defaultLanguage: LanguageCode
  category?: {
    id: string
    name: TranslatedText
    sort_order: number
  }
}

export function CategoryForm({ restaurantId, defaultLanguage, category }: CategoryFormProps) {
  const [name, setName] = useState(getTranslation(category?.name, defaultLanguage))
  const [translations, setTranslations] = useState<TranslatedText>(category?.name || {})
  const [sortOrder, setSortOrder] = useState(category?.sort_order?.toString() || "0")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isTranslating, setIsTranslating] = useState(false)
  const router = useRouter()

  const handleTranslate = async () => {
    if (!name.trim()) {
      setError("Por favor ingresa un nombre primero")
      return
    }

    setIsTranslating(true)
    setError(null)

    try {
      const translated = await translateText(name, defaultLanguage)
      setTranslations(translated)
    } catch (error) {
      setError("Error al traducir. Por favor intenta de nuevo.")
      console.error("[v0] Translation error:", error)
    } finally {
      setIsTranslating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // If no translations yet, translate first
    if (Object.keys(translations).length === 0) {
      await handleTranslate()
    }

    const supabase = createClient()

    try {
      const finalTranslations = Object.keys(translations).length > 0 ? translations : { [defaultLanguage]: name }

      if (category) {
        const { error } = await supabase
          .from("menu_categories")
          .update({
            name: finalTranslations,
            sort_order: Number.parseInt(sortOrder),
          })
          .eq("id", category.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("menu_categories").insert({
          restaurant_id: restaurantId,
          name: finalTranslations,
          sort_order: Number.parseInt(sortOrder),
        })

        if (error) throw error
      }

      router.push("/admin/menu")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al guardar la categoría")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{category ? "Editar Categoría" : "Nueva Categoría"}</CardTitle>
        <CardDescription>
          Escribe en {SUPPORTED_LANGUAGES[defaultLanguage].name} y se traducirá automáticamente a todos los idiomas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Categoría ({SUPPORTED_LANGUAGES[defaultLanguage].flag})</Label>
            <div className="flex gap-2">
              <Input
                id="name"
                type="text"
                placeholder="Ej: Entrantes, Platos Principales, Postres"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  // Update the translation for the default language
                  setTranslations({ ...translations, [defaultLanguage]: e.target.value })
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleTranslate}
                disabled={isTranslating || !name.trim()}
                title="Traducir a todos los idiomas"
              >
                {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Show translations preview */}
          {Object.keys(translations).length > 1 && (
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">Traducciones:</p>
              <div className="grid gap-2">
                {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => {
                  const translation = translations[code as LanguageCode]
                  if (!translation || code === defaultLanguage) return null
                  return (
                    <div key={code} className="flex items-center gap-2 text-sm">
                      <span className="text-lg">{lang.flag}</span>
                      <span className="font-medium">{lang.name}:</span>
                      <span className="text-muted-foreground">{translation}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="sort_order">Orden de Visualización</Label>
            <Input
              id="sort_order"
              type="number"
              placeholder="0"
              required
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Las categorías se ordenarán de menor a mayor número</p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading || isTranslating}>
              {isLoading ? "Guardando..." : category ? "Actualizar" : "Crear Categoría"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
