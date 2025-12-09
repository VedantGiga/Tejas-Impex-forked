-- Add supplier to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'supplier';

-- Add supplier-specific fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS business_address TEXT,
ADD COLUMN IF NOT EXISTS gst_number TEXT,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;

-- Create supplier_products table (products added by suppliers)
CREATE TABLE IF NOT EXISTS public.supplier_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  commission_percent DECIMAL(5,2) DEFAULT 10.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (supplier_id, product_id)
);

-- Enable RLS on supplier_products
ALTER TABLE public.supplier_products ENABLE ROW LEVEL SECURITY;

-- Supplier can view their own products
CREATE POLICY "Suppliers can view own products" ON public.supplier_products
  FOR SELECT USING (auth.uid() = supplier_id);

-- Supplier can add products
CREATE POLICY "Suppliers can add products" ON public.supplier_products
  FOR INSERT WITH CHECK (auth.uid() = supplier_id);

-- Supplier can update their own products
CREATE POLICY "Suppliers can update own products" ON public.supplier_products
  FOR UPDATE USING (auth.uid() = supplier_id);

-- Supplier can delete their own products
CREATE POLICY "Suppliers can delete own products" ON public.supplier_products
  FOR DELETE USING (auth.uid() = supplier_id);

-- Admin can manage all supplier products
CREATE POLICY "Admins can manage supplier products" ON public.supplier_products
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Update products table - suppliers can add products
CREATE POLICY "Suppliers can add products" ON public.products
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'supplier'));

CREATE POLICY "Suppliers can view all products" ON public.products
  FOR SELECT USING (public.has_role(auth.uid(), 'supplier'));

CREATE POLICY "Suppliers can update own products" ON public.products
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'supplier') AND 
    EXISTS (SELECT 1 FROM public.supplier_products WHERE product_id = products.id AND supplier_id = auth.uid())
  );
