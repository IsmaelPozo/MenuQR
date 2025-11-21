"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { translateMultipleFields } from "@/app/actions/translate"
import { SUPPORTED_LANGUAGES, type LanguageCode, type TranslatedText, getTranslation } from "@/lib/languages"
import { Loader2, Languages } from "lucide-react"
import type { MenuCategory, MenuItem } from "@/lib/types"

interface MenuItemFormProps {
  restaurantId: string
  defaultLanguage: LanguageCode
  categories: MenuCategory[]
  item?: MenuItem
  onDone?: () => void
}

export function MenuItemForm({ restaurantId, defaultLanguage, categories, item, onDone }: MenuItemFormProps) {
  const [name, setName] = useState(getTranslation(item?.name, defaultLanguage))
  const [description, setDescription] = useState(getTranslation(item?.description, defaultLanguage))
  const [ingredients, setIngredients] = useState(getTranslation(item?.ingredients, defaultLanguage))
  const [allergens, setAllergens] = useState(getTranslation(item?.allergens, defaultLanguage))
  const [traces, setTraces] = useState(getTranslation(item?.traces, defaultLanguage))

  const [translations, setTranslations] = useState<{
    name: TranslatedText
    description: TranslatedText
    ingredients: TranslatedText
    allergens: TranslatedText
    traces: TranslatedText
  }>({
    name: (item?.name as TranslatedText) || {},
    description: (item?.description as TranslatedText) || {},
    ingredients: (item?.ingredients as TranslatedText) || {},
    allergens: (item?.allergens as TranslatedText) || {},
    traces: (item?.traces as TranslatedText) || {},
  })

  const [price, setPrice] = useState(item?.price?.toString() || "")
  const [categoryId, setCategoryId] = useState(item?.category_id || "")
  const [isAvailable, setIsAvailable] = useState(item?.is_available ?? true)
  const [sortOrder, setSortOrder] = useState(item?.sort_order?.toString() || "0")
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
      const fieldsToTranslate: Record<string, string> = {
        name,
      }

      if (description.trim()) fieldsToTranslate.description = description
      if (ingredients.trim()) fieldsToTranslate.ingredients = ingredients
      if (allergens.trim()) fieldsToTranslate.allergens = allergens
      if (traces.trim()) fieldsToTranslate.traces = traces

      const translated = await translateMultipleFields(fieldsToTranslate, defaultLanguage)

      setTranslations({
        name: translated.name || {},
        description: translated.description || {},
        ingredients: translated.ingredients || {},
        allergens: translated.allergens || {},
        traces: translated.traces || {},
      })
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

    if (!categoryId) {
      setError("Por favor selecciona una categoría")
      setIsLoading(false)
      return
    }

    // If no translations yet, translate first
    if (Object.keys(translations.name).length === 0) {
      await handleTranslate()
    }

    const supabase = createClient()

    try {
      const finalTranslations = {
        name: Object.keys(translations.name).length > 0 ? translations.name : { [defaultLanguage]: name },
        description:
          Object.keys(translations.description).length > 0
            ? translations.description
            : description
              ? { [defaultLanguage]: description }
              : {},
        ingredients:
          Object.keys(translations.ingredients).length > 0
            ? translations.ingredients
            : ingredients
              ? { [defaultLanguage]: ingredients }
              : {},
        allergens:
          Object.keys(translations.allergens).length > 0
            ? translations.allergens
            : allergens
              ? { [defaultLanguage]: allergens }
              : {},
        traces:
          Object.keys(translations.traces).length > 0
            ? translations.traces
            : traces
              ? { [defaultLanguage]: traces }
              : {},
      }

      if (item) {
        const { error } = await supabase
          .from("menu_items")
          .update({
            name: finalTranslations.name,
            description: finalTranslations.description,
            ingredients: finalTranslations.ingredients,
            allergens: finalTranslations.allergens,
            traces: finalTranslations.traces,
            price: Number.parseFloat(price),
            category_id: categoryId,
            is_available: isAvailable,
            sort_order: Number.parseInt(sortOrder),
          })
          .eq("id", item.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("menu_items").insert({
          restaurant_id: restaurantId,
          category_id: categoryId,
          name: finalTranslations.name,
          description: finalTranslations.description,
          ingredients: finalTranslations.ingredients,
          allergens: finalTranslations.allergens,
          traces: finalTranslations.traces,
          price: Number.parseFloat(price),
          is_available: isAvailable,
          sort_order: Number.parseInt(sortOrder),
        })

        if (error) throw error
      }

     if (onDone) {
        onDone()
      } else {
        router.push("/admin/menu")
        router.refresh()
      }

    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al guardar el plato")
    } finally {
      setIsLoading(false)
    }
    
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{item ? "Editar Plato" : "Nuevo Plato"}</CardTitle>
        <CardDescription>
          Escribe en {SUPPORTED_LANGUAGES[defaultLanguage].name} y se traducirá automáticamente a todos los idiomas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Información Básica</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTranslate}
                disabled={isTranslating || !name.trim()}
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traduciendo...
                  </>
                ) : (
                  <>
                    <Languages className="h-4 w-4 mr-2" />
                    Traducir Todo
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Plato ({SUPPORTED_LANGUAGES[defaultLanguage].flag})</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ej: Paella Valenciana"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setTranslations({
                    ...translations,
                    name: { ...translations.name, [defaultLanguage]: e.target.value },
                  })
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción ({SUPPORTED_LANGUAGES[defaultLanguage].flag})</Label>
              <Textarea
                id="description"
                placeholder="Describe el plato"
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  setTranslations({
                    ...translations,
                    description: { ...translations.description, [defaultLanguage]: e.target.value },
                  })
                }}
              />
            </div>
          </div>

          {/* Ingredients and Allergens */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Ingredientes y Alérgenos</h3>

            <div className="space-y-2">
              <Label htmlFor="ingredients">Ingredientes ({SUPPORTED_LANGUAGES[defaultLanguage].flag})</Label>
              <Textarea
                id="ingredients"
                placeholder="Ej: Arroz, gambas, mejillones, pimiento rojo, azafrán"
                rows={2}
                value={ingredients}
                onChange={(e) => {
                  setIngredients(e.target.value)
                  setTranslations({
                    ...translations,
                    ingredients: { ...translations.ingredients, [defaultLanguage]: e.target.value },
                  })
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allergens">Alérgenos ({SUPPORTED_LANGUAGES[defaultLanguage].flag})</Label>
              <Input
                id="allergens"
                type="text"
                placeholder="Ej: Mariscos, gluten"
                value={allergens}
                onChange={(e) => {
                  setAllergens(e.target.value)
                  setTranslations({
                    ...translations,
                    allergens: { ...translations.allergens, [defaultLanguage]: e.target.value },
                  })
                }}
              />
              <p className="text-xs text-muted-foreground">Separa múltiples alérgenos con comas</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="traces">Puede Contener Trazas De ({SUPPORTED_LANGUAGES[defaultLanguage].flag})</Label>
              <Input
                id="traces"
                type="text"
                placeholder="Ej: Frutos secos, soja"
                value={traces}
                onChange={(e) => {
                  setTraces(e.target.value)
                  setTranslations({
                    ...translations,
                    traces: { ...translations.traces, [defaultLanguage]: e.target.value },
                  })
                }}
              />
              <p className="text-xs text-muted-foreground">Separa múltiples elementos con comas</p>
            </div>
          </div>

          {/* Show translations preview */}
          {Object.keys(translations.name).length > 1 && (
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">Vista Previa de Traducciones:</p>
              <div className="space-y-4">
                {Object.entries(SUPPORTED_LANGUAGES).map(([code, lang]) => {
                  if (code === defaultLanguage) return null
                  const hasTranslation = translations.name[code as LanguageCode]
                  if (!hasTranslation) return null

                  return (
                    <div key={code} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{lang.flag}</span>
                        <span className="font-medium text-sm">{lang.name}</span>
                      </div>
                      <div className="pl-8 space-y-1 text-sm text-muted-foreground">
                        <p>
                          <strong>Nombre:</strong> {translations.name[code as LanguageCode]}
                        </p>
                        {translations.description[code as LanguageCode] && (
                          <p>
                            <strong>Descripción:</strong> {translations.description[code as LanguageCode]}
                          </p>
                        )}
                        {translations.ingredients[code as LanguageCode] && (
                          <p>
                            <strong>Ingredientes:</strong> {translations.ingredients[code as LanguageCode]}
                          </p>
                        )}
                        {translations.allergens[code as LanguageCode] && (
                          <p>
                            <strong>Alérgenos:</strong> {translations.allergens[code as LanguageCode]}
                          </p>
                        )}
                        {translations.traces[code as LanguageCode] && (
                          <p>
                            <strong>Trazas:</strong> {translations.traces[code as LanguageCode]}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Price and Category */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio (€)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="12.50"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {getTranslation(category.name, defaultLanguage)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
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
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Switch id="available" checked={isAvailable} onCheckedChange={setIsAvailable} />
              <Label htmlFor="available">Disponible</Label>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading || isTranslating}>
              {isLoading ? "Guardando..." : item ? "Actualizar" : "Crear Plato"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (onDone) onDone()
                else router.back()
              }}
            >
              Cancelar
            </Button>


          </div>
        </form>
      </CardContent>
    </Card>
  )
}
