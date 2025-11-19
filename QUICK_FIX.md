# 🚀 Quick Fix Guide - RLS Error Resolution

## ⚡ Problem
**Error**: `new row violates row-level security policy`

**When**: Editing menu items or uploading images in admin panel

**Why**: Database had RLS enabled but missing UPDATE policies for authenticated users

---

## ✅ Complete Solution (3 Steps)

### **Step 1: Run Database Migration**

Open Supabase SQL Editor and run:

```
scripts/008_fix_rls_comprehensive.sql
```

**This will:**
- ✅ Create missing `inventory` and `item_inventory_mapping` tables
- ✅ Set up 24 RLS policies (4 per table × 6 tables)
- ✅ Enable authenticated admins to INSERT/UPDATE/DELETE
- ✅ Keep public users able to SELECT and place orders

**Expected Result:**
```
RLS SETUP COMPLETE!
✅ items (4 policies)
✅ categories (4 policies)
✅ inventory (4 policies)
✅ item_inventory_mapping (4 policies)
✅ orders (4 policies)
✅ order_items (4 policies)
```

---

### **Step 2: Clear Cache & Re-login**

1. **Clear browser cache**: `Ctrl + Shift + Delete`
2. **Logout** from admin panel (if logged in)
3. **Login again** at `http://localhost:3000/login`

This ensures your session has the latest permissions.

---

### **Step 3: Test It Works**

1. Go to **Menu Management**: `http://localhost:3000/admin/menu`
2. Click **Edit** on any menu item
3. Click **"Change Image"** or **"Upload Image"**
4. Select a new image file
5. Watch it compress and upload ✅
6. Update other fields (name, price, etc.)
7. Click **"Save Changes"** ✅

**It should work perfectly now!**

---

## 🔍 What Was Fixed

### **Database Level**
- **Before**: Only SELECT policies existed
- **After**: Full CRUD policies for authenticated users

```sql
-- Now you have these policies on items table:
✅ items_select_public (anyone can view)
✅ items_insert_authenticated (admins can add)
✅ items_update_authenticated (admins can edit) ← THIS WAS MISSING
✅ items_delete_authenticated (admins can delete)
```

### **Code Level**
- **Before**: Storage upload didn't check authentication
- **After**: Verifies session before upload

```typescript
// Added to lib/storage.ts:
const { session } = await supabase.auth.getSession()
if (!session) return error('Must be logged in')
```

---

## 📁 Files Changed

### **Created:**
- `scripts/008_fix_rls_comprehensive.sql` - Complete RLS fix migration
- `RLS_FIX_GUIDE.md` - Comprehensive troubleshooting guide

### **Modified:**
- `lib/storage.ts` - Added authentication check to uploadImage()

---

## 🎯 Quick Verification

Run this in Supabase SQL Editor to verify policies exist:

```sql
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'items'
ORDER BY cmd;
```

**Should show:**
```
items | items_delete_authenticated | DELETE
items | items_insert_authenticated | INSERT  
items | items_select_public        | SELECT
items | items_update_authenticated | UPDATE  ← Must exist!
```

---

## 🐛 If Still Not Working

### **Check 1: Are you logged in?**
```javascript
// In browser console:
const supabase = createClient()
const { data } = await supabase.auth.getSession()
console.log('Session:', data.session)
```

**Expected**: Should see a `session` object with user details.  
**If null**: Logout and login again.

---

### **Check 2: Did migration run successfully?**
```sql
SELECT COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('items', 'inventory');
```

**Expected**: Should return `8` (4 policies × 2 tables).  
**If less**: Re-run the migration script.

---

### **Check 3: Is table RLS enabled?**
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'items';
```

**Expected**: `rowsecurity = true`  
**If false**: Run `ALTER TABLE items ENABLE ROW LEVEL SECURITY;`

---

## 💡 Understanding the Fix

### **What is RLS?**
Row Level Security = Database-level access control

**Without RLS**: App checks if user is admin, then allows operation  
**With RLS**: Postgres checks user role, blocks unauthorized queries

### **Why Did It Fail?**
Your database had:
- ✅ RLS enabled on tables
- ✅ SELECT policies for public users
- ❌ **Missing** UPDATE/INSERT/DELETE policies for authenticated users

So when you tried to update an item:
```
Admin clicks "Save" → App sends UPDATE query → Postgres checks RLS
  → No UPDATE policy for authenticated role → ❌ BLOCKED
```

### **How Did We Fix It?**
Added comprehensive policies:
```sql
CREATE POLICY "items_update_authenticated"
ON items FOR UPDATE
TO authenticated
USING (true)      -- Can update any row
WITH CHECK (true); -- No restrictions
```

Now:
```
Admin clicks "Save" → App sends UPDATE query → Postgres checks RLS
  → UPDATE policy exists for authenticated → ✅ ALLOWED
```

---

## 🎉 Success Indicators

After implementing the fix, you should be able to:

- ✅ Edit menu item names and descriptions
- ✅ Upload new images for menu items
- ✅ Replace existing images (old deleted automatically)
- ✅ Update prices and stock quantities
- ✅ Toggle availability and featured status
- ✅ Add new menu items with images
- ✅ Delete menu items
- ✅ Manage inventory with images
- ✅ All admin operations work smoothly

---

## 📚 Additional Resources

**For detailed explanation**: See `RLS_FIX_GUIDE.md`  
**For setup instructions**: See `SETUP.md`  
**For storage setup**: See `STORAGE_SETUP.md`

---

## ⏱️ Estimated Time

- **Step 1** (Run migration): 30 seconds
- **Step 2** (Clear cache & login): 1 minute  
- **Step 3** (Test): 2 minutes

**Total**: ~4 minutes to complete fix

---

## 🆘 Still Having Issues?

If the error persists after following all steps:

1. Check browser console for specific error messages
2. Check Supabase Dashboard → Logs → Postgres Logs
3. Verify environment variables in `.env.local` are correct
4. Try logging out and back in
5. Hard refresh the page (`Ctrl + F5`)

---

**Status**: ✅ **Solution Ready to Deploy**

Run the migration script and you're good to go! 🚀
