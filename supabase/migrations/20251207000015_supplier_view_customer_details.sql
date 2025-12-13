-- Allow suppliers to view customer details for orders containing their products
CREATE POLICY "Suppliers can view customer details for their orders" ON public.profiles
  FOR SELECT USING (
    public.has_role(auth.uid(), 'supplier') AND
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.order_items oi ON o.id = oi.order_id
      JOIN public.products p ON oi.product_id = p.id
      WHERE o.user_id = profiles.id AND p.supplier_id = auth.uid()
    )
  );
