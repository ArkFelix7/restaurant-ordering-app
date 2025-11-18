# Restaurant Ordering App - Setup Guide

## 🎯 Overview
A complete full-stack restaurant ordering system with public client interface and protected admin dashboard built with Next.js 16, Supabase, and TypeScript.

## ✨ Features Implemented

### Client Side (Public)
- ✅ Menu browsing with categories
- ✅ Add items to cart (Uber Eats-style)
- ✅ Submit orders with phone number
- ✅ Real-time order status tracking
- ✅ Countdown timer for approved orders
- ✅ Order status updates (Pending → Approved → Completed/Declined)

### Admin Side (Protected)
- ✅ Supabase authentication (email/password)
- ✅ **Orders Dashboard**
  - View all active and completed orders
  - Approve/Decline orders with preparation time
  - Mark orders as completed
  - Real-time order updates
  - Completed orders collapsed in accordion
- ✅ **Inventory Management**
  - CRUD operations for raw ingredients
  - Track quantity available and units
  - Low stock alerts
  - **Image uploads** with compression
- ✅ **Menu Management**
  - CRUD operations for menu items
  - Map inventory items to menu items
  - Set pricing, images, availability
  - Feature items on homepage
  - **Image uploads** with drag-drop UI
- ✅ **Order History**
  - View all past orders
  - Filter by date (Today, Week, Month, All Time)
  - Revenue statistics
  - Order details with items

### Advanced Features
- ✅ **Auto-deduct inventory** when orders are completed
- ✅ **Real-time updates** using Supabase Realtime
- ✅ **Inventory-Menu item mappings**
- ✅ **Protected routes** with middleware
- ✅ **Image uploads** with Supabase Storage (automatic compression, validation, progress tracking)

