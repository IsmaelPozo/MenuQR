"use client"

import { useState } from "react"
import type { MenuCategory, MenuItem, Table, Restaurant } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShoppingCart, Plus, Minus, UtensilsCrossed, Info } from "lucide-react"
import { CartSheet } from "./cart-sheet"

interface CustomerMenuProps {
  table: Table
  restaurant: Restaurant
  categories: MenuCategory[]
  items: MenuItem[]
}

interface CartItem extends MenuItem {
  quantity: number
}

export function CustomerMenu({ table, restaurant, categories, items }: CustomerMenuProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]?.id || "")

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemId)
      if (existing && existing.quantity > 1) {
        return prev.map((i) => (i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
      }
      return prev.filter((i) => i.id !== itemId)
    })
  }

  const getItemsByCategory = (categoryId: string) => {
    return items.filter((item) => item.category_id === categoryId)
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold truncate">{restaurant.name}</h1>
              <p className="text-sm text-muted-foreground">Mesa {table.table_number}</p>
            </div>
            <Button
              onClick={() => setIsCartOpen(true)}
              size="lg"
              className="relative h-12 w-12 md:h-10 md:w-auto md:px-4"
              variant={cartItemCount > 0 ? "default" : "outline"}
            >
              <ShoppingCart className="h-5 w-5 md:mr-2" />
              <span className="hidden md:inline">Carrito</span>
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {categories.length > 0 && (
          <ScrollArea className="w-full border-t border-border">
            <div className="flex gap-2 px-4 py-3">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setActiveCategory(category.id)
                    document.getElementById(`category-${category.id}`)?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                  }}
                  className="whitespace-nowrap"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        )}
      </header>

      <main className="container mx-auto px-4 py-6 pb-32">
        {categories.length === 0 ? (
          <Card className="border-dashed">
            <div className="py-16 text-center">
              <UtensilsCrossed className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg text-muted-foreground">El menú no está disponible en este momento</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-10">
            {categories.map((category) => {
              const categoryItems = getItemsByCategory(category.id)
              if (categoryItems.length === 0) return null

              return (
                <div key={category.id} id={`category-${category.id}`} className="scroll-mt-32">
                  <h2 className="text-2xl md:text-3xl font-bold mb-6">{category.name}</h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {categoryItems.map((item) => {
                      const cartItem = cart.find((i) => i.id === item.id)
                      return (
                        <Card key={item.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                          <div className="p-5 md:p-6">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold mb-1 truncate">{item.name}</h3>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
                                )}
                                {(item.allergens || item.ingredients) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                                  >
                                    <Info className="h-3 w-3 mr-1" />
                                    Ver información
                                  </Button>
                                )}
                              </div>
                              <div className="text-right">
                                <span className="text-xl md:text-2xl font-bold text-primary">
                                  {item.price.toFixed(2)}€
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
                              {cartItem ? (
                                <div className="flex items-center gap-3 flex-1">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => removeFromCart(item.id)}
                                    className="h-10 w-10 rounded-full"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="font-semibold text-lg min-w-8 text-center">{cartItem.quantity}</span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => addToCart(item)}
                                    className="h-10 w-10 rounded-full"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button onClick={() => addToCart(item)} className="w-full h-10" size="lg">
                                  <Plus className="h-4 w-4 mr-2" />
                                  Añadir al carrito
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {cartItemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pointer-events-none">
          <div className="container mx-auto pointer-events-auto">
            <Button
              onClick={() => setIsCartOpen(true)}
              className="w-full h-14 text-lg shadow-lg shadow-primary/20"
              size="lg"
            >
              <ShoppingCart className="h-5 w-5 mr-3" />
              Ver Pedido ({cartItemCount}) · {cartTotal.toFixed(2)}€
            </Button>
          </div>
        </div>
      )}

      <CartSheet
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={(itemId, quantity) => {
          if (quantity === 0) {
            setCart((prev) => prev.filter((i) => i.id !== itemId))
          } else {
            setCart((prev) => prev.map((i) => (i.id === itemId ? { ...i, quantity } : i)))
          }
        }}
        tableId={table.id}
        restaurantId={table.restaurant_id}
        onOrderComplete={() => {
          setCart([])
          setIsCartOpen(false)
        }}
      />
    </div>
  )
}
