-- ============================================
-- FINANCE ROLE IMPLEMENTATION - STEP 1
-- Run this FIRST in Supabase SQL Editor
-- ============================================

-- Add finance role to enum (MUST be separate transaction)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'finance';

-- ============================================
-- STOP HERE! Wait 2 seconds, then run STEP 2
-- ============================================
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS finance_status TEXT DEFAULT 'pending' CHECK (finance_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS supplier_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS finance_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS finance_approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS finance_approved_by UUID REFERENCES auth.users(id);

-- Step 3: Update approval_status constraint
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_approval_status_check;
ALTER TABLE public.products ADD CONSTRAINT products_approval_status_check 
  CHECK (approval_status IN ('pending', 'approved', 'rejected', 'finance_pending'));

-- Step 4: Create finance policies
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

-- Step 5: Update public view policy
DROP POLICY IF EXISTS "Public can view approved INR products" ON public.products;
CREATE POLICY "Public can view approved INR products" ON public.products
  FOR SELECT USING (
    is_active = true AND 
    approval_status = 'approved' AND 
    finance_status = 'approved' AND
    currency = 'INR'
  );

-- Step 6: Create finance dashboard view
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

-- Step 7: Grant access
GRANT SELECT ON public.finance_pending_products TO authenticated;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if finance role exists
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'public.app_role'::regtype;

-- Check new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('finance_status', 'supplier_price', 'finance_price', 'finance_approved_at', 'finance_approved_by');

-- Check policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'products' 
AND policyname LIKE '%finance%';

-- Check view
SELECT * FROM information_schema.views WHERE table_name = 'finance_pending_products';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$ 
BEGIN
    RAISE NOTICE '✅ Finance role implementation completed successfully!';
    RAISE NOTICE '📝 Next steps:';
    RAISE NOTICE '   1. Create finance user via /signup with Finance role';
    RAISE NOTICE '   2. Login at /finance-login';
    RAISE NOTICE '   3. Access dashboard at /finance';
END $$;
