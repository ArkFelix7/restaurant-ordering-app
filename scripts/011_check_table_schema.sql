-- CHECK TABLE SCHEMA AND MISSING COLUMNS
-- Run this to see if all columns your code expects actually exist

-- =====================================================
-- CHECK 1: Full items table structure
-- =====================================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'items'
ORDER BY ordinal_position;

-- =====================================================
-- CHECK 2: Verify specific columns exist
-- =====================================================

SELECT 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'name') 
    THEN '✅ name exists' 
    ELSE '❌ name MISSING' END as name_check,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'description') 
    THEN '✅ description exists' 
    ELSE '❌ description MISSING' END as description_check,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'price') 
    THEN '✅ price exists' 
    ELSE '❌ price MISSING' END as price_check,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'category_id') 
    THEN '✅ category_id exists' 
    ELSE '❌ category_id MISSING' END as category_id_check,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'image_url') 
    THEN '✅ image_url exists' 
    ELSE '❌ image_url MISSING' END as image_url_check,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'is_available') 
    THEN '✅ is_available exists' 
    ELSE '❌ is_available MISSING' END as is_available_check,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'is_featured') 
    THEN '✅ is_featured exists' 
    ELSE '❌ is_featured MISSING' END as is_featured_check,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'stock_quantity') 
    THEN '✅ stock_quantity exists' 
    ELSE '❌ stock_quantity MISSING' END as stock_quantity_check,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'items' AND column_name = 'display_order') 
    THEN '✅ display_order exists' 
    ELSE '❌ display_order MISSING' END as display_order_check;

-- =====================================================
-- CHECK 3: Try a simple UPDATE test (should fail if RLS issue)
-- =====================================================

-- Get the first item
SELECT id, name FROM items LIMIT 1;

-- Note: Copy the ID from above and test update manually:
-- UPDATE items SET name = name WHERE id = 'paste-id-here';

-- =====================================================
-- CHECK 4: Test what role you're executing as
-- =====================================================

SELECT 
  current_user as postgres_user,
  session_user as session_user,
  current_database() as database;

-- =====================================================
-- CHECK 5: See if there are any column constraints
-- =====================================================

SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  tc.is_deferrable,
  tc.initially_deferred
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'items'
ORDER BY tc.constraint_type, kcu.column_name;
