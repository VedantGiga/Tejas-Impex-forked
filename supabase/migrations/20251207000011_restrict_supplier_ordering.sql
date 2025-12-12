-- Restrict suppliers from creating orders, managing cart, and wishlist
-- Only admin and regular users can place orders

-- Drop existing order creation policies
DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;

-- Recreate order creation policy excluding suppliers
CREATE POLICY "Users and admins can create orders" ON public.orders
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    NOT public.has_role(auth.uid(), 'supplier')
  );

-- Drop existing order items creation policy
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;

-- Recreate order items creation policy excluding suppliers
CREATE POLICY "Users and admins can create order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    ) AND
    NOT public.has_role(auth.uid(), 'supplier')
  );

-- Drop existing cart policies
DROP POLICY IF EXISTS "Users can manage own cart" ON public.cart;

-- Recreate cart policies excluding suppliers
CREATE POLICY "Users can view own cart" ON public.cart
  FOR SELECT USING (
    auth.uid() = user_id AND
    NOT public.has_role(auth.uid(), 'supplier')
  );

CREATE POLICY "Users can insert to cart" ON public.cart
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    NOT public.has_role(auth.uid(), 'supplier')
  );

CREATE POLICY "Users can update own cart" ON public.cart
  FOR UPDATE USING (
    auth.uid() = user_id AND
    NOT public.has_role(auth.uid(), 'supplier')
  );

CREATE POLICY "Users can delete from cart" ON public.cart
  FOR DELETE USING (
    auth.uid() = user_id AND
    NOT public.has_role(auth.uid(), 'supplier')
  );

-- Drop existing wishlist policies
DROP POLICY IF EXISTS "Users can manage own wishlist" ON public.wishlist;

-- Recreate wishlist policies excluding suppliers
CREATE POLICY "Users can view own wishlist" ON public.wishlist
  FOR SELECT USING (
    auth.uid() = user_id AND
    NOT public.has_role(auth.uid(), 'supplier')
  );

CREATE POLICY "Users can insert to wishlist" ON public.wishlist
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    NOT public.has_role(auth.uid(), 'supplier')
  );

CREATE POLICY "Users can update own wishlist" ON public.wishlist
  FOR UPDATE USING (
    auth.uid() = user_id AND
    NOT public.has_role(auth.uid(), 'supplier')
  );

CREATE POLICY "Users can delete from wishlist" ON public.wishlist
  FOR DELETE USING (
    auth.uid() = user_id AND
    NOT public.has_role(auth.uid(), 'supplier')
  );
