-- APPLY THIS IMMEDIATELY TO FIX 500 ERRORS
-- Run this in Supabase SQL Editor

-- Step 1: Drop all problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Suppliers can view customer details for their orders" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Suppliers can view customer profiles" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Suppliers can view orders with their products" ON public.orders;
DROP POLICY IF EXISTS "Suppliers can view their orders" ON public.orders;

DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
DROP POLICY IF EXISTS "Suppliers can view their product order items" ON public.order_items;
DROP POLICY IF EXISTS "Suppliers can update their order items status" ON public.order_items;
DROP POLICY IF EXISTS "Suppliers can view their order items" ON public.order_items;
DROP POLICY IF EXISTS "Suppliers can update order items status" ON public.order_items;

DROP POLICY IF EXISTS "Public can view approved products" ON public.products;
DROP POLICY IF EXISTS "Suppliers can view their products" ON public.products;
DROP POLICY IF EXISTS "Suppliers can view own products" ON public.products;
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;
DROP POLICY IF EXISTS "Suppliers can insert products" ON public.products;
DROP POLICY IF EXISTS "Suppliers can update products" ON public.products;
DROP POLICY IF EXISTS "Suppliers can delete products" ON public.products;

-- Step 2: Create simple, non-recursive policies

-- PROFILES
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "profiles_select_supplier" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'supplier')
  );

-- ORDERS
CREATE POLICY "orders_select_own" ON public.orders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "orders_insert_own" ON public.orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "orders_select_admin" ON public.orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "orders_select_supplier" ON public.orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'supplier')
  );

-- ORDER_ITEMS
CREATE POLICY "order_items_select_own" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid())
  );

CREATE POLICY "order_items_insert_own" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid())
  );

CREATE POLICY "order_items_select_admin" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "order_items_select_supplier" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'supplier')
  );

CREATE POLICY "order_items_update_supplier" ON public.order_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'supplier')
  );

-- Step 3: Ensure supplier_status column
UPDATE order_items SET supplier_status = 'pending' WHERE supplier_status IS NULL;

-- Step 4: Grant permissions
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;

-- Done! Test by:
-- 1. Clear browser local storage
-- 2. Login again
-- 3. Try placing an order
