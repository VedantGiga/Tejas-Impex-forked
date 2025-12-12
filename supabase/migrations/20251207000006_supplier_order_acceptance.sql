-- Add supplier_status to order_items for per-item acceptance
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS supplier_status TEXT DEFAULT 'pending' CHECK (supplier_status IN ('pending', 'accepted', 'rejected'));

-- Allow suppliers to update their order items status
CREATE POLICY "Suppliers can update their order items status" ON public.order_items
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'supplier') AND
    EXISTS (
      SELECT 1 FROM public.products
      WHERE id = order_items.product_id AND supplier_id = auth.uid()
    )
  );
