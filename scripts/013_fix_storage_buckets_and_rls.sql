-- =====================================================
-- STORAGE BUCKETS AND RLS FIX
-- This is the COMPLETE solution for storage upload issues
-- Run this script in Supabase SQL Editor
-- =====================================================

-- IMPORTANT: You may need to run this with elevated privileges
-- If regular SQL Editor doesn't work, use the service_role or run via Supabase CLI

-- =====================================================
-- STEP 1: CREATE STORAGE BUCKETS (if not exists)
-- =====================================================

-- Note: Storage buckets might already exist from Dashboard
-- This ensures they exist with correct settings

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
-- STEP 2: DROP EXISTING STORAGE POLICIES (clean slate)
-- =====================================================

-- Drop all existing policies on storage.objects
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public can view images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view menu images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view inventory images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload menu images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload inventory images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update menu images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update inventory images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete menu images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete inventory images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to read menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to read inventory-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload inventory-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update inventory-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete menu-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete inventory-images" ON storage.objects;

-- =====================================================
-- STEP 3: ENABLE RLS ON STORAGE.OBJECTS
-- =====================================================

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: CREATE COMPREHENSIVE STORAGE RLS POLICIES
-- =====================================================

-- ============ PUBLIC READ ACCESS (for displaying images) ============

-- Anyone can view/download images from menu-images bucket
CREATE POLICY "storage_menu_images_select_public"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'menu-images');

-- Anyone can view/download images from inventory-images bucket
CREATE POLICY "storage_inventory_images_select_public"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'inventory-images');

-- ============ AUTHENTICATED UPLOAD ACCESS (for admins) ============

-- Authenticated users can upload to menu-images bucket
CREATE POLICY "storage_menu_images_insert_authenticated"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'menu-images');

-- Authenticated users can upload to inventory-images bucket
CREATE POLICY "storage_inventory_images_insert_authenticated"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'inventory-images');

-- ============ AUTHENTICATED UPDATE ACCESS (for admins) ============

-- Authenticated users can update menu images
CREATE POLICY "storage_menu_images_update_authenticated"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'menu-images')
WITH CHECK (bucket_id = 'menu-images');

-- Authenticated users can update inventory images
CREATE POLICY "storage_inventory_images_update_authenticated"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'inventory-images')
WITH CHECK (bucket_id = 'inventory-images');

-- ============ AUTHENTICATED DELETE ACCESS (for admins) ============

-- Authenticated users can delete menu images
CREATE POLICY "storage_menu_images_delete_authenticated"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'menu-images');

-- Authenticated users can delete inventory images
CREATE POLICY "storage_inventory_images_delete_authenticated"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'inventory-images');

-- =====================================================
-- STEP 5: VERIFICATION QUERIES
-- =====================================================

-- Check that buckets exist
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

-- Check storage policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as operation,
  CASE 
    WHEN policyname LIKE '%menu%' THEN '📁 menu-images'
    WHEN policyname LIKE '%inventory%' THEN '📦 inventory-images'
    ELSE '❓ other'
  END as bucket_target
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY cmd, policyname;

-- Count policies per operation
SELECT 
  cmd as operation,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
GROUP BY cmd
ORDER BY cmd;

-- =====================================================
-- STEP 6: TEST AUTHENTICATION (run this while logged in)
-- =====================================================

SELECT 
  auth.uid() as user_id,
  auth.role() as current_role,
  auth.email() as user_email,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN '✅ You are authenticated'
    ELSE '❌ You are NOT authenticated'
  END as authentication_status;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE '✅ STORAGE RLS CONFIGURATION COMPLETE!';
  RAISE NOTICE '==============================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Storage Buckets Created:';
  RAISE NOTICE '  📁 menu-images (public, 5MB limit)';
  RAISE NOTICE '  📦 inventory-images (public, 5MB limit)';
  RAISE NOTICE '';
  RAISE NOTICE 'RLS Policies Created:';
  RAISE NOTICE '  🌐 Public SELECT (anyone can view images)';
  RAISE NOTICE '  🔐 Authenticated INSERT (upload images)';
  RAISE NOTICE '  🔐 Authenticated UPDATE (modify images)';
  RAISE NOTICE '  🔐 Authenticated DELETE (remove images)';
  RAISE NOTICE '';
  RAISE NOTICE 'Total Policies: 8 (4 per bucket)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Verify queries above show buckets and policies';
  RAISE NOTICE '2. Clear browser cache (Ctrl+Shift+Delete)';
  RAISE NOTICE '3. Logout and login again to refresh session';
  RAISE NOTICE '4. Try uploading an image in menu management';
  RAISE NOTICE '5. Check browser console for any errors';
  RAISE NOTICE '';
  RAISE NOTICE '==============================================';
END $$;
