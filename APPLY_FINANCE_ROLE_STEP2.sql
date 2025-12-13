-- ============================================
-- FINANCE ROLE IMPLEMENTATION - STEP 2
-- Run this AFTER Step 1 is committed
-- ============================================

-- Add finance columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS finance_status TEXT DEFAULT 'pending' CHECK (finance_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS supplier_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS finance_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS finance_approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS finance_approved_by UUID REFERENCES auth.users(id);

-- Update approval_status constraint
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_approval_status_check;
ALTER TABLE public.products ADD CONSTRAINT products_approval_status_check 
  CHECK (approval_status IN ('pending', 'approved', 'rejected', 'finance_pending'));

-- Create finance policies
DROP POLICY IF EXISTS "Finance can view pending products" ON public.products;
CREATE POLICY "Finance can view pending products" ON public.products
  FOR SELECT USING (
    public.has_role(auth.uid(), 'finance') AND 
    approval_status = 'finance_pending'
  );

DROP POLICY IF EXISTS "Finance can update product prices" ON public.products;
CREATE POLICY "Finance can update product prices" ON public.products
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'finance') AND 
    approval_status = 'finance_pending'
  );

-- Update public view policy
DROP POLICY IF EXISTS "Public can view approved INR products" ON public.products;
CREATE POLICY "Public can view approved INR products" ON public.products
  FOR SELECT USING (
    is_active = true AND 
    approval_status = 'approved' AND 
    finance_status = 'approved' AND
    currency = 'INR'
  );

-- Create finance dashboard view
DROP VIEW IF EXISTS public.finance_pending_products;
CREATE VIEW public.finance_pending_products AS
SELECT 
  p.*,
  pr.full_name as supplier_name,
  pr.email as supplier_email
FROM public.products p
LEFT JOIN public.profiles pr ON p.supplier_id = pr.id
WHERE p.approval_status = 'finance_pending'
ORDER BY p.created_at DESC;

-- Grant access
GRANT SELECT ON public.finance_pending_products TO authenticated;

-- ============================================
-- VERIFICATION
-- ============================================

-- Check if everything is set up correctly
DO $$ 
BEGIN
    RAISE NOTICE '✅ Finance role setup completed!';
    RAISE NOTICE '📝 Verification:';
END $$;

-- Show finance role exists
SELECT 'Finance role exists: ' || EXISTS(
  SELECT 1 FROM pg_enum 
  WHERE enumlabel = 'finance' 
  AND enumtypid = 'public.app_role'::regtype
)::text;

-- Show new columns
SELECT 'New columns added: ' || COUNT(*)::text 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('finance_status', 'supplier_price', 'finance_price');

-- Show policies
SELECT 'Finance policies created: ' || COUNT(*)::text
FROM pg_policies 
WHERE tablename = 'products' 
AND policyname LIKE '%finance%';
