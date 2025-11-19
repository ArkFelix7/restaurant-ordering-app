# Storage Setup Guide

## 🎯 Quick Setup (5 minutes)

### Step 1: Create Buckets via Dashboard

Go to your Supabase Dashboard:
```
https://supabase.com/dashboard/project/fnhuvwcoeqbrfocfmdbw/storage/buckets
```

### Step 2: Create "menu-images" Bucket

1. Click **"New Bucket"**
2. Fill in:
   - **Name**: `menu-images`
   - **Public bucket**: ✅ **Check this box**
   - **File size limit**: `5 MB`
   - **Allowed MIME types**: 
     ```
     image/jpeg
     image/png
     image/webp
     image/gif
     ```
3. Click **"Create bucket"**

### Step 3: Create "inventory-images" Bucket

1. Click **"New Bucket"** again
2. Fill in:
   - **Name**: `inventory-images`
   - **Public bucket**: ✅ **Check this box**
   - **File size limit**: `5 MB`
   - **Allowed MIME types**: 
     ```
     image/jpeg
     image/png
     image/webp
     image/gif
     ```
3. Click **"Create bucket"**

### Step 4: Verify ✅

You should now see in Storage:
- ✅ `menu-images` (public)
- ✅ `inventory-images` (public)

## 🔐 Policies (Automatic)

When you create a **public bucket** through the Dashboard, Supabase automatically sets up:

✅ **Public read** - Anyone can view images  
✅ **Authenticated upload** - Only logged-in admins can upload  
✅ **Authenticated update** - Only logged-in admins can replace images  
✅ **Authenticated delete** - Only logged-in admins can delete images  

**No manual policy configuration needed!**

## ✨ Test It

After creating the buckets:

1. Start your app: `npm run dev`
2. Login at: `http://localhost:3000/login`
3. Go to: `http://localhost:3000/admin/menu`
4. Click "Add Menu Item"
5. Click "Upload Image"
6. Select an image file
7. Watch it upload! 🚀

The image will be compressed, uploaded to Supabase Storage, and the URL will be saved automatically.

## 🎉 Done!

Your storage is now configured. The app will handle:
- Image compression (50-80% size reduction)
- Upload progress tracking
- Automatic URL generation
- Old image cleanup when replacing
