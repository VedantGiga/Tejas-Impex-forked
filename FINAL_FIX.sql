-- ============================================
-- FINAL FIX - Run this completely
-- ============================================

-- Step 1: Add columns if missing
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS supplier_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS finance_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS finance_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS finance_approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS finance_approved_by UUID;

-- Step 2: Fix approval_status constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_approval_status_check;
ALTER TABLE products ADD CONSTRAINT products_approval_status_check 
CHECK (approval_status IN ('pending', 'approved', 'rejected', 'finance_pending'));

-- Step 3: Update existing approved products
UPDATE products 
SET finance_status = 'approved' 
WHERE approval_status = 'approved' 
AND (finance_status IS NULL OR finance_status = 'pending');

-- Step 4: Admin can see pending products
DROP POLICY IF EXISTS "Admins can view all products" ON products;
CREATE POLICY "Admins can view all products" ON products
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Step 5: Finance can see finance_pending products  
DROP POLICY IF EXISTS "Finance can view pending products" ON products;
CREATE POLICY "Finance can view pending products" ON products
  FOR SELECT USING (
    public.has_role(auth.uid(), 'finance') OR
    public.has_role(auth.uid(), 'admin')
  );

-- Step 6: Finance can update finance_pending products
DROP POLICY IF EXISTS "Finance can update product prices" ON products;
CREATE POLICY "Finance can update product prices" ON products
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'finance') OR
    public.has_role(auth.uid(), 'admin')
  );

-- Step 7: Public can only see fully approved products
DROP POLICY IF EXISTS "Public can view approved INR products" ON products;
CREATE POLICY "Public can view approved INR products" ON products
  FOR SELECT USING (
    is_active = true AND 
    approval_status = 'approved' AND 
    finance_status = 'approved' AND
    currency = 'INR'
  );

-- ============================================
-- TEST: Move one product to finance manually
-- ============================================

-- Find a pending product
SELECT id, name, approval_status, price 
FROM products 
WHERE approval_status = 'pending' 
LIMIT 1;

-- Copy the ID above and uncomment below (replace YOUR_ID):
-- UPDATE products 
-- SET approval_status = 'finance_pending',
--     supplier_price = price,
--     finance_status = 'pending'
-- WHERE id = 'YOUR_ID';

-- Verify it worked:
-- SELECT id, name, approval_status, supplier_price, finance_status
-- FROM products 
-- WHERE approval_status = 'finance_pending';

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 
  'Products by status:' as info,
  approval_status,
  COUNT(*) as count
FROM products
GROUP BY approval_status;

SELECT '✅ Setup complete! Now test in UI.' as status;
