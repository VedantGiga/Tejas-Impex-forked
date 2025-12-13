-- ============================================
-- FIX FINANCE WORKFLOW
-- Run this to ensure everything is connected
-- ============================================

-- Step 1: Verify columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('approval_status', 'finance_status', 'supplier_price', 'finance_price');

-- Step 2: Check if finance_pending is in constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'products'::regclass 
AND conname LIKE '%approval%';

-- Step 3: Update any existing approved products to have finance_status
UPDATE products 
SET finance_status = 'approved' 
WHERE approval_status = 'approved' 
AND finance_status IS NULL;

-- Step 4: Ensure RLS policies are correct
DROP POLICY IF EXISTS "Finance can view pending products" ON products;
CREATE POLICY "Finance can view pending products" ON products
  FOR SELECT USING (
    public.has_role(auth.uid(), 'finance') AND 
    approval_status = 'finance_pending'
  );

DROP POLICY IF EXISTS "Finance can update product prices" ON products;
CREATE POLICY "Finance can update product prices" ON products
  FOR UPDATE USING (
    public.has_role(auth.uid(), 'finance') AND 
    approval_status = 'finance_pending'
  );

-- Step 5: Update public view policy
DROP POLICY IF EXISTS "Public can view approved INR products" ON products;
CREATE POLICY "Public can view approved INR products" ON products
  FOR SELECT USING (
    is_active = true AND 
    approval_status = 'approved' AND 
    finance_status = 'approved' AND
    currency = 'INR'
  );

-- Step 6: Test query - Check if finance can see finance_pending products
-- Run this as finance user to test
SELECT id, name, approval_status, supplier_price 
FROM products 
WHERE approval_status = 'finance_pending'
LIMIT 5;

-- Step 7: Verify workflow
-- Check products in each stage
SELECT 
  approval_status,
  finance_status,
  COUNT(*) as count
FROM products
GROUP BY approval_status, finance_status
ORDER BY approval_status, finance_status;

-- ============================================
-- MANUAL TEST WORKFLOW
-- ============================================

-- Test 1: Create a test product in finance_pending status
-- (Only if you want to test manually)
/*
UPDATE products 
SET approval_status = 'finance_pending',
    supplier_price = price,
    finance_status = 'pending'
WHERE id = 'YOUR_PRODUCT_ID_HERE';
*/

-- Test 2: Check if finance user can see it
-- Login as finance user and run:
/*
SELECT * FROM products WHERE approval_status = 'finance_pending';
*/

-- Test 3: Finance approves product
/*
UPDATE products 
SET approval_status = 'approved',
    finance_status = 'approved',
    finance_price = 1500,
    price = 1500
WHERE id = 'YOUR_PRODUCT_ID_HERE';
*/

-- ============================================
-- VERIFICATION COMPLETE
-- ============================================
SELECT '✅ Finance workflow setup verified!' as status;
