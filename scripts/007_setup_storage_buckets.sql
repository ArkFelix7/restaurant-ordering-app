-- Setup Supabase Storage Buckets for Image Uploads
-- Run this script in your Supabase SQL Editor

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('menu-images', 'menu-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']),
  ('inventory-images', 'inventory-images', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Public read access for menu images
CREATE POLICY IF NOT EXISTS "Public Access to Menu Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');

-- Public read access for inventory images
CREATE POLICY IF NOT EXISTS "Public Access to Inventory Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'inventory-images');

-- Allow authenticated users to upload menu images
CREATE POLICY IF NOT EXISTS "Authenticated users can upload menu images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'menu-images');

-- Allow authenticated users to upload inventory images
CREATE POLICY IF NOT EXISTS "Authenticated users can upload inventory images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'inventory-images');

-- Allow authenticated users to update their uploaded menu images
CREATE POLICY IF NOT EXISTS "Authenticated users can update menu images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'menu-images')
WITH CHECK (bucket_id = 'menu-images');

-- Allow authenticated users to update their uploaded inventory images
CREATE POLICY IF NOT EXISTS "Authenticated users can update inventory images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'inventory-images')
WITH CHECK (bucket_id = 'inventory-images');

-- Allow authenticated users to delete menu images
CREATE POLICY IF NOT EXISTS "Authenticated users can delete menu images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'menu-images');

-- Allow authenticated users to delete inventory images
CREATE POLICY IF NOT EXISTS "Authenticated users can delete inventory images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'inventory-images');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket 
ON storage.objects(bucket_id);

CREATE INDEX IF NOT EXISTS idx_storage_objects_name 
ON storage.objects(name);

-- Verify buckets were created
SELECT * FROM storage.buckets WHERE id IN ('menu-images', 'inventory-images');
