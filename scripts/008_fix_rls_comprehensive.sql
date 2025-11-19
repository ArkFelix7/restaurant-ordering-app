-- COMPREHENSIVE RLS FIX FOR RESTAURANT ORDERING APP
-- This script creates all missing tables and sets up proper Row Level Security
-- Run this entire script in Supabase SQL Editor

-- =====================================================
-- STEP 1: CREATE MISSING TABLES
-- =====================================================

-- Create inventory table (if not exists)
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL DEFAULT 'units',
  minimum_quantity DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create item_inventory_mapping table (if not exists)
CREATE TABLE IF NOT EXISTS item_inventory_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  quantity_required DECIMAL(10,2) NOT NULL DEFAULT 1.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(item_id, inventory_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_name ON inventory(name);
CREATE INDEX IF NOT EXISTS idx_item_inventory_mapping_item_id ON item_inventory_mapping(item_id);
CREATE INDEX IF NOT EXISTS idx_item_inventory_mapping_inventory_id ON item_inventory_mapping(inventory_id);

-- =====================================================
-- STEP 2: DROP ALL EXISTING RLS POLICIES
-- =====================================================

-- Items table
DROP POLICY IF EXISTS "Public can view items" ON items;
DROP POLICY IF EXISTS "Allow public read access to items" ON items;
DROP POLICY IF EXISTS "Authenticated users can insert items" ON items;
DROP POLICY IF EXISTS "Authenticated users can update items" ON items;
DROP POLICY IF EXISTS "Authenticated users can delete items" ON items;
DROP POLICY IF EXISTS "Allow authenticated users to insert items" ON items;
DROP POLICY IF EXISTS "Allow authenticated users to update items" ON items;
DROP POLICY IF EXISTS "Allow authenticated users to delete items" ON items;

-- Categories table
DROP POLICY IF EXISTS "Public can view categories" ON categories;
DROP POLICY IF EXISTS "Allow public read access to categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can insert categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON categories;

-- Inventory table
DROP POLICY IF EXISTS "Public can view inventory" ON inventory;
DROP POLICY IF EXISTS "Allow public read access to inventory" ON inventory;
DROP POLICY IF EXISTS "Authenticated users can insert inventory" ON inventory;
DROP POLICY IF EXISTS "Authenticated users can update inventory" ON inventory;
DROP POLICY IF EXISTS "Authenticated users can delete inventory" ON inventory;
DROP POLICY IF EXISTS "Allow authenticated users to insert inventory" ON inventory;
DROP POLICY IF EXISTS "Allow authenticated users to update inventory" ON inventory;
DROP POLICY IF EXISTS "Allow authenticated users to delete inventory" ON inventory;

-- Item_inventory_mapping table
DROP POLICY IF EXISTS "Public can view item_inventory_mapping" ON item_inventory_mapping;
DROP POLICY IF EXISTS "Allow public read access to item_inventory_mapping" ON item_inventory_mapping;
DROP POLICY IF EXISTS "Authenticated users can insert item_inventory_mapping" ON item_inventory_mapping;
DROP POLICY IF EXISTS "Authenticated users can update item_inventory_mapping" ON item_inventory_mapping;
DROP POLICY IF EXISTS "Authenticated users can delete item_inventory_mapping" ON item_inventory_mapping;
DROP POLICY IF EXISTS "Allow authenticated users to insert item_inventory_mapping" ON item_inventory_mapping;
DROP POLICY IF EXISTS "Allow authenticated users to update item_inventory_mapping" ON item_inventory_mapping;
DROP POLICY IF EXISTS "Allow authenticated users to delete item_inventory_mapping" ON item_inventory_mapping;

-- Orders table
DROP POLICY IF EXISTS "Public can view orders" ON orders;
DROP POLICY IF EXISTS "Public can insert orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can view all orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;

-- Order_items table
DROP POLICY IF EXISTS "Public can view order_items" ON order_items;
DROP POLICY IF EXISTS "Public can insert order_items" ON order_items;
DROP POLICY IF EXISTS "Authenticated users can view all order_items" ON order_items;

-- =====================================================
-- STEP 3: ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_inventory_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: CREATE COMPREHENSIVE RLS POLICIES
-- =====================================================

-- =============== ITEMS TABLE ===============

-- Everyone can view items (for public menu)
CREATE POLICY "items_select_public"
ON items FOR SELECT
TO public
USING (true);

-- Authenticated users (admins) can insert items
CREATE POLICY "items_insert_authenticated"
ON items FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users (admins) can update items
CREATE POLICY "items_update_authenticated"
ON items FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Authenticated users (admins) can delete items
CREATE POLICY "items_delete_authenticated"
ON items FOR DELETE
TO authenticated
USING (true);

-- =============== CATEGORIES TABLE ===============

-- Everyone can view categories
CREATE POLICY "categories_select_public"
ON categories FOR SELECT
TO public
USING (true);

-- Authenticated users can insert categories
CREATE POLICY "categories_insert_authenticated"
ON categories FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update categories
CREATE POLICY "categories_update_authenticated"
ON categories FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Authenticated users can delete categories
CREATE POLICY "categories_delete_authenticated"
ON categories FOR DELETE
TO authenticated
USING (true);

-- =============== INVENTORY TABLE ===============

-- Everyone can view inventory (for stock status)
CREATE POLICY "inventory_select_public"
ON inventory FOR SELECT
TO public
USING (true);

-- Authenticated users can insert inventory
CREATE POLICY "inventory_insert_authenticated"
ON inventory FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update inventory
CREATE POLICY "inventory_update_authenticated"
ON inventory FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Authenticated users can delete inventory
CREATE POLICY "inventory_delete_authenticated"
ON inventory FOR DELETE
TO authenticated
USING (true);

-- =============== ITEM_INVENTORY_MAPPING TABLE ===============

-- Everyone can view mappings
CREATE POLICY "mapping_select_public"
ON item_inventory_mapping FOR SELECT
TO public
USING (true);

-- Authenticated users can insert mappings
CREATE POLICY "mapping_insert_authenticated"
ON item_inventory_mapping FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update mappings
CREATE POLICY "mapping_update_authenticated"
ON item_inventory_mapping FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Authenticated users can delete mappings
CREATE POLICY "mapping_delete_authenticated"
ON item_inventory_mapping FOR DELETE
TO authenticated
USING (true);

-- =============== ORDERS TABLE ===============

-- Public can view and insert orders (for customers)
CREATE POLICY "orders_select_public"
ON orders FOR SELECT
TO public
USING (true);

CREATE POLICY "orders_insert_public"
ON orders FOR INSERT
TO public
WITH CHECK (true);

-- Authenticated users can update orders (approve/decline)
CREATE POLICY "orders_update_authenticated"
ON orders FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Authenticated users can delete orders
CREATE POLICY "orders_delete_authenticated"
ON orders FOR DELETE
TO authenticated
USING (true);

-- =============== ORDER_ITEMS TABLE ===============

-- Public can view and insert order items
CREATE POLICY "order_items_select_public"
ON order_items FOR SELECT
TO public
USING (true);

CREATE POLICY "order_items_insert_public"
ON order_items FOR INSERT
TO public
WITH CHECK (true);

-- Authenticated users can update order items
CREATE POLICY "order_items_update_authenticated"
ON order_items FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Authenticated users can delete order items
CREATE POLICY "order_items_delete_authenticated"
ON order_items FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- STEP 5: VERIFICATION QUERIES
-- =====================================================

-- Show all tables and their RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('items', 'categories', 'inventory', 'item_inventory_mapping', 'orders', 'order_items')
ORDER BY tablename;

-- Show all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as operation,
  CASE 
    WHEN qual IS NOT NULL THEN 'Has USING clause'
    ELSE 'No USING clause'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
    ELSE 'No WITH CHECK clause'
  END as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Count policies per table
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'RLS SETUP COMPLETE!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Tables configured:';
  RAISE NOTICE '  ✅ items (4 policies)';
  RAISE NOTICE '  ✅ categories (4 policies)';
  RAISE NOTICE '  ✅ inventory (4 policies)';
  RAISE NOTICE '  ✅ item_inventory_mapping (4 policies)';
  RAISE NOTICE '  ✅ orders (4 policies)';
  RAISE NOTICE '  ✅ order_items (4 policies)';
  RAISE NOTICE '';
  RAISE NOTICE 'Permissions:';
  RAISE NOTICE '  🌐 Public: SELECT all tables';
  RAISE NOTICE '  🌐 Public: INSERT orders & order_items';
  RAISE NOTICE '  🔐 Authenticated: Full CRUD on all tables';
  RAISE NOTICE '';
  RAISE NOTICE 'Check the queries above for verification!';
  RAISE NOTICE '==============================================';
END $$;
