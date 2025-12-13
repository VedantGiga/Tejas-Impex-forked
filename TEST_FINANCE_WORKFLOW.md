# Test Finance Workflow - Step by Step

## Prerequisites

1. Run `FIX_FINANCE_WORKFLOW.sql` in Supabase SQL Editor
2. Have these accounts ready:
   - Admin account
   - Finance account (created by admin)
   - Supplier account

## Step-by-Step Testing

### Step 1: Verify Database Setup

Run in Supabase SQL Editor:
```sql
-- Check if finance_pending is allowed
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'products'::regclass 
AND conname LIKE '%approval%';

-- Should show: ('pending', 'approved', 'rejected', 'finance_pending')
```

### Step 2: Create Test Product (Supplier)

1. Login as **Supplier** at `/login`
2. Go to Supplier Dashboard
3. Add a new product:
   - Name: "Test Product for Finance"
   - Price: ₹1000
   - Stock: 100
   - Add image and description
4. Submit product
5. **Expected:** Product status = 'pending'

### Step 3: Admin Approval

1. Login as **Admin** at `/login`
2. Go to `/admin/product-approvals`
3. **Expected:** See "Test Product for Finance"
4. Click "Send to Finance" button
5. **Expected:** 
   - Success message: "Product sent to Finance for pricing"
   - Product disappears from admin list
   - In database: `approval_status = 'finance_pending'`

**Verify in Database:**
```sql
SELECT id, name, approval_status, supplier_price, finance_status
FROM products 
WHERE name = 'Test Product for Finance';

-- Should show:
-- approval_status: finance_pending
-- supplier_price: 1000
-- finance_status: pending
```

### Step 4: Finance Dashboard

1. Login as **Finance** at `/login`
2. Should auto-redirect to `/finance`
3. **Expected:** See "Test Product for Finance" in pending list
4. See:
   - Supplier Price: ₹1000
   - Input field to set new price
   - Margin calculation

**If product NOT showing:**

Check in SQL:
```sql
-- As finance user, can you see it?
SELECT id, name, approval_status 
FROM products 
WHERE approval_status = 'finance_pending';
```

If empty, check RLS policy:
```sql
-- Check if finance role exists
SELECT * FROM user_roles WHERE role = 'finance';

-- Check if has_role function works
SELECT public.has_role('YOUR_FINANCE_USER_ID', 'finance');
```

### Step 5: Finance Sets Price

1. In Finance Dashboard
2. Enter new price: ₹1200
3. See margin: +20%
4. Click "Approve & Set Price"
5. **Expected:**
   - Success message: "Price updated! Product is now live for customers."
   - Product disappears from finance list
   - In database: `approval_status = 'approved'`, `finance_status = 'approved'`

**Verify in Database:**
```sql
SELECT id, name, approval_status, finance_status, price, finance_price
FROM products 
WHERE name = 'Test Product for Finance';

-- Should show:
-- approval_status: approved
-- finance_status: approved
-- price: 1200
-- finance_price: 1200
```

### Step 6: Customer View

1. Logout or open incognito window
2. Go to `/products`
3. **Expected:** See "Test Product for Finance"
4. Price shown: ₹1200 (finance price)
5. Can add to cart and purchase

**If product NOT showing to customers:**

Check in SQL:
```sql
SELECT id, name, approval_status, finance_status, is_active, currency
FROM products 
WHERE name = 'Test Product for Finance';

-- All must be:
-- approval_status: approved
-- finance_status: approved
-- is_active: true
-- currency: INR
```

## Common Issues & Solutions

### Issue 1: Finance dashboard is empty

**Solution A: Check if product is in finance_pending**
```sql
SELECT COUNT(*) FROM products WHERE approval_status = 'finance_pending';
```

**Solution B: Manually set a product to finance_pending**
```sql
UPDATE products 
SET approval_status = 'finance_pending',
    supplier_price = price,
    finance_status = 'pending'
WHERE id = 'PRODUCT_ID_HERE';
```

**Solution C: Check finance user role**
```sql
SELECT ur.role, p.email 
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.id
WHERE ur.role = 'finance';
```

### Issue 2: Admin approval not working

**Check admin approval code:**
```sql
-- After admin clicks "Send to Finance", check:
SELECT approval_status, supplier_price 
FROM products 
WHERE id = 'PRODUCT_ID';

-- Should be:
-- approval_status: finance_pending
-- supplier_price: [original price]
```

### Issue 3: Product not visible to customers

**Check all conditions:**
```sql
SELECT 
  id,
  name,
  approval_status,
  finance_status,
  is_active,
  currency,
  CASE 
    WHEN approval_status = 'approved' AND finance_status = 'approved' AND is_active = true AND currency = 'INR'
    THEN '✅ Visible to customers'
    ELSE '❌ Not visible - check conditions'
  END as visibility_status
FROM products
WHERE name = 'Test Product for Finance';
```

### Issue 4: Finance can't update price

**Check RLS policy:**
```sql
-- Check if policy exists
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'products' 
AND policyname LIKE '%finance%';

-- Should have:
-- Finance can view pending products (SELECT)
-- Finance can update product prices (UPDATE)
```

## Quick Debug Queries

### See all products by status:
```sql
SELECT 
  approval_status,
  finance_status,
  COUNT(*) as count
FROM products
GROUP BY approval_status, finance_status;
```

### See finance pending products:
```sql
SELECT id, name, supplier_price, approval_status, finance_status
FROM products 
WHERE approval_status = 'finance_pending';
```

### See live products (customer view):
```sql
SELECT id, name, price, approval_status, finance_status
FROM products 
WHERE approval_status = 'approved' 
  AND finance_status = 'approved'
  AND is_active = true;
```

### Check user roles:
```sql
SELECT 
  p.email,
  ur.role
FROM user_roles ur
JOIN profiles p ON ur.user_id = p.id
ORDER BY ur.role;
```

## Success Checklist

- [ ] Supplier can add product
- [ ] Admin sees product in approvals
- [ ] Admin can send to finance
- [ ] Product disappears from admin after approval
- [ ] Finance sees product in dashboard
- [ ] Finance can set price
- [ ] Product disappears from finance after approval
- [ ] Customer can see product on product page
- [ ] Price shown is finance price
- [ ] Customer can add to cart

## If Everything Fails

Run this to reset a product for testing:
```sql
-- Reset product to pending state
UPDATE products 
SET approval_status = 'pending',
    finance_status = 'pending',
    supplier_price = NULL,
    finance_price = NULL
WHERE id = 'PRODUCT_ID_HERE';

-- Then test workflow again from Step 3
```

## Contact Points

1. **Admin Dashboard:** `/admin/product-approvals`
2. **Finance Dashboard:** `/finance`
3. **Product Page:** `/products`
4. **Supplier Dashboard:** `/supplier`

Done! Follow these steps and the workflow should work perfectly! 🎉
