import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Helper function to deduct inventory when order is completed
async function deductInventory(orderId: string) {
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
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const orderId = params.id

    if (body.action === 'approve') {
      const preparationTime = body.preparation_time
      const estimatedReadyAt = new Date(
        Date.now() + preparationTime * 60000
      ).toISOString()

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
  { params }: { params: { id: string } }
) {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', params.id)
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
