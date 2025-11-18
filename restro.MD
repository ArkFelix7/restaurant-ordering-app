# **Restaurant Ordering Web App – Project Assignment**

This project involves building a full-stack restaurant ordering system with a **public client side** and a **protected admin dashboard**.

---

## **Client Side (No Login Required)**

### **1. Menu Page**

* Display a list of menu items:

  * Name
  * Picture
  * Price
* User can add items to an order (Uber Eats–style cart).

### **2. Submit Order**

* User submits an order with:

  * Phone number (no payment required)
* After submitting, the user sees:

  * **“Waiting for Approval”** state

### **3. Order Status Page**

* After approval, admin sets an estimated preparation time.
* Client sees a **countdown timer** (in minutes) until the order is ready.
* If order is declined → show a **declined message**

---

## **Admin Side (Login Required via Supabase)**

### **Authentication**

* Email/password signup & login through Supabase.
* Only admin users can access admin pages.

---

## **Admin Pages**

### **1. Inventory Management**

* CRUD operations on inventory items.
* Each inventory item must include:

  * Name
  * Image
  * Quantity available
* Display a list of all inventory with **edit/delete** options.

### **2. Menu Management**

* CRUD menu items.
* Each menu item must include:

  * Name
  * Price
  * Picture
  * Mapping of required inventory items + quantities
* When an order is marked **Completed**, inventory should auto-deduct based on the mapping.

### **3. Orders Page**

* Show all active incoming orders.
* For each order:

  * Approve or Decline
  * If approved:

    * Set preparation time (in minutes)
  * Mark as **Completed** when finished
* Completed orders for the day should move into a **collapsed accordion** at the bottom.

### **4. Order History**

* Table of all past orders:

  * Date
  * Items
  * Status
  * Total

---

## **Data Flow Requirements**

* **Submitting an order**
  → Creates an order record with selected items.

* **Approving an order**
  → Writes/updates estimated preparation time.

* **Completing an order**
  → Automatically deducts inventory quantities.

* **Order lifecycle:**
  `Pending → Approved → Completed (or Declined)`

* **Client order status** must update in real time:

  * Supabase Realtime **or**
  * Simple polling