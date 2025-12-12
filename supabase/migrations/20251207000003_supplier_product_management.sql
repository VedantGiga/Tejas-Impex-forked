-- Drop conflicting policies
DROP POLICY IF EXISTS "Suppliers can add products" ON public.products;
DROP POLICY IF EXISTS "Suppliers can view all products" ON public.products;
DROP POLICY IF EXISTS "Suppliers can update own products" ON public.products;

-- Add supplier_id to products table to track ownership
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Suppliers can insert their own products
CREATE POLICY "Suppliers can insert products" ON public.products
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'supplier') AND 
    auth.uid() = supplier_id
  );

-- Suppliers can view all products (to see catalog)
CREATE POLICY "Suppliers can view products" ON public.products
  FOR SELECT USING (
    public.has_role(auth.uid(), 'supplier') OR 
    is_active = true
  );

-- Suppliers can update only their own products
CREATE POLICY "Suppliers can update own products" ON public.products
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'supplier') AND 
    auth.uid() = supplier_id
  );

-- Suppliers can delete only their own products
CREATE POLICY "Suppliers can delete own products" ON public.products
  FOR DELETE USING (
    public.has_role(auth.uid(), 'supplier') AND 
    auth.uid() = supplier_id
  );

-- Suppliers can manage product images for their products
CREATE POLICY "Suppliers can insert product images" ON public.product_images
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'supplier') AND
    EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND supplier_id = auth.uid())
  );

CREATE POLICY "Suppliers can update product images" ON public.product_images
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'supplier') AND
    EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND supplier_id = auth.uid())
  );

CREATE POLICY "Suppliers can delete product images" ON public.product_images
  FOR DELETE USING (
    public.has_role(auth.uid(), 'supplier') AND
    EXISTS (SELECT 1 FROM public.products WHERE id = product_id AND supplier_id = auth.uid())
  );

-- Suppliers can view all categories and brands
CREATE POLICY "Suppliers can view categories" ON public.categories
  FOR SELECT USING (public.has_role(auth.uid(), 'supplier'));

CREATE POLICY "Suppliers can view brands" ON public.brands
  FOR SELECT USING (public.has_role(auth.uid(), 'supplier'));
