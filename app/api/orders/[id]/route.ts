import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Helper function to deduct inventory when order is completed
async function deductInventory(orderId: string) {
  const supabase = createAdminClient()
  try {
    // Get order items
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('item_id, quantity')
      .eq('order_id', orderId)

    if (itemsError || !orderItems) {
      console.error('Error fetching order items:', itemsError)
      return
    }

    // For each order item, get its inventory mappings and deduct
    for (const orderItem of orderItems) {
      const { data: mappings, error: mappingsError } = await supabase
        .from('item_inventory_mapping')
        .select('inventory_id, quantity_required')
        .eq('item_id', orderItem.item_id)

      if (mappingsError || !mappings) continue

      // Deduct inventory for each mapping
      for (const mapping of mappings) {
        const totalDeduction = mapping.quantity_required * orderItem.quantity

        // Get current inventory
        const { data: inventory, error: invError } = await supabase
          .from('inventory')
          .select('quantity_available')
          .eq('id', mapping.inventory_id)
          .single()

        if (invError || !inventory) continue

        // Update inventory
        const newQuantity = Math.max(0, inventory.quantity_available - totalDeduction)
        
        await supabase
          .from('inventory')
          .update({ quantity_available: newQuantity })
          .eq('id', mapping.inventory_id)

        console.log(`Deducted ${totalDeduction} from inventory ${mapping.inventory_id}`)
      }
    }
  } catch (error) {
    console.error('Error deducting inventory:', error)
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()
    const { id: orderId } = await params

    if (body.action === 'approve') {
      const preparationTime = body.preparation_time
      const now = new Date()
      const readyTime = new Date(now.getTime() + (preparationTime * 60000))
      const estimatedReadyAt = readyTime.toISOString()

      console.log('Order approval - Time calculation:', {
        orderId,
        preparationTime,
        now: now.toISOString(),
        readyTime: readyTime.toISOString(),
        estimatedReadyAt,
        calculatedMs: preparationTime * 60000,
        nowMs: now.getTime(),
        readyTimeMs: readyTime.getTime()
      })

      const { data, error } = await supabase
        .from('orders')
        .update({
          status: 'approved',
          preparation_time: preparationTime,
          estimated_ready_at: estimatedReadyAt,
        })
        .eq('id', orderId)
        .select()
        .single()

      if (error) throw error

      console.log('Saved to DB:', {
        id: data.id,
        preparation_time: data.preparation_time,
        estimated_ready_at: data.estimated_ready_at
      })

      return NextResponse.json(data)
    } else if (body.action === 'decline') {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: 'declined',
          declined_reason: body.reason || 'No reason provided',
        })
        .eq('id', orderId)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json(data)
    } else if (body.action === 'complete') {
      // Deduct inventory before marking as complete
      await deductInventory(orderId)

      const { data, error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', orderId)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json(data)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminClient()
    const { id } = await params
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}
