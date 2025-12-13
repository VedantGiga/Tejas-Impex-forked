-- Step 2: Add finance workflow columns and policies
-- Run this AFTER step 1 is committed

-- Update products table to add finance approval workflow
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS finance_status TEXT DEFAULT 'pending' CHECK (finance_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS supplier_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS finance_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS finance_approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS finance_approved_by UUID REFERENCES auth.users(id);

-- Update approval_status to include finance_pending
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_approval_status_check;
ALTER TABLE public.products ADD CONSTRAINT products_approval_status_check 
  CHECK (approval_status IN ('pending', 'approved', 'rejected', 'finance_pending'));

-- Finance can view products in finance_pending status
CREATE POLICY "Finance can view pending products" ON public.products
  FOR SELECT USING (
    public.has_role(auth.uid(), 'finance') AND 
    approval_status = 'finance_pending'
  );

-- Finance can update price of finance_pending products
CREATE POLICY "Finance can update product prices" ON public.products
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'finance') AND 
    approval_status = 'finance_pending'
  );

-- Update public view policy - only show finance approved products
DROP POLICY IF EXISTS "Public can view approved INR products" ON public.products;
CREATE POLICY "Public can view approved INR products" ON public.products
  FOR SELECT USING (
    is_active = true AND 
    approval_status = 'approved' AND 
    finance_status = 'approved' AND
    currency = 'INR'
  );

-- Create finance_dashboard view for easy access
CREATE OR REPLACE VIEW public.finance_pending_products AS
SELECT 
  p.*,
  pr.full_name as supplier_name,
  pr.email as supplier_email
FROM public.products p
LEFT JOIN public.profiles pr ON p.supplier_id = pr.id
WHERE p.approval_status = 'finance_pending'
ORDER BY p.created_at DESC;

-- Grant access to finance role
GRANT SELECT ON public.finance_pending_products TO authenticated;
