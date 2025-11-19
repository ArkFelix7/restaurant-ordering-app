-- DIRECT UPDATE TEST
-- This tests if authenticated UPDATE actually works
-- Run this WHILE LOGGED IN to your admin panel in another tab

-- =====================================================
-- STEP 1: Check your authentication
-- =====================================================

SELECT 
  auth.uid() as my_user_id,
  auth.role() as my_role,
  auth.email() as my_email;

-- If my_user_id is NULL, you're not authenticated!

-- =====================================================
-- STEP 2: Get a test item to update
-- =====================================================

SELECT 
  id,
  name,
  price,
  stock_quantity,
  is_available
FROM items
LIMIT 1;

-- Copy the 'id' from the result above

-- =====================================================
-- STEP 3: Try updating that item (REPLACE the ID below)
-- =====================================================

-- ⚠️ REPLACE 'PASTE-ITEM-ID-HERE' with actual ID from step 2
UPDATE items
SET 
  name = name,  -- No change, just testing UPDATE works
  price = price,
  stock_quantity = stock_quantity
WHERE id = 'a3ad1953-a8ca-46d8-9c9a-26fc149dccc8'
RETURNING *;

-- If this works → RLS is fine, issue is in your application code
-- If this fails → Check the error message carefully

-- =====================================================
-- STEP 4: Alternative test - Try inserting then deleting
-- =====================================================

-- Test INSERT
INSERT INTO items (
  name,
  description,
  price,
  category_id,
  image_url,
  is_available,
  is_featured,
  stock_quantity,
  display_order
) VALUES (
  'TEST ITEM - DELETE ME',
  'Testing RLS policies',
  9.99,
  (SELECT id FROM categories LIMIT 1),
  null,
  true,
  false,
  100,
  999
)
RETURNING id, name;

-- If successful, copy the ID and delete it:
-- DELETE FROM items WHERE id = 'paste-new-id-here';
