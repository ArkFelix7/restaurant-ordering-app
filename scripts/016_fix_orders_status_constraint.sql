-- ============================================================================
-- Script: 016_fix_orders_status_constraint.sql
-- Purpose: Update the orders table status check constraint to match application logic
-- Issue: Database constraint allows different statuses than what the app uses
-- ============================================================================

-- Drop the old check constraint
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- Add the new check constraint with the correct status values
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('pending', 'approved', 'declined', 'completed'));

-- Verify the constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conname = 'orders_status_check';

-- ============================================================================
-- Status Flow:
-- ============================================================================
-- pending   -> Order created, waiting for restaurant approval
-- approved  -> Restaurant accepted the order, preparing food
-- declined  -> Restaurant declined the order (out of stock, etc.)
-- completed -> Order is ready and completed
-- ============================================================================

-- Check if there are any existing orders with old status values that need migration
SELECT status, COUNT(*) 
FROM orders 
GROUP BY status;

-- If needed, migrate old status values:
-- UPDATE orders SET status = 'approved' WHERE status = 'confirmed';
-- UPDATE orders SET status = 'approved' WHERE status = 'preparing';
-- UPDATE orders SET status = 'completed' WHERE status = 'ready';
-- UPDATE orders SET status = 'completed' WHERE status = 'delivered';
-- UPDATE orders SET status = 'declined' WHERE status = 'cancelled';

