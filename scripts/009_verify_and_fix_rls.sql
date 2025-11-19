-- RLS POLICY VERIFICATION AND FIX
-- Run this in Supabase SQL Editor to check and fix your policies

-- =====================================================
-- STEP 1: CHECK CURRENT POLICY DETAILS
-- =====================================================

-- This shows the ACTUAL policy expressions (USING and WITH CHECK clauses)
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as "USING expression",
  with_check as "WITH CHECK expression"
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('items', 'inventory', 'item_inventory_mapping')
ORDER BY tablename, cmd, policyname;

-- =====================================================
-- STEP 2: DROP AND RECREATE POLICIES WITH CORRECT EXPRESSIONS
-- =====================================================

-- ITEMS TABLE
DROP POLICY IF EXISTS "items_select_public" ON items;
DROP POLICY IF EXISTS "items_insert_authenticated" ON items;
DROP POLICY IF EXISTS "items_update_authenticated" ON items;
DROP POLICY IF EXISTS "items_delete_authenticated" ON items;

CREATE POLICY "items_select_public"
ON items FOR SELECT
TO public
USING (true);

CREATE POLICY "items_insert_authenticated"
ON items FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "items_update_authenticated"
ON items FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "items_delete_authenticated"
ON items FOR DELETE
TO authenticated
USING (true);

-- INVENTORY TABLE
DROP POLICY IF EXISTS "inventory_select_public" ON inventory;
DROP POLICY IF EXISTS "inventory_insert_authenticated" ON inventory;
DROP POLICY IF EXISTS "inventory_update_authenticated" ON inventory;
DROP POLICY IF EXISTS "inventory_delete_authenticated" ON inventory;

CREATE POLICY "inventory_select_public"
ON inventory FOR SELECT
TO public
USING (true);

CREATE POLICY "inventory_insert_authenticated"
ON inventory FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "inventory_update_authenticated"
ON inventory FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "inventory_delete_authenticated"
ON inventory FOR DELETE
TO authenticated
USING (true);

-- ITEM_INVENTORY_MAPPING TABLE
DROP POLICY IF EXISTS "mapping_select_public" ON item_inventory_mapping;
DROP POLICY IF EXISTS "mapping_insert_authenticated" ON item_inventory_mapping;
DROP POLICY IF EXISTS "mapping_update_authenticated" ON item_inventory_mapping;
DROP POLICY IF EXISTS "mapping_delete_authenticated" ON item_inventory_mapping;
DROP POLICY IF EXISTS "Allow public read access to item_inventory" ON item_inventory_mapping;
DROP POLICY IF EXISTS "Allow authenticated users to insert item_inventory" ON item_inventory_mapping;
DROP POLICY IF EXISTS "Allow authenticated users to update item_inventory" ON item_inventory_mapping;
DROP POLICY IF EXISTS "Allow authenticated users to delete item_inventory" ON item_inventory_mapping;

CREATE POLICY "mapping_select_public"
ON item_inventory_mapping FOR SELECT
TO public
USING (true);

CREATE POLICY "mapping_insert_authenticated"
ON item_inventory_mapping FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "mapping_update_authenticated"
ON item_inventory_mapping FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "mapping_delete_authenticated"
ON item_inventory_mapping FOR DELETE
TO authenticated
USING (true);

-- CATEGORIES TABLE
DROP POLICY IF EXISTS "categories_select_public" ON categories;
DROP POLICY IF EXISTS "categories_insert_authenticated" ON categories;
DROP POLICY IF EXISTS "categories_update_authenticated" ON categories;
DROP POLICY IF EXISTS "categories_delete_authenticated" ON categories;

CREATE POLICY "categories_select_public"
ON categories FOR SELECT
TO public
USING (true);

CREATE POLICY "categories_insert_authenticated"
ON categories FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "categories_update_authenticated"
ON categories FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "categories_delete_authenticated"
ON categories FOR DELETE
TO authenticated
USING (true);

-- ORDERS TABLE
DROP POLICY IF EXISTS "orders_select_public" ON orders;
DROP POLICY IF EXISTS "orders_insert_public" ON orders;
DROP POLICY IF EXISTS "orders_update_authenticated" ON orders;
DROP POLICY IF EXISTS "orders_delete_authenticated" ON orders;

CREATE POLICY "orders_select_public"
ON orders FOR SELECT
TO public
USING (true);

CREATE POLICY "orders_insert_public"
ON orders FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "orders_update_authenticated"
ON orders FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "orders_delete_authenticated"
ON orders FOR DELETE
TO authenticated
USING (true);

-- ORDER_ITEMS TABLE
DROP POLICY IF EXISTS "order_items_select_public" ON order_items;
DROP POLICY IF EXISTS "order_items_insert_public" ON order_items;
DROP POLICY IF EXISTS "order_items_update_authenticated" ON order_items;
DROP POLICY IF EXISTS "order_items_delete_authenticated" ON order_items;

CREATE POLICY "order_items_select_public"
ON order_items FOR SELECT
TO public
USING (true);

CREATE POLICY "order_items_insert_public"
ON order_items FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "order_items_update_authenticated"
ON order_items FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "order_items_delete_authenticated"
ON order_items FOR DELETE
TO authenticated
USING (true);

-- =====================================================
-- STEP 3: VERIFY POLICIES ARE CORRECT
-- =====================================================

-- Check that all policies have proper expressions
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual = 'true'::text THEN '✅ true'
    WHEN qual IS NULL THEN '⚠️ NULL'
    ELSE '❌ ' || qual::text
  END as using_clause,
  CASE 
    WHEN with_check = 'true'::text THEN '✅ true'
    WHEN with_check IS NULL AND cmd IN ('SELECT', 'DELETE') THEN '✅ N/A'
    WHEN with_check IS NULL THEN '⚠️ NULL'
    ELSE '❌ ' || with_check::text
  END as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- =====================================================
-- STEP 4: TEST AUTHENTICATION
-- =====================================================

-- Check if you're currently authenticated
SELECT 
  auth.uid() as user_id,
  auth.role() as current_role,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN '✅ Authenticated'
    ELSE '❌ Not Authenticated'
  END as status;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'RLS POLICIES RECREATED WITH CORRECT EXPRESSIONS';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'All policies now use: USING (true) and WITH CHECK (true)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Check the verification query above';
  RAISE NOTICE '2. Clear browser cache (Ctrl+Shift+Delete)';
  RAISE NOTICE '3. Logout and login again';
  RAISE NOTICE '4. Test menu editing';
  RAISE NOTICE '==============================================';
END $$;
