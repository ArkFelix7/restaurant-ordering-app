-- Insert sample categories
INSERT INTO categories (name, description, display_order) VALUES
  ('Appetizers', 'Start your meal right', 1),
  ('Main Courses', 'Our signature dishes', 2),
  ('Desserts', 'Sweet endings', 3),
  ('Beverages', 'Drinks and refreshments', 4)
ON CONFLICT DO NOTHING;

-- Insert sample menu items
INSERT INTO items (category_id, name, description, price, image_url, is_available, stock_quantity, display_order) 
SELECT 
  c.id,
  'Spring Rolls',
  'Crispy vegetable rolls served with sweet chili sauce',
  8.99,
  '/placeholder.svg?height=400&width=400',
  true,
  50,
  1
FROM categories c WHERE c.name = 'Appetizers'
ON CONFLICT DO NOTHING;

INSERT INTO items (category_id, name, description, price, image_url, is_available, stock_quantity, display_order)
SELECT 
  c.id,
  'Garlic Bread',
  'Toasted bread with garlic butter and herbs',
  6.99,
  '/placeholder.svg?height=400&width=400',
  true,
  30,
  2
FROM categories c WHERE c.name = 'Appetizers'
ON CONFLICT DO NOTHING;

INSERT INTO items (category_id, name, description, price, image_url, is_available, is_featured, stock_quantity, display_order)
SELECT 
  c.id,
  'Grilled Salmon',
  'Fresh salmon fillet with seasonal vegetables',
  24.99,
  '/placeholder.svg?height=400&width=400',
  true,
  true,
  20,
  1
FROM categories c WHERE c.name = 'Main Courses'
ON CONFLICT DO NOTHING;

INSERT INTO items (category_id, name, description, price, image_url, is_available, stock_quantity, display_order)
SELECT 
  c.id,
  'Beef Burger',
  'Juicy beef patty with lettuce, tomato, and cheese',
  15.99,
  '/placeholder.svg?height=400&width=400',
  true,
  40,
  2
FROM categories c WHERE c.name = 'Main Courses'
ON CONFLICT DO NOTHING;

INSERT INTO items (category_id, name, description, price, image_url, is_available, stock_quantity, display_order)
SELECT 
  c.id,
  'Pasta Carbonara',
  'Classic Italian pasta with bacon and cream sauce',
  18.99,
  '/placeholder.svg?height=400&width=400',
  true,
  25,
  3
FROM categories c WHERE c.name = 'Main Courses'
ON CONFLICT DO NOTHING;

INSERT INTO items (category_id, name, description, price, image_url, is_available, stock_quantity, display_order)
SELECT 
  c.id,
  'Chocolate Lava Cake',
  'Warm chocolate cake with molten center',
  9.99,
  '/placeholder.svg?height=400&width=400',
  true,
  15,
  1
FROM categories c WHERE c.name = 'Desserts'
ON CONFLICT DO NOTHING;

INSERT INTO items (category_id, name, description, price, image_url, is_available, stock_quantity, display_order)
SELECT 
  c.id,
  'Tiramisu',
  'Classic Italian coffee-flavored dessert',
  8.99,
  '/placeholder.svg?height=400&width=400',
  true,
  20,
  2
FROM categories c WHERE c.name = 'Desserts'
ON CONFLICT DO NOTHING;

INSERT INTO items (category_id, name, description, price, image_url, is_available, stock_quantity, display_order)
SELECT 
  c.id,
  'Fresh Lemonade',
  'Homemade lemonade with mint',
  4.99,
  '/placeholder.svg?height=400&width=400',
  true,
  100,
  1
FROM categories c WHERE c.name = 'Beverages'
ON CONFLICT DO NOTHING;

INSERT INTO items (category_id, name, description, price, image_url, is_available, stock_quantity, display_order)
SELECT 
  c.id,
  'Iced Coffee',
  'Cold brew coffee served over ice',
  5.99,
  '/placeholder.svg?height=400&width=400',
  true,
  80,
  2
FROM categories c WHERE c.name = 'Beverages'
ON CONFLICT DO NOTHING;
