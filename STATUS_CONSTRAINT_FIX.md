# 🔧 CRITICAL FIX: Orders Status Constraint Issue

## Root Cause Analysis

### The Problem
The database has a CHECK constraint that only allows these statuses:
- `'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'`

But the application code uses these statuses:
- `'pending', 'approved', 'declined', 'completed'`

**Result**: When trying to approve or decline orders, the database rejects the update with error:
```
new row for relation "orders" violates check constraint "orders_status_check"
```

## Solution

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Migration

Copy and paste this SQL:

```sql
-- Drop the old check constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add the new check constraint with correct status values
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'approved', 'declined', 'completed'));
```

### Step 3: Click "Run" or press Ctrl+Enter

You should see a success message.

### Step 4: Verify the Fix

Run this query to confirm:

```sql
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'orders_status_check';
```

Expected output:
```
orders_status_check | CHECK (status IN ('pending', 'approved', 'declined', 'completed'))
```

### Step 5: (Optional) Migrate Existing Orders

If you have existing orders with old status values, run:

```sql
-- Check current statuses
SELECT status, COUNT(*) FROM orders GROUP BY status;

-- Migrate if needed
UPDATE orders SET status = 'approved' WHERE status IN ('confirmed', 'preparing');
UPDATE orders SET status = 'completed' WHERE status IN ('ready', 'delivered');
UPDATE orders SET status = 'declined' WHERE status = 'cancelled';
```

## Status Flow (Corrected)

```
Customer Places Order
        ↓
    [pending] ──────────────────┐
        ↓                       ↓
    Admin Reviews           [declined]
        ↓                    (with reason)
    [approved]
  (with prep time)
        ↓
   Food Prepared
        ↓
    [completed]
 (inventory deducted)
```

## After Running the SQL

1. No need to restart the dev server
2. Test immediately:
   - Go to `/admin`
   - Try approving an order
   - Try declining an order
   - Both should work now! ✅

## Files Modified

- `scripts/016_fix_orders_status_constraint.sql` (migration script)
- No code changes needed - just database schema fix

---

**Run the SQL now and your order approval/decline will work perfectly!** 🎉
