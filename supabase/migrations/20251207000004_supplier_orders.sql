-- Allow suppliers to view orders containing their products
CREATE POLICY "Suppliers can view orders with their products" ON public.orders
  FOR SELECT USING (
    public.has_role(auth.uid(), 'supplier') AND
    EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.products p ON oi.product_id = p.id
      WHERE oi.order_id = orders.id AND p.supplier_id = auth.uid()
    )
  );

-- Allow suppliers to view order items for their products
CREATE POLICY "Suppliers can view their product order items" ON public.order_items
  FOR SELECT USING (
    public.has_role(auth.uid(), 'supplier') AND
    EXISTS (
      SELECT 1 FROM public.products
      WHERE id = order_items.product_id AND supplier_id = auth.uid()
    )
  );
