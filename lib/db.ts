import { MenuItem, Category } from './types'
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client for client-side operations
// Note: In production, use proper environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

export async function getCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order')

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getCategories:', error)
    return []
  }
}

export async function getMenuItems(): Promise<MenuItem[]> {
  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('is_available', true)
      .order('display_order')

    if (error) {
      console.error('Error fetching menu items:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getMenuItems:', error)
    return []
  }
}
