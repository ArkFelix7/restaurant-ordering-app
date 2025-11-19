-- Fix estimated_ready_at column to use TIMESTAMPTZ instead of TIMESTAMP
-- This ensures timezone information is preserved when storing and retrieving timestamps

ALTER TABLE orders 
ALTER COLUMN estimated_ready_at TYPE TIMESTAMPTZ USING estimated_ready_at AT TIME ZONE 'UTC';

-- Add comment to document the change
COMMENT ON COLUMN orders.estimated_ready_at IS 'Timestamp with timezone indicating when the order will be ready';
