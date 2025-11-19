-- Setup Supabase Storage Buckets for Image Uploads
-- IMPORTANT: Create buckets through Supabase Dashboard UI instead of SQL

/*
===========================================
SETUP INSTRUCTIONS (Use Dashboard UI)
===========================================

Step 1: Go to Storage in Supabase Dashboard
   https://supabase.com/dashboard/project/YOUR_PROJECT/storage/buckets

Step 2: Create Menu Images Bucket
   - Click "New Bucket"
   - Name: menu-images
   - Public bucket: ✅ YES (checked)
   - File size limit: 5 MB
   - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
   - Click "Create bucket"

Step 3: Create Inventory Images Bucket
   - Click "New Bucket"
   - Name: inventory-images
   - Public bucket: ✅ YES (checked)
   - File size limit: 5 MB
   - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
   - Click "Create bucket"

Step 4: Verify Both Buckets
   - You should see:
     ✅ menu-images (public)
     ✅ inventory-images (public)

===========================================
POLICIES (Automatic when using Dashboard)
===========================================

When you create a PUBLIC bucket through the Dashboard, 
Supabase automatically creates these policies:

✅ Public SELECT (anyone can view images)
✅ Authenticated INSERT (logged-in users can upload)
✅ Authenticated UPDATE (logged-in users can update)
✅ Authenticated DELETE (logged-in users can delete)

No manual policy creation needed!

===========================================
ALTERNATIVE: SQL Method (Advanced)
===========================================

If you MUST use SQL (not recommended), you need to:
1. Switch to service_role in SQL Editor
2. Or use Supabase CLI with admin privileges

But Dashboard method is MUCH easier and recommended.

*/

-- This is just for verification after creating buckets via Dashboard
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id IN ('menu-images', 'inventory-images');
