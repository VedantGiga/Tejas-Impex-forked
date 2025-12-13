-- Ensure all necessary policies are in place for supplier new orders

-- 1. Allow suppliers to view their products
DROP POLICY IF EXISTS "Suppliers can view their products" ON public.products;
CREATE POLICY "Suppliers can view their products" ON public.products
  FOR SELECT USING (
    supplier_id = auth.uid() OR
    (approval_status = 'approved' AND is_active = true)
  );

-- 2. Allow suppliers to view orders containing their products
DROP POLICY IF EXISTS "Suppliers can view orders with their products" ON public.orders;
CREATE POLICY "Suppliers can view orders with their products" ON public.orders
  FOR SELECT USING (
    public.has_role(auth.uid(), 'supplier') AND
    EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.products p ON oi.product_id = p.id
      WHERE oi.order_id = orders.id AND p.supplier_id = auth.uid()
    )
  );

-- 3. Allow suppliers to view order items for their products
DROP POLICY IF EXISTS "Suppliers can view their product order items" ON public.order_items;
CREATE POLICY "Suppliers can view their product order items" ON public.order_items
  FOR SELECT USING (
    public.has_role(auth.uid(), 'supplier') AND
    EXISTS (
      SELECT 1 FROM public.products
      WHERE id = order_items.product_id AND supplier_id = auth.uid()
    )
  );

-- 4. Allow suppliers to update order items status
DROP POLICY IF EXISTS "Suppliers can update their order items status" ON public.order_items;
CREATE POLICY "Suppliers can update their order items status" ON public.order_items
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'supplier') AND
    EXISTS (
      SELECT 1 FROM public.products
      WHERE id = order_items.product_id AND supplier_id = auth.uid()
    )
  );

-- 5. Allow suppliers to view customer details for their orders
DROP POLICY IF EXISTS "Suppliers can view customer details for their orders" ON public.profiles;
CREATE POLICY "Suppliers can view customer details for their orders" ON public.profiles
  FOR SELECT USING (
    id = auth.uid() OR
    (public.has_role(auth.uid(), 'supplier') AND
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.order_items oi ON o.id = oi.order_id
      JOIN public.products p ON oi.product_id = p.id
      WHERE o.user_id = profiles.id AND p.supplier_id = auth.uid()
    ))
  );

-- 6. Ensure supplier_status column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_items' AND column_name = 'supplier_status'
  ) THEN
    ALTER TABLE public.order_items 
    ADD COLUMN supplier_status TEXT DEFAULT 'pending' 
    CHECK (supplier_status IN ('pending', 'accepted', 'rejected'));
  END IF;
END $$;

-- 7. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;

-- Test query to verify supplier can see their pending orders
-- Replace 'YOUR_SUPPLIER_ID' with actual supplier user ID
-- SELECT oi.*, o.*, p.name as product_name
-- FROM order_items oi
-- JOIN orders o ON oi.order_id = o.id
-- JOIN products p ON oi.product_id = p.id
-- WHERE p.supplier_id = 'YOUR_SUPPLIER_ID' AND oi.supplier_status = 'pending';
