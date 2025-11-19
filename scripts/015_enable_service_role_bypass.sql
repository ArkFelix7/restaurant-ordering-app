-- ============================================================================
-- Script: 015_enable_service_role_bypass.sql
-- Purpose: Ensure service role can perform all operations (this is default behavior)
-- Note: The service role key naturally bypasses RLS, but this documents the setup
-- ============================================================================

-- The service role key used in the API routes automatically bypasses RLS
-- This is Supabase's default behavior and requires no additional policies

-- For reference, here are the current RLS policies on the orders table:

-- View existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'orders';

-- ============================================================================
-- Optional: If you want to allow anon users to read their own orders
-- (not currently needed since we're using service role for all admin operations)
-- ============================================================================

-- DROP POLICY IF EXISTS "Allow anon to read all orders" ON orders;
-- CREATE POLICY "Allow anon to read all orders"
--   ON orders FOR SELECT
--   TO anon
--   USING (true);

-- DROP POLICY IF EXISTS "Allow anon to create orders" ON orders;
-- CREATE POLICY "Allow anon to create orders"
--   ON orders FOR INSERT
--   TO anon
--   WITH CHECK (true);

-- ============================================================================
-- Verification Query
-- ============================================================================

-- Check if RLS is enabled (should be true)
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('orders', 'order_items');

-- Expected output:
-- orders: true (RLS enabled, but service role bypasses it)
-- order_items: true (RLS enabled, but service role bypasses it)

-- ============================================================================
-- IMPORTANT NOTES:
-- ============================================================================
-- 1. The API now uses createAdminClient() with SUPABASE_SERVICE_ROLE_KEY
-- 2. Service role automatically bypasses ALL RLS policies
-- 3. Never expose service role key to the frontend
-- 4. Anon key is used for public read operations only
-- 5. All admin operations (create/update/delete orders) use service role
-- ============================================================================
