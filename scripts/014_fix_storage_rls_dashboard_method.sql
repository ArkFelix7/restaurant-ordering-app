-- =====================================================
-- STORAGE BUCKETS FIX - PERMISSIONS-SAFE VERSION
-- This version only touches tables you have permissions for
-- Run this in Supabase SQL Editor with your normal login
-- =====================================================

-- =====================================================
-- STEP 1: CREATE STORAGE BUCKETS (this usually works)
-- =====================================================

-- Insert or update buckets - this should work with normal permissions
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('menu-images', 'menu-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]),
  ('inventory-images', 'inventory-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[])
ON CONFLICT (id) 
DO UPDATE SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[];

-- =====================================================
-- STEP 2: VERIFICATION - Check buckets exist
-- =====================================================

SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id IN ('menu-images', 'inventory-images')
ORDER BY id;

-- =====================================================
-- STEP 3: CHECK EXISTING POLICIES
-- =====================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY cmd, policyname;

-- =====================================================
-- IMPORTANT NOTICE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ STORAGE BUCKETS CREATED/UPDATED';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  NEXT: CREATE STORAGE POLICIES VIA DASHBOARD';
  RAISE NOTICE '';
  RAISE NOTICE 'Storage policies require elevated privileges.';
  RAISE NOTICE 'Please create them via Supabase Dashboard:';
  RAISE NOTICE '';
  RAISE NOTICE '1. Go to: Storage → Policies in Supabase Dashboard';
  RAISE NOTICE '2. For menu-images bucket, create 4 policies:';
  RAISE NOTICE '   - SELECT for public (read access)';
  RAISE NOTICE '   - INSERT for authenticated (upload)';
  RAISE NOTICE '   - UPDATE for authenticated (modify)';
  RAISE NOTICE '   - DELETE for authenticated (remove)';
  RAISE NOTICE '';
  RAISE NOTICE '3. Repeat for inventory-images bucket';
  RAISE NOTICE '';
  RAISE NOTICE 'Policy expressions:';
  RAISE NOTICE '   USING: bucket_id = ''menu-images''';
  RAISE NOTICE '   WITH CHECK: bucket_id = ''menu-images''';
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
END $$;
