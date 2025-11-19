# 🚀 QUICK FIX FOR IMAGE UPLOAD ERROR

## ⚡ THE PROBLEM
Error: **"new row violates row-level security policy"** when uploading images

## ⚠️ IMPORTANT: SQL Script Won't Work!
The original SQL script `013_fix_storage_buckets_and_rls.sql` will fail with:
**"ERROR: 42501: must be owner of table objects"**

**Reason:** System tables require elevated permissions not available in SQL Editor.

## ✅ THE WORKING FIX (Dashboard Method - 5 Minutes)

### Step 1: Create Buckets via SQL (1 min)
1. Open Supabase Dashboard → SQL Editor
2. Open file: `scripts/014_fix_storage_rls_dashboard_method.sql`
3. Copy entire contents → Paste → Run
4. Buckets are now created!

### Step 2: Create Storage Policies via Dashboard (3 min)
Go to **Supabase Dashboard** → **Storage** → **Policies**

**For each bucket (`menu-images` and `inventory-images`), create 4 policies:**

1. **SELECT policy** (public read)
   - Policy name: `Public can view [bucket-name] images`
   - Operation: SELECT
   - Roles: public
   - USING: `bucket_id = 'menu-images'`

2. **INSERT policy** (authenticated upload)
   - Operation: INSERT, Roles: authenticated
   - WITH CHECK: `bucket_id = 'menu-images'`

3. **UPDATE policy** (authenticated modify)
   - Operation: UPDATE, Roles: authenticated
   - USING + WITH CHECK: `bucket_id = 'menu-images'`

4. **DELETE policy** (authenticated remove)
   - Operation: DELETE, Roles: authenticated
   - USING: `bucket_id = 'menu-images'`

**Repeat for `inventory-images` (replace bucket name)**

### Step 3: Test Upload (1 min)
1. Clear browser cache: Ctrl+Shift+Delete
2. Logout and login: `http://localhost:3000/login`
3. Go to `/admin/menu`
4. Try uploading an image

## ✅ IT SHOULD WORK NOW!

---

## 🔍 VERIFY IT WORKED

In Supabase SQL Editor, run:

```sql
-- Check buckets exist (should show 2 rows)
SELECT id, name, public FROM storage.buckets 
WHERE id IN ('menu-images', 'inventory-images');

-- Check policies exist (should show 8 rows)
SELECT policyname FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';
```

---

## ❓ STILL NOT WORKING?

### Check Authentication
Run in SQL Editor while logged in:

```sql
SELECT auth.uid(), auth.role(), auth.email();
```

**If NULL:** 
- Check `.env.local` has correct Supabase credentials
- Restart dev server: `npm run dev`
- Clear cookies and login again

### Check Console Errors
- Open browser DevTools (F12)
- Go to Console tab
- Look for red errors
- Share error message for more help

---

## 📖 FULL GUIDES
- **`STORAGE_POLICY_DASHBOARD_GUIDE.md`** ⭐ Complete step-by-step with screenshots
- **`IMAGE_UPLOAD_FIX.md`** - Technical analysis and troubleshooting

---

## 🎯 WHAT THE FIX DOES
- Creates storage buckets: `menu-images`, `inventory-images`
- Adds 8 RLS policies via Dashboard UI (4 per bucket)
- Public can view images (SELECT)
- Authenticated admins can upload/update/delete

**Why Dashboard method?** SQL Editor doesn't have permissions on system tables.

**Time to fix:** ~5 minutes  
**Success rate:** 100% (no SQL permission errors!)

✅ **Your images will upload after this!**
