-- Fix all RLS policies to prevent 500 errors and infinite recursion

-- 1. PROFILES TABLE - Fix to prevent recursion
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Suppliers can view customer details for their orders" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Suppliers can view customer profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'supplier'
    ) AND
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.order_items oi ON o.id = oi.order_id
      JOIN public.products p ON oi.product_id = p.id
      WHERE o.user_id = profiles.id AND p.supplier_id = auth.uid()
    )
  );

-- 2. ORDERS TABLE - Simplify policies
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Suppliers can view orders with their products" ON public.orders;

CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all orders" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Suppliers can view their orders" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'supplier'
    ) AND
    EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.products p ON oi.product_id = p.id
      WHERE oi.order_id = orders.id AND p.supplier_id = auth.uid()
    )
  );

-- 3. ORDER_ITEMS TABLE - Simplify policies
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
DROP POLICY IF EXISTS "Suppliers can view their product order items" ON public.order_items;
DROP POLICY IF EXISTS "Suppliers can update their order items status" ON public.order_items;

CREATE POLICY "Users can view own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = order_items.order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = order_items.order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Suppliers can view their order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'supplier'
    ) AND
    EXISTS (
      SELECT 1 FROM public.products
      WHERE id = order_items.product_id AND supplier_id = auth.uid()
    )
  );

CREATE POLICY "Suppliers can update order items status" ON public.order_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'supplier'
    ) AND
    EXISTS (
      SELECT 1 FROM public.products
      WHERE id = order_items.product_id AND supplier_id = auth.uid()
    )
  );

-- 4. PRODUCTS TABLE - Ensure proper access
DROP POLICY IF EXISTS "Public can view approved products" ON public.products;
DROP POLICY IF EXISTS "Suppliers can view their products" ON public.products;
DROP POLICY IF EXISTS "Suppliers can view own products" ON public.products;
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;

CREATE POLICY "Public can view approved products" ON public.products
  FOR SELECT USING (
    approval_status = 'approved' AND is_active = true AND currency = 'INR'
  );

CREATE POLICY "Suppliers can view own products" ON public.products
  FOR SELECT USING (supplier_id = auth.uid());

CREATE POLICY "Admins can view all products" ON public.products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Ensure supplier_status column exists with default
ALTER TABLE public.order_items 
ALTER COLUMN supplier_status SET DEFAULT 'pending';

-- Update any NULL values to pending
UPDATE public.order_items 
SET supplier_status = 'pending' 
WHERE supplier_status IS NULL;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
