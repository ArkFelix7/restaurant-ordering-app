export interface Category {
  id: string
  name: string
  description: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MenuItem {
  id: string
  category_id: string | null
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_available: boolean
  is_featured: boolean
  stock_quantity: number
  display_order: number
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  customer_name: string
  customer_email: string | null
  customer_phone: string
  delivery_address: string | null
  order_notes: string | null
  status: 'pending' | 'approved' | 'declined' | 'completed'
  total_amount: number
  preparation_time: number | null
  estimated_ready_at: string | null
  declined_reason: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  item_id: string | null
  item_name: string
  item_price: number
  quantity: number
  subtotal: number
  created_at: string
}

export interface CartItem {
  item: MenuItem
  quantity: number
}

export interface Inventory {
  id: string
  name: string
  image_url: string | null
  quantity_available: number
  unit: string
  created_at: string
  updated_at: string
}

export interface ItemInventoryMapping {
  id: string
  item_id: string
  inventory_id: string
  quantity_required: number
  inventory?: Inventory
  created_at: string
}

export interface MenuItemWithInventory extends MenuItem {
  inventory_mappings?: ItemInventoryMapping[]
}