## 🚀 Setup Instructions

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings → API
3. Create a \`.env.local\` file:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
\`\`\`

### 3. Run Database Migrations

Execute the SQL scripts in order in your Supabase SQL Editor:

1. \`scripts/001_create_categories_table.sql\`
2. \`scripts/002_create_items_table.sql\`
3. \`scripts/003_create_orders_table.sql\`
4. \`scripts/004_create_order_items_table.sql\`
5. \`scripts/005_seed_sample_data.sql\`
6. \`scripts/006_update_schema_for_requirements.sql\`
7. \`scripts/007_setup_storage_buckets.sql\` ← **NEW: Image uploads**

### 4. Set Up Storage (Required for Image Uploads)

1. Go to Supabase Dashboard → Storage
2. Verify these buckets were created:
   - ✅ \`menu-images\` (for menu item photos)
   - ✅ \`inventory-images\` (for ingredient photos)
3. Check that both buckets have public read access

**Note**: Admin can now upload images directly when adding/editing menu items and inventory!

### 5. Enable Realtime in Supabase

1. Go to Database → Replication
2. Enable replication for the \`orders\` table

### 6. Create Admin User

1. Go to Authentication → Users in Supabase Dashboard
2. Click "Add User"
3. Create a user with email and password
4. This user can now login at \`/login\`

### 7. Run the Application

\`\`\`bash
npm run dev
\`\`\`

Visit:
- Public menu: http://localhost:3000
- Admin login: http://localhost:3000/login
- Admin dashboard: http://localhost:3000/admin (after login)

## 📁 Project Structure

\`\`\`
app/
├── page.tsx                    # Public menu page
├── cart/page.tsx              # Shopping cart
├── order-status/[id]/page.tsx # Order tracking (real-time)
├── login/page.tsx             # Admin authentication
├── admin/
│   ├── page.tsx               # Orders dashboard
│   ├── menu/page.tsx          # Menu management
│   ├── inventory/page.tsx     # Inventory management
│   └── history/page.tsx       # Order history
└── api/
    └── orders/
        ├── route.ts           # Create/list orders
        └── [id]/route.ts      # Update orders + inventory deduction

lib/
├── supabase/
│   ├── client.ts             # Browser Supabase client
│   ├── server.ts             # Server Supabase client
│   └── middleware.ts         # Auth middleware
├── types.ts                  # TypeScript interfaces
└── db.ts                     # Database helpers

middleware.ts                 # Route protection
\`\`\`

## 🔐 Authentication Flow

1. Admin navigates to \`/login\`
2. Signs in with Supabase email/password
3. Middleware protects all \`/admin/*\` routes
4. Unauthenticated users redirected to login
5. Session managed via cookies

## 📊 Data Flow

### Order Lifecycle

\`\`\`
Client submits order (pending)
         ↓
Admin sees in dashboard (real-time)
         ↓
Admin approves with prep time
         ↓
Client sees countdown timer (real-time)
         ↓
Admin marks complete
         ↓
Inventory auto-deducted
         ↓
Order moved to completed accordion
\`\`\`

### Inventory Deduction

When an order is marked as completed:
1. System fetches all order items
2. For each item, gets inventory mappings
3. Calculates total deduction (quantity_required × order_quantity)
4. Updates inventory quantities
5. Logs all deductions

Example:
- Order: 2x Beef Burger
- Mapping: 1 Burger needs 0.2kg beef + 1 bun + 0.1kg cheese
- Deduction: 0.4kg beef, 2 buns, 0.2kg cheese

## 🔄 Real-time Features

### Client Order Status
- Subscribes to changes on specific order
- Updates status automatically
- No polling required

### Admin Dashboard
- Subscribes to all order changes
- New orders appear instantly
- Status changes reflected immediately

## 📋 Database Schema

### Core Tables
- \`categories\` - Menu categories
- \`items\` - Menu items
- \`orders\` - Customer orders
- \`order_items\` - Items in each order
- \`inventory\` - Raw ingredients
- \`item_inventory_mapping\` - Links menu items to ingredients

### Key Relationships
- Items → Categories (many-to-one)
- Orders → Order Items (one-to-many)
- Items → Inventory Mappings (one-to-many)
- Inventory Mappings → Inventory (many-to-one)

## 🎨 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Real-time**: Supabase Realtime
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Type Safety**: TypeScript

## 🧪 Testing the System

### As a Customer:
1. Browse menu at \`/\`
2. Add items to cart
3. Click cart button → checkout
4. Enter phone number
5. Submit order
6. Note the order ID
7. Visit \`/order-status/[order-id]\`
8. Watch status update in real-time

### As an Admin:
1. Login at \`/login\`
2. See new order in dashboard
3. Click "Approve" and set prep time (e.g., 30 minutes)
4. Customer sees countdown timer immediately
5. Click "Mark as Completed"
6. Check \`Inventory Management\` - quantities decreased
7. Order moves to completed accordion
8. View in \`Order History\`

## 🚨 Important Notes

1. **Environment Variables**: Never commit \`.env.local\` to git
2. **Realtime**: Requires Supabase replication enabled
3. **Authentication**: First user must be created via Supabase Dashboard
4. **Inventory**: Mappings are optional but required for auto-deduction
5. **Images**: Currently uses placeholder URLs - integrate with storage service

## 🐛 Troubleshooting

### Orders not updating in real-time
- Check Supabase Replication is enabled
- Verify correct table names in subscriptions
- Check browser console for subscription errors

### Inventory not deducting
- Ensure inventory mappings exist for menu items
- Check console logs for deduction errors
- Verify inventory IDs match in mappings

### Cannot access admin pages
- Clear cookies and re-login
- Check middleware is running
- Verify \`.env.local\` variables are set

## 📈 Future Enhancements

- [ ] Image upload for menu items and inventory
- [ ] Push notifications for order status
- [ ] Analytics dashboard
- [ ] Customer accounts and order history
- [ ] Multiple restaurant support
- [ ] Payment integration
- [ ] Delivery tracking
- [ ] SMS notifications

## 📝 License

MIT

## 👥 Support

For issues or questions, please check the code comments or console logs for detailed debugging information.
