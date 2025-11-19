-- AUTHENTICATION DEBUG SCRIPT
-- Run this in Supabase SQL Editor while logged into your admin panel

-- =====================================================
-- CHECK 1: Are you authenticated in the database?
-- =====================================================

SELECT 
  auth.uid() as user_id,
  auth.role() as current_role,
  auth.email() as user_email,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN '✅ You are authenticated'
    ELSE '❌ You are NOT authenticated'
  END as authentication_status;

-- If user_id is NULL, your session is not being passed to the database!

-- =====================================================
-- CHECK 2: List all authenticated users
-- =====================================================

SELECT 
  id,
  email,
  created_at,
  last_sign_in_at,
  CASE 
    WHEN last_sign_in_at > NOW() - INTERVAL '1 hour' THEN '✅ Recent login'
    ELSE '⚠️ Old login'
  END as login_status
FROM auth.users
ORDER BY last_sign_in_at DESC;

-- =====================================================
-- CHECK 3: Test if UPDATE would work for authenticated user
-- =====================================================

-- This simulates an UPDATE as an authenticated user
-- Should return the policy check result
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression,
  with_check
FROM pg_policies
WHERE tablename = 'items' 
  AND cmd = 'UPDATE'
  AND 'authenticated' = ANY(roles);

-- =====================================================
-- CHECK 4: Verify items table structure
-- =====================================================

SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'items'
ORDER BY ordinal_position;

-- =====================================================
-- DIAGNOSTIC SUMMARY
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'AUTHENTICATION DIAGNOSTIC RESULTS';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Check the queries above:';
  RAISE NOTICE '';
  RAISE NOTICE '1. If user_id is NULL → Session not passed to DB';
  RAISE NOTICE '2. If no users listed → Need to create admin user';
  RAISE NOTICE '3. If policy not found → Policy misconfigured';
  RAISE NOTICE '4. If columns missing → Table structure issue';
  RAISE NOTICE '';
  RAISE NOTICE 'Common fixes:';
  RAISE NOTICE '- Clear browser cache completely';
  RAISE NOTICE '- Logout and login again';
  RAISE NOTICE '- Check .env.local has correct keys';
  RAISE NOTICE '- Verify middleware is running';
  RAISE NOTICE '==============================================';
END $$;
