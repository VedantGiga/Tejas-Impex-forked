# Check Admin → Finance Connection

## Step 1: Run Database Setup

Open Supabase SQL Editor and run:

```sql
-- File: SIMPLE_FIX.sql
-- Run all steps in order
```

## Step 2: Check Current Products

```sql
-- See all products and their status
SELECT 
  id,
  name,
  approval_status,
  supplier_price,
  finance_status,
  price
FROM products
ORDER BY created_at DESC
LIMIT 10;
```

## Step 3: Manual Test (Quick)

```sql
-- Pick any pending product ID from above
-- Replace 'PRODUCT_ID_HERE' with actual ID

UPDATE products 
SET approval_status = 'finance_pending',
    supplier_price = price,
    finance_status = 'pending'
WHERE id = 'PRODUCT_ID_HERE';

-- Check if it worked
SELECT id, name, approval_status, supplier_price 
FROM products 
WHERE approval_status = 'finance_pending';
```

## Step 4: Test Admin Button

1. Open browser console (F12)
2. Login as Admin
3. Go to `/admin/product-approvals`
4. Click "Send to Finance" button
5. **Watch console for:**
   ```
   Sending to finance: {approval_status: "finance_pending", supplier_price: 1000, ...}
   Update success: [...]
   ```

## Step 5: Check Finance Dashboard

1. Login as Finance user
2. Go to `/finance`
3. **Should see:** Product that admin just approved
4. **Watch console for any errors**

## Quick Debug Commands

### In Browser Console (Admin page):

```javascript
// Check if product exists
const products = await supabase
  .from('products')
  .select('*')
  .eq('approval_status', 'pending');
console.log('Pending products:', products.data);

// Try manual update
const result = await supabase
  .from('products')
  .update({ 
    approval_status: 'finance_pending',
    supplier_price: 1000,
    finance_status: 'pending'
  })
  .eq('id', 'YOUR_PRODUCT_ID')
  .select();
console.log('Update result:', result);
```

### In Browser Console (Finance page):

```javascript
// Check if finance can see products
const financeProducts = await supabase
  .from('products')
  .select('*')
  .eq('approval_status', 'finance_pending');
console.log('Finance pending:', financeProducts.data);

// Check user role
const { data: { user } } = await supabase.auth.getUser();
const role = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id)
  .single();
console.log('My role:', role.data);
```

## Expected Flow:

```
1. Admin clicks "Send to Finance"
   ↓
2. Console shows: "Sending to finance: {...}"
   ↓
3. Console shows: "Update success: [...]"
   ↓
4. Product disappears from admin list
   ↓
5. Finance dashboard shows product
   ↓
6. Finance sets price and approves
   ↓
7. Product appears on product page
```

## If Still Not Working:

### Check 1: Columns exist?
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('supplier_price', 'finance_price', 'finance_status');
-- Should return 3 rows
```

### Check 2: Constraint allows finance_pending?
```sql
SELECT pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'products'::regclass 
AND conname LIKE '%approval%';
-- Should include 'finance_pending'
```

### Check 3: RLS policies?
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'products';
-- Should have finance policies
```

## Emergency Fix:

If nothing works, run this:

```sql
-- 1. Add columns
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS supplier_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS finance_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS finance_status TEXT DEFAULT 'pending';

-- 2. Fix constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_approval_status_check;
ALTER TABLE products ADD CONSTRAINT products_approval_status_check 
CHECK (approval_status IN ('pending', 'approved', 'rejected', 'finance_pending'));

-- 3. Test manually
UPDATE products 
SET approval_status = 'finance_pending',
    supplier_price = price,
    finance_status = 'pending'
WHERE approval_status = 'pending'
LIMIT 1;

-- 4. Verify
SELECT * FROM products WHERE approval_status = 'finance_pending';
```

Done! Follow these steps and check console for errors! 🔍
