# 🔧 URGENT: Missing Service Role Key Setup

## Problem
The order approval system is failing because `SUPABASE_SERVICE_ROLE_KEY` is not configured.

## Solution

### Step 1: Get Your Service Role Key

1. Open your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Under "Project API keys", find the **`service_role`** key
5. Click to reveal and copy it (⚠️ Keep this secret - never expose to frontend!)

### Step 2: Add to .env.local

Open your `.env.local` file and add:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 3: Restart the Dev Server

After adding the key:

```bash
# Stop the server (Ctrl+C)
npm run dev
```

## Why This is Needed

- The service role key bypasses Row Level Security (RLS) policies
- Admin operations (approve/decline orders) require elevated permissions
- Without it, orders can be created but not modified

## Security Notes

✅ **DO:**
- Keep the service role key in `.env.local` (gitignored)
- Only use it in server-side API routes
- Never expose it to the frontend

❌ **DON'T:**
- Commit the service role key to version control
- Use it in client-side code
- Share it publicly

---

After completing these steps, the admin dashboard will be fully functional!
