'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

interface CartButtonProps {
  onClick: () => void
}

export function CartButton({ onClick }: CartButtonProps) {
  const { totalItems, totalAmount } = useCart()

  return (
    <Button
      onClick={onClick}
      size="lg"
      className="fixed bottom-6 right-6 h-14 px-6 rounded-full shadow-lg z-50"
    >
      <ShoppingCart className="h-5 w-5 mr-2" />
      <span className="font-semibold">
        View Cart {totalItems > 0 && `(${totalItems})`}
      </span>
      {totalAmount > 0 && (
        <Badge variant="secondary" className="ml-3">
          ${totalAmount.toFixed(2)}
        </Badge>
      )}
    </Button>
  )
}
