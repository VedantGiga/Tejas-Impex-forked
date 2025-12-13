-- EMERGENCY FIX - Run this to stop all 500 errors
-- This removes ALL policies causing recursion and creates simple ones

-- Step 1: Drop ALL existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname 
              FROM pg_policies 
              WHERE schemaname = 'public' 
              AND tablename IN ('profiles', 'orders', 'order_items', 'products'))
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Step 2: PROFILES - Simple policies without recursion
CREATE POLICY "profiles_own" ON public.profiles
  FOR ALL USING (id = auth.uid());

CREATE POLICY "profiles_admin" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "profiles_supplier" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'supplier')
  );

-- Step 3: ORDERS - Simple policies
CREATE POLICY "orders_own" ON public.orders
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "orders_admin" ON public.orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "orders_supplier" ON public.orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'supplier')
  );

-- Step 4: ORDER_ITEMS - Simple policies
CREATE POLICY "order_items_own" ON public.order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_items.order_id AND user_id = auth.uid())
  );

CREATE POLICY "order_items_admin" ON public.order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "order_items_supplier" ON public.order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'supplier')
  );

-- Step 5: PRODUCTS - Simple policies
CREATE POLICY "products_public" ON public.products
  FOR SELECT USING (approval_status = 'approved' AND is_active = true AND currency = 'INR');

CREATE POLICY "products_own" ON public.products
  FOR ALL USING (supplier_id = auth.uid());

CREATE POLICY "products_admin" ON public.products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Step 6: Fix supplier_status
UPDATE order_items SET supplier_status = 'pending' WHERE supplier_status IS NULL;

-- Step 7: Grant permissions
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.order_items TO authenticated;
GRANT ALL ON public.products TO authenticated;

-- Done! Now:
-- 1. Clear browser local storage (F12 > Application > Local Storage > Clear)
-- 2. Refresh page
-- 3. Login again
-- 4. Test ordering
