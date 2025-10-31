"use client"

import { useState } from "react"
import type { MenuCategory, MenuItem, Table, Restaurant } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Plus, Minus, UtensilsCrossed } from "lucide-react"
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
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{restaurant.name}</h1>
              <p className="text-sm text-muted-foreground">Mesa {table.table_number}</p>
            </div>
            <Button onClick={() => setIsCartOpen(true)} variant="outline" className="relative bg-transparent">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {categories.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <UtensilsCrossed className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">El menú no está disponible en este momento</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => {
              const categoryItems = getItemsByCategory(category.id)
              if (categoryItems.length === 0) return null

              return (
                <div key={category.id}>
                  <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
                  <div className="grid gap-4">
                    {categoryItems.map((item) => {
                      const cartItem = cart.find((i) => i.id === item.id)
                      return (
                        <Card key={item.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg">{item.name}</CardTitle>
                                {item.description && (
                                  <CardDescription className="mt-1">{item.description}</CardDescription>
                                )}
                              </div>
                              <span className="text-xl font-bold text-primary ml-4">{item.price.toFixed(2)} €</span>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {cartItem ? (
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeFromCart(item.id)}
                                  className="h-9 w-9 p-0"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="font-semibold min-w-8 text-center">{cartItem.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => addToCart(item)}
                                  className="h-9 w-9 p-0"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button onClick={() => addToCart(item)} size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Añadir
                              </Button>
                            )}
                          </CardContent>
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
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
          <div className="container mx-auto">
            <Button onClick={() => setIsCartOpen(true)} className="w-full" size="lg">
              Ver Pedido ({cartItemCount}) - {cartTotal.toFixed(2)} €
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
