Project Assignment: Restaurant Ordering Web
App (Next.js + Supabase)
Build a small full-stack web application using Next.js, Supabase (auth + database), and Tailwind/shadcn for
UI. The app should have a public client side and a protected admin side.

Core Requirements
Tech Stack
● Next.js (App Router)
● Supabase (Auth + DB)
● TailwindCSS and/or shadcn/ui components
● TypeScript

Client Side (No Login Required)
1. Menu Page
○ Display a list of menu items (name, picture, price).
○ User can add items to an order (Uber Eats style cart).
2. Submit Order
○ User submits order with basic info:
■ Phone number (no payment)
○ After submitting, user sees:
■ “Waiting for Approval” state.
3. Order Status Page
○ After approval, admin will set an estimated time.
○ Client sees a countdown timer (minutes) until order is ready.
○ If declined, show a declined message.

Admin Side (Login Required via Supabase)
Authentication
● Simple email/password signup/login via Supabase.
● Only admin users can access admin pages.

Admin Pages
1. Inventory Management
● CRUD inventory items.
● Each item must include:
○ Name
○ Image
○ Quantity available
● Show list of all inventory with edit/delete options.
2. Menu Management
● CRUD menu items.
● Each menu item must include:
○ Name, price, picture
○ A mapping of required inventory items + quantities.
● When an order is completed, inventory should auto-deduct based on this mapping.
3. Orders Page
● Show all active incoming orders.
● For each order:
○ Approve or Decline.
○ If approved:
■ Set preparation time in minutes.
○ Mark as Completed once done.
● Completed orders for today should move into a collapsed accordion at the bottom.
4. Order History
● Table of all past orders (date, items, status, total).

Data Flow Requirements
● Submitting an order → creates order record with selected items.
● Approving an order → writes estimated prep time.
● Completing an order → deducts inventory quantities automatically.
● Orders move between states:
○ Pending → Approved → Completed (or Declined).
● Client order status page must update in real time (Supabase realtime or simple polling).