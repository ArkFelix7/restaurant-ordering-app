'use client'

import { useState, useEffect } from 'react'
import { Order } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ClipboardList, Clock, CheckCircle2, RefreshCw, DollarSign, LayoutDashboard, XCircle, History } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; orderId: string | null }>({
    open: false,
    orderId: null,
  })
  const [declineDialog, setDeclineDialog] = useState<{ open: boolean; orderId: string | null }>({
    open: false,
    orderId: null,
  })
  const [preparationTime, setPreparationTime] = useState('30')
  const [declineReason, setDeclineReason] = useState('')

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/orders')
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
    
    // Set up real-time subscription for order updates
    const { createClient } = require('@/lib/supabase/client')
    const supabase = createClient()
    
    const subscription = supabase
      .channel('orders-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload: any) => {
          console.log('Orders updated:', payload)
          // Refresh orders when any change occurs
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleApproveOrder = async () => {
    if (!approveDialog.orderId) return

    try {
      const response = await fetch(`/api/orders/${approveDialog.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          preparation_time: parseInt(preparationTime),
        }),
      })

      if (response.ok) {
        const updated = await response.json()
        setOrders((prev) =>
          prev.map((order) =>
            order.id === approveDialog.orderId
              ? { ...order, status: 'approved', preparation_time: updated.preparation_time, estimated_ready_at: updated.estimated_ready_at }
              : order
          )
        )
        setApproveDialog({ open: false, orderId: null })
        setPreparationTime('30')
      }
    } catch (error) {
      console.error('Error approving order:', error)
    }
  }

  const handleDeclineOrder = async () => {
    if (!declineDialog.orderId) return

    try {
      const response = await fetch(`/api/orders/${declineDialog.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'decline',
          reason: declineReason,
        }),
      })

      if (response.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === declineDialog.orderId
              ? { ...order, status: 'declined', declined_reason: declineReason }
              : order
          )
        )
        setDeclineDialog({ open: false, orderId: null })
        setDeclineReason('')
      }
    } catch (error) {
      console.error('Error declining order:', error)
    }
  }

  const handleCompleteOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      })

      if (response.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: 'completed' } : order
          )
        )
      }
    } catch (error) {
      console.error('Error completing order:', error)
    }
  }

  const activeOrders = orders.filter((o) => o.status !== 'completed')
  const completedOrders = orders.filter((o) => o.status === 'completed')

  const stats = {
    pending: orders.filter((o) => o.status === 'pending').length,
    approved: orders.filter((o) => o.status === 'approved').length,
    total: orders.reduce((sum, o) => sum + o.total_amount, 0),
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Orders Dashboard</h1>
              <p className="text-muted-foreground">Manage incoming orders</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/admin/menu">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Menu
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/inventory">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Inventory
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/history">
                  <History className="h-4 w-4 mr-2" />
                  History
                </Link>
              </Button>
              <Button onClick={fetchOrders} variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.total.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Orders */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Active Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading orders...
              </div>
            ) : activeOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No active orders</p>
              </div>
            ) : (
              activeOrders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">
                              Order #{order.id.slice(0, 8)}
                            </h3>
                            <Badge variant={order.status === 'pending' ? 'secondary' : order.status === 'approved' ? 'default' : 'destructive'}>
                              {order.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {order.customer_phone}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            ${order.total_amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      {order.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => setApproveDialog({ open: true, orderId: order.id })}
                            className="flex-1"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => setDeclineDialog({ open: true, orderId: order.id })}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Decline
                          </Button>
                        </div>
                      )}

                      {order.status === 'approved' && (
                        <div className="space-y-2">
                          {order.preparation_time && (
                            <p className="text-sm text-muted-foreground">
                              Preparation time: {order.preparation_time} minutes
                            </p>
                          )}
                          <Button
                            onClick={() => handleCompleteOrder(order.id)}
                            className="w-full"
                          >
                            Mark as Completed
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        {completedOrders.length > 0 && (
          <Accordion type="single" collapsible>
            <AccordionItem value="completed">
              <AccordionTrigger className="px-6 py-4 bg-card rounded-lg border">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-semibold">
                    Completed Orders Today ({completedOrders.length})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4">
                <div className="space-y-4">
                  {completedOrders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.customer_phone}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${order.total_amount.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </main>

      <Dialog open={approveDialog.open} onOpenChange={(open) => setApproveDialog({ open, orderId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="prep-time">Preparation Time (minutes)</Label>
              <Input
                id="prep-time"
                type="number"
                value={preparationTime}
                onChange={(e) => setPreparationTime(e.target.value)}
                min="1"
                placeholder="30"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialog({ open: false, orderId: null })}>
              Cancel
            </Button>
            <Button onClick={handleApproveOrder}>Approve Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={declineDialog.open} onOpenChange={(open) => setDeclineDialog({ open, orderId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="decline-reason">Reason for Declining</Label>
              <Textarea
                id="decline-reason"
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="e.g., Item out of stock, kitchen closed..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeclineDialog({ open: false, orderId: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeclineOrder}>
              Decline Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
