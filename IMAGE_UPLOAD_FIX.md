# 🔧 IMAGE UPLOAD RLS FIX - COMPLETE ANALYSIS & SOLUTION

## 📋 EXECUTIVE SUMMARY

**Problem:** "new row violates row-level security policy" when uploading/updating/modifying item images

**Root Cause:** Missing or misconfigured Row-Level Security (RLS) policies on Supabase Storage buckets (`storage.objects` table)

**Solution:** Run the comprehensive SQL script `013_fix_storage_buckets_and_rls.sql`

---

## 🔍 DETAILED ANALYSIS

### What I Found

After analyzing your complete codebase, I identified the following:

#### ✅ Working Correctly:
1. **Database Table RLS Policies** - All properly configured
   - `items` table: ✅ 4 policies (SELECT public, INSERT/UPDATE/DELETE authenticated)
   - `categories` table: ✅ 4 policies
   - `inventory` table: ✅ 4 policies
   - `orders` and `order_items` tables: ✅ Properly configured

2. **Authentication System** - Functioning properly
   - ✅ Middleware correctly validates sessions
   - ✅ Supabase client setup is correct
   - ✅ Login/logout flow works
   - ✅ Admin route protection works

3. **Image Upload Code** - Well implemented
   - ✅ `lib/storage.ts` - Proper upload logic with auth check
   - ✅ `components/image-upload.tsx` - Good UI component
   - ✅ `app/admin/menu/page.tsx` - Correct integration

#### ❌ The Actual Problem:

4. **Storage Bucket RLS Policies** - MISSING!
   - ❌ No policies on `storage.objects` table
   - ❌ Script `007_setup_storage_buckets.sql` only had instructions, not actual SQL
   - ❌ Buckets may or may not exist
   - ❌ Even if buckets exist via Dashboard, storage RLS policies were never created

### Why Images Fail to Upload

When you try to upload an image, this happens:

```
1. User clicks "Upload Image" in admin panel
   ↓
2. ImageUpload component captures file
   ↓
3. storage.ts uploadImage() function is called
   ↓
4. Code checks authentication ✅ (passes - you're logged in)
   ↓
5. Code calls supabase.storage.from('menu-images').upload()
   ↓
6. Supabase tries to INSERT into storage.objects table
   ↓
7. RLS CHECK on storage.objects table
   ↓
8. ❌ NO POLICY EXISTS for authenticated INSERT
   ↓
9. ERROR: "new row violates row-level security policy"
```

**The key insight:** Even though you're authenticated and your database table RLS works, **Supabase Storage has its own separate RLS policies** on the `storage.objects` system table!

---

## 🎯 THE SOLUTION

### Step 1: Run the SQL Script

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Create a new query
4. Copy and paste the entire contents of `scripts/013_fix_storage_buckets_and_rls.sql`
5. Click **Run** or press Ctrl+Enter

