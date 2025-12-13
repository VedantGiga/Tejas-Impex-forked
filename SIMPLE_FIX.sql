-- ============================================
-- STEP 1: Check if columns exist
-- ============================================
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('supplier_price', 'finance_price', 'finance_status');

-- If above returns 0 rows, run STEP 2
-- If it returns 3 rows, skip to STEP 3

-- ============================================
-- STEP 2: Add missing columns (if needed)
-- ============================================
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS supplier_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS finance_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS finance_status TEXT DEFAULT 'pending';

-- ============================================
-- STEP 3: Fix approval_status constraint
-- ============================================
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_approval_status_check;
ALTER TABLE products ADD CONSTRAINT products_approval_status_check 
CHECK (approval_status IN ('pending', 'approved', 'rejected', 'finance_pending'));

-- ============================================
-- STEP 4: Test - Manually move one product to finance
-- ============================================
-- Find a pending product
SELECT id, name, approval_status FROM products WHERE approval_status = 'pending' LIMIT 1;

-- Copy the ID and run this (replace YOUR_PRODUCT_ID):
-- UPDATE products 
-- SET approval_status = 'finance_pending', 
--     supplier_price = price 
-- WHERE id = 'YOUR_PRODUCT_ID';

-- ============================================
-- STEP 5: Verify it worked
-- ============================================
SELECT id, name, approval_status, supplier_price 
FROM products 
WHERE approval_status = 'finance_pending';

-- If you see the product, it's working! ✅
