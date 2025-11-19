import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: body.customer_name || null,
          customer_phone: body.customer_phone,
          customer_email: body.customer_email || null,
          delivery_address: body.delivery_address || null,
          order_notes: body.order_notes || null,
          status: 'pending',
          total_amount: body.total_amount,
        },
      ])
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = body.items.map((item: any) => ({
      order_id: order.id,
      item_id: item.item_id,
      item_name: item.item_name,
      item_price: item.item_price,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(orders || [])
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
