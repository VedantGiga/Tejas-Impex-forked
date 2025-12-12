-- Add approval_status to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Update existing products to approved
UPDATE public.products SET approval_status = 'approved' WHERE approval_status IS NULL;

-- Update RLS policy to only show approved products to public
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
DROP POLICY IF EXISTS "Suppliers can view products" ON public.products;
DROP POLICY IF EXISTS "Anyone can view approved active products" ON public.products;
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Suppliers can view own products" ON public.products;

-- Admins can view all products (highest priority)
CREATE POLICY "Admins can view all products" ON public.products
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Suppliers can view their own products regardless of approval status
CREATE POLICY "Suppliers can view own products" ON public.products
  FOR SELECT USING (
    public.has_role(auth.uid(), 'supplier') AND 
    auth.uid() = supplier_id
  );

-- Public users can only view approved active INR products
CREATE POLICY "Public can view approved INR products" ON public.products
  FOR SELECT USING (
    is_active = true AND 
    approval_status = 'approved' AND 
    currency = 'INR'
  );