This script will:
- ✅ Create `menu-images` and `inventory-images` buckets (if they don't exist)
- ✅ Set correct bucket configuration (public, 5MB limit, allowed MIME types)
- ✅ Clean up any conflicting old policies
- ✅ Create 8 comprehensive RLS policies (4 per bucket)
- ✅ Enable public read access (for displaying images)
- ✅ Enable authenticated write access (for uploading/updating/deleting)

### Step 2: Verify the Fix

After running the script, check the output:

```sql
-- Should show 2 buckets
SELECT id, name, public FROM storage.buckets 
WHERE id IN ('menu-images', 'inventory-images');

-- Should show 8 policies
SELECT policyname, cmd FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';
```

Expected policies:
- `storage_menu_images_select_public` (SELECT)
- `storage_menu_images_insert_authenticated` (INSERT)
- `storage_menu_images_update_authenticated` (UPDATE)
- `storage_menu_images_delete_authenticated` (DELETE)
- `storage_inventory_images_select_public` (SELECT)
- `storage_inventory_images_insert_authenticated` (INSERT)
- `storage_inventory_images_update_authenticated` (UPDATE)
- `storage_inventory_images_delete_authenticated` (DELETE)

### Step 3: Clear Browser Cache & Re-login

1. **Clear browser cache:**
   - Chrome: Ctrl+Shift+Delete → "Cookies and other site data" + "Cached images and files"
   - Or use Incognito/Private mode

2. **Logout and login again:**
   - Go to `/login`
   - Sign in with your admin credentials
   - This refreshes your authentication session

3. **Test image upload:**
   - Go to `/admin/menu`
   - Click "Add Menu Item" or "Edit" an existing item
   - Try uploading an image
   - Should work now! ✅

---

## 🔍 IF IT STILL DOESN'T WORK

### Debugging Steps:

#### 1. Check Authentication in SQL Editor

Run this while logged into your admin panel:

```sql
SELECT 
  auth.uid() as user_id,
  auth.role() as current_role,
  auth.email() as user_email;
```

**Expected:** Should show your user ID, role='authenticated', and email
**Problem:** If user_id is NULL, your session isn't being passed to the database

**Fix:**
- Check `.env.local` has correct `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Restart your Next.js dev server: `npm run dev`
- Clear cookies and login again

#### 2. Check Browser Console

Open Browser DevTools (F12) → Console tab

**Look for:**
- Network errors (red in Network tab)
- 401 Unauthorized errors → Authentication issue
- 403 Forbidden errors → RLS policy issue
- Storage error messages

#### 3. Test Direct Storage Upload

In SQL Editor, while logged in:

```sql
-- This tests if storage policies work
SELECT auth.uid(); -- Should show your user ID

-- Try direct insert (will fail if policies missing)
INSERT INTO storage.objects (
  bucket_id, 
  name, 
  owner, 
  metadata
) VALUES (
  'menu-images',
  'test-file.jpg',
  auth.uid(),
  '{"mimetype": "image/jpeg"}'::jsonb
);
```

**Expected:** Should succeed (or show "duplicate key" if file exists)
**Problem:** If it fails with RLS error, the policies didn't apply correctly

#### 4. Check Environment Variables

Create a test file to verify environment variables are loaded:

```typescript
// test-env.ts
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('SUPABASE_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...')
```

**Expected:** Both should show values (not undefined)
**Problem:** If undefined, `.env.local` file is missing or not loaded

**Fix:**
- Create `.env.local` in project root if missing
- Add:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your-project-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```
- Restart dev server

---

## 📊 WHAT THE FIX DOES

### Storage Bucket Configuration

```sql
Bucket: menu-images
- Public: true (anyone can view URLs)
- Max size: 5MB
- Allowed types: JPEG, PNG, WEBP, GIF

Bucket: inventory-images  
- Public: true (anyone can view URLs)
- Max size: 5MB
- Allowed types: JPEG, PNG, WEBP, GIF
```

### RLS Policy Matrix

| Operation | Public (Unauthenticated) | Authenticated Users |
|-----------|-------------------------|---------------------|
| SELECT (view) | ✅ Allowed | ✅ Allowed |
| INSERT (upload) | ❌ Denied | ✅ Allowed |
| UPDATE (modify) | ❌ Denied | ✅ Allowed |
| DELETE (remove) | ❌ Denied | ✅ Allowed |

### Security Model

1. **Public Read Access:**
   - Anyone can view/download images via public URLs
   - Required for customers to see menu item photos
   - No authentication needed to display images

2. **Authenticated Write Access:**
   - Only logged-in admin users can upload images
   - Only logged-in admin users can update/replace images
   - Only logged-in admin users can delete images

3. **Bucket Isolation:**
   - Policies are bucket-specific
   - `menu-images` and `inventory-images` have separate policies
   - Can't accidentally affect other buckets

---

## 🎓 LESSONS LEARNED

### Why This Happened

1. **Supabase Storage has TWO layers of access control:**
   - Bucket configuration (public/private)
   - RLS policies on `storage.objects` table

2. **Creating buckets via Dashboard UI doesn't automatically create RLS policies:**
   - The Dashboard creates the bucket
   - But RLS policies must be explicitly defined
   - Script `007` had instructions but no actual SQL

3. **Storage RLS is separate from table RLS:**
   - Your database tables (`items`, `categories`, etc.) had perfect RLS
   - But `storage.objects` system table had NO policies
   - These are independent systems

### Best Practices for Future

1. **Always define storage policies explicitly:**
   ```sql
   -- For every bucket, create 4 policies:
   CREATE POLICY "bucket_select_public" ON storage.objects FOR SELECT...
   CREATE POLICY "bucket_insert_auth" ON storage.objects FOR INSERT...
   CREATE POLICY "bucket_update_auth" ON storage.objects FOR UPDATE...
   CREATE POLICY "bucket_delete_auth" ON storage.objects FOR DELETE...
   ```

2. **Test storage immediately after setup:**
   - Don't wait until integration
   - Test upload/delete in SQL Editor first

3. **Use consistent policy naming:**
   - `storage_{bucket}_{operation}_{role}`
   - Makes debugging much easier

4. **Document the full stack:**
   - Client code (`storage.ts`)
   - Bucket configuration
   - RLS policies
   - Expected behavior

---

## 🚀 EXPECTED RESULTS AFTER FIX

### What Should Now Work:

✅ **Add Menu Item with Image:**
1. Go to `/admin/menu`
2. Click "Add Menu Item"
3. Fill in name, price, etc.
4. Click "Upload Image" or drag-drop
5. Select image file
6. Image uploads and preview appears
7. Click "Add Item"
8. Item appears in list with image

✅ **Edit Menu Item Image:**
1. Click "Edit" on existing item
2. Click "Change Image"
3. Select new image
4. Old image is deleted, new image uploads
5. Preview updates
6. Click "Save Changes"
7. Item updates with new image

✅ **Delete Menu Item:**
1. Click delete on item
2. Confirm deletion
3. Item and associated image are removed

✅ **View Images on Public Pages:**
1. Go to `/` (customer menu)
2. All menu item images display correctly
3. No authentication required to view

---

## 📞 STILL NEED HELP?

If you've run the script and still have issues, check:

1. **Exact error message in browser console**
2. **Result of authentication check query** (`SELECT auth.uid()`)
3. **Result of policy verification query** (in the script)
4. **Whether buckets exist** (`SELECT * FROM storage.buckets`)

Common final issues:
- Service role key vs anon key confusion
- Multiple Supabase projects (using wrong project)
- Browser extension blocking requests
- Antivirus/firewall blocking Supabase domains

---

## ✅ CHECKLIST

Use this to verify everything:

- [ ] Ran `013_fix_storage_buckets_and_rls.sql` script
- [ ] Verified 2 buckets exist (`menu-images`, `inventory-images`)
- [ ] Verified 8 RLS policies exist on `storage.objects`
- [ ] Cleared browser cache and cookies
- [ ] Logged out and logged back in
- [ ] Tested uploading an image in admin panel
- [ ] Verified image appears in menu list
- [ ] Verified image displays on public menu page
- [ ] Tested updating/replacing an image
- [ ] Tested deleting an item with image

**All checked?** Your image upload should be working perfectly! 🎉

---

## 📝 TECHNICAL SUMMARY

**Root Cause:**
- Missing RLS policies on `storage.objects` table prevented authenticated users from uploading files

**Solution:**
- Created comprehensive RLS policies for both storage buckets
- Enabled public SELECT (read) for image display
- Enabled authenticated INSERT/UPDATE/DELETE for admin operations

**Why It Works:**
- Supabase Storage checks RLS on `storage.objects` table for every operation
- Our policies explicitly allow authenticated users to write to specific buckets
- Public read access allows image URLs to work without authentication

**Result:**
- Admins can upload/update/delete images ✅
- Customers can view images without login ✅
- Proper security isolation maintained ✅

---

**Created:** November 18, 2025  
**Script:** `scripts/013_fix_storage_buckets_and_rls.sql`  
**Status:** Ready to deploy
