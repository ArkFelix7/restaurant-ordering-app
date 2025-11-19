'use client'

import { useState, useEffect } from 'react'
import { Order, OrderItem } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ArrowLeft, Calendar, DollarSign, Package } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface OrderWithItems extends Order {
  order_items?: OrderItem[]
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [dateFilter, setDateFilter] = useState('all')
  const supabase = createClient()

  const loadOrders = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setOrders(data)
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const viewOrderDetails = (order: OrderWithItems) => {
    setSelectedOrder(order)
    setDetailsOpen(true)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'approved':
        return 'secondary'
      case 'pending':
        return 'outline'
      case 'declined':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const filteredOrders = orders.filter((order) => {
    if (dateFilter === 'all') return true
    const orderDate = new Date(order.created_at)
    const today = new Date()
    
    if (dateFilter === 'today') {
      return orderDate.toDateString() === today.toDateString()
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      return orderDate >= weekAgo
    } else if (dateFilter === 'month') {
      return (
        orderDate.getMonth() === today.getMonth() &&
        orderDate.getFullYear() === today.getFullYear()
      )
    }
    return true
  })

  const stats = {
    total: filteredOrders.length,
    completed: filteredOrders.filter((o) => o.status === 'completed').length,
    revenue: filteredOrders
      .filter((o) => o.status === 'completed')
      .reduce((sum, o) => sum + o.total_amount, 0),
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">Order History</h1>
              <p className="text-muted-foreground">View all past orders and statistics</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={dateFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilter('all')}
              >
                All Time
              </Button>
              <Button
                variant={dateFilter === 'today' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilter('today')}
              >
                Today
              </Button>
              <Button
                variant={dateFilter === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilter('week')}
              >
                This Week
              </Button>
              <Button
                variant={dateFilter === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateFilter('month')}
              >
                This Month
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
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No orders found for the selected period
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">
                          #{order.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(order.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            {order.customer_name || 'N/A'}
                            <div className="text-sm text-muted-foreground">
                              {order.customer_phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            {order.order_items && order.order_items.length > 0 ? (
                              <>
                                <div className="text-sm font-medium mb-1">
                                  {order.order_items.length} {order.order_items.length === 1 ? 'item' : 'items'}
                                </div>
                                <div className="text-xs text-muted-foreground space-y-0.5">
                                  {order.order_items.slice(0, 2).map((item, idx) => (
                                    <div key={idx} className="truncate">
                                      {item.quantity}× {item.item_name}
                                    </div>
                                  ))}
                                  {order.order_items.length > 2 && (
                                    <div className="text-xs text-muted-foreground italic">
                                      +{order.order_items.length - 2} more
                                    </div>
                                  )}
                                </div>
                              </>
                            ) : (
                              <span className="text-sm text-muted-foreground">No items</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold">
                          ${order.total_amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => viewOrderDetails(order)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Order Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?.id.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Customer Name</p>
                  <p className="font-medium">{selectedOrder.customer_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium">
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={getStatusBadgeVariant(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </div>
                {selectedOrder.preparation_time && (
                  <div>
                    <p className="text-sm text-muted-foreground">Preparation Time</p>
                    <p className="font-medium">{selectedOrder.preparation_time} minutes</p>
                  </div>
                )}
                {selectedOrder.declined_reason && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Decline Reason</p>
                    <p className="font-medium text-destructive">
                      {selectedOrder.declined_reason}
                    </p>
                  </div>
                )}
              </div>

              {selectedOrder.order_items && selectedOrder.order_items.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Order Items</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.order_items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.item_name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>${item.item_price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            ${item.subtotal.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span>${selectedOrder.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
