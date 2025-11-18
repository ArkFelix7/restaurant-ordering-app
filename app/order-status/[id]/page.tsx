'use client'

import { useState, useEffect } from 'react'
import { Order } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, CheckCircle2, XCircle, Package, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function OrderStatusPage() {
  const params = useParams()
  const orderId = params.id as string
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`)
      if (response.ok) {
        const data = await response.json()
        setOrder(data)
        
        // Calculate time remaining if order is approved
        if (data.status === 'approved' && data.estimated_ready_at) {
          const now = new Date().getTime()
          const readyAt = new Date(data.estimated_ready_at).getTime()
          const remaining = Math.max(0, Math.floor((readyAt - now) / 1000 / 60))
          setTimeRemaining(remaining)
        } else if (data.status === 'completed') {
          setTimeRemaining(0)
        } else {
          setTimeRemaining(null)
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
    
    // Set up real-time subscription for order updates
    const { createClient } = require('@/lib/supabase/client')
    const supabase = createClient()
    
    const subscription = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload: any) => {
          console.log('Order updated:', payload.new)
          setOrder(payload.new)
          
          // Update time remaining
          if (payload.new.status === 'approved' && payload.new.estimated_ready_at) {
            const now = new Date().getTime()
            const readyAt = new Date(payload.new.estimated_ready_at).getTime()
            const remaining = Math.max(0, Math.floor((readyAt - now) / 1000 / 60))
            setTimeRemaining(remaining)
          } else if (payload.new.status === 'completed') {
            setTimeRemaining(0)
          } else {
            setTimeRemaining(null)
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [orderId])

  // Update countdown timer every minute
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => (prev !== null && prev > 0 ? prev - 1 : 0))
      }, 60000) // Update every minute
      return () => clearInterval(interval)
    }
  }, [timeRemaining])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading order status...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">Order not found</h1>
          <Button asChild className="mt-4">
            <Link href="/">Back to Menu</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Order Status</h1>
              <p className="text-sm text-muted-foreground">
                Order #{order.id.slice(0, 8)}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Status Card */}
        {order.status === 'pending' && (
          <Card className="mb-6 border-yellow-500 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <Clock className="h-6 w-6" />
                Waiting for Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your order has been received and is waiting for the restaurant to approve it. 
                This page will update automatically once your order is approved.
              </p>
            </CardContent>
          </Card>
        )}

        {order.status === 'approved' && (
          <Card className="mb-6 border-green-500 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-6 w-6" />
                Order Approved
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Great news! Your order has been approved and is being prepared.
              </p>
              {timeRemaining !== null && (
                <div className="text-center p-6 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Estimated time remaining</p>
                  <p className="text-5xl font-bold text-primary">
                    {timeRemaining}
                  </p>
                  <p className="text-xl font-semibold mt-2">
                    {timeRemaining === 1 ? 'minute' : 'minutes'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {order.status === 'completed' && (
          <Card className="mb-6 border-green-600 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-6 w-6" />
                Order Ready!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your order is ready! Thank you for your order.
              </p>
            </CardContent>
          </Card>
        )}

        {order.status === 'declined' && (
          <Card className="mb-6 border-red-500 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="h-6 w-6" />
                Order Declined
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">
                Unfortunately, your order has been declined.
              </p>
              {order.declined_reason && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-semibold mb-1">Reason:</p>
                  <p className="text-sm">{order.declined_reason}</p>
                </div>
              )}
              <Button asChild className="mt-4 w-full">
                <Link href="/">Order Again</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Phone Number</span>
              <span className="font-medium">{order.customer_phone}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order Time</span>
              <span className="font-medium">
                {new Date(order.created_at).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-4">
              <span>Total</span>
              <span>${order.total_amount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
