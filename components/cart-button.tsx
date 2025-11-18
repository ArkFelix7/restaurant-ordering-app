'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart } from 'lucide-react'
import { CartItem } from '@/lib/types'

interface CartButtonProps {
  cart: CartItem[]
  onClick: () => void
}

export function CartButton({ cart, onClick }: CartButtonProps) {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const total = cart.reduce((sum, item) => sum + item.item.price * item.quantity, 0)

  return (
    <Button
      onClick={onClick}
      size="lg"
      className="fixed bottom-6 right-6 h-14 px-6 rounded-full shadow-lg z-50"
    >
      <ShoppingCart className="h-5 w-5 mr-2" />
      <span className="font-semibold">
        View Cart {itemCount > 0 && `(${itemCount})`}
      </span>
      {total > 0 && (
        <Badge variant="secondary" className="ml-3">
          ${total.toFixed(2)}
        </Badge>
      )}
    </Button>
  )
}
