-- Update orders table to add preparation time and declined reason
ALTER TABLE orders
ADD COLUMN preparation_time INTEGER,
ADD COLUMN estimated_ready_at TIMESTAMP,
ADD COLUMN declined_reason TEXT;

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  image_url TEXT,
  quantity_available INTEGER NOT NULL DEFAULT 0,
  unit VARCHAR(50) DEFAULT 'unit',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create item_inventory_mapping table to link menu items to inventory
CREATE TABLE IF NOT EXISTS item_inventory_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
  quantity_required DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX idx_item_inventory_item ON item_inventory_mapping(item_id);
CREATE INDEX idx_item_inventory_inventory ON item_inventory_mapping(inventory_id);

-- Seed some inventory items
INSERT INTO inventory (name, image_url, quantity_available, unit) VALUES
('Tomatoes', '/placeholder.svg?height=100&width=100', 50, 'kg'),
('Chicken Breast', '/placeholder.svg?height=100&width=100', 30, 'kg'),
('Cheese', '/placeholder.svg?height=100&width=100', 20, 'kg'),
('Lettuce', '/placeholder.svg?height=100&width=100', 40, 'kg'),
('Bread', '/placeholder.svg?height=100&width=100', 100, 'loaf'),
('Rice', '/placeholder.svg?height=100&width=100', 80, 'kg'),
('Salmon', '/placeholder.svg?height=100&width=100', 15, 'kg'),
('Flour', '/placeholder.svg?height=100&width=100', 60, 'kg'),
('Sugar', '/placeholder.svg?height=100&width=100', 45, 'kg'),
('Chocolate', '/placeholder.svg?height=100&width=100', 25, 'kg');
