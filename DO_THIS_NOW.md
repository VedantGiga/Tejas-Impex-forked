# Fix Admin → Finance Flow - DO THIS NOW

## Step 1: Run SQL (MUST DO FIRST)

Open Supabase SQL Editor and run **COMPLETE FILE**:
```
File: FINAL_FIX.sql
```

## Step 2: Test in Browser

### Open Admin Page:
1. Login as Admin
2. Go to `/admin/product-approvals`
3. **Press F12** (open console)
4. You should see pending products

### Click "Send to Finance":
1. Click the button
2. **Watch console** - you should see:
   ```
   🔄 Sending to finance: {approval_status: "finance_pending", ...}
   ✅ Update success: [...]
   📋 Products after removal: X
   ```
3. **Product should disappear from list**

### Open Finance Page:
1. Login as Finance (different browser/incognito)
2. Go to `/finance`
3. **Press F12** (open console)
4. You should see:
   ```
   🔄 Loading finance pending products...
   📊 Found products: 1
   ✅ Loaded products: 1
   ```
5. **Product should appear in list**

## Step 3: If Product NOT Showing in Finance

### Check in SQL:
```sql
-- See if product is in finance_pending
SELECT id, name, approval_status, supplier_price, finance_status
FROM products
WHERE approval_status = 'finance_pending';
```

If you see the product here, but NOT in finance dashboard:
```sql
-- Check RLS policies
SELECT policyname FROM pg_policies WHERE tablename = 'products';
```

### Manual Test:
```sql
-- Pick any pending product
SELECT id, name FROM products WHERE approval_status = 'pending' LIMIT 1;

-- Move it to finance manually (replace YOUR_ID)
UPDATE products 
SET approval_status = 'finance_pending',
    supplier_price = price,
    finance_status = 'pending'
WHERE id = 'YOUR_ID';

-- Check if finance can see it
SELECT * FROM products WHERE approval_status = 'finance_pending';
```

## Step 4: Finance Sets Price

### In Finance Dashboard:
1. Enter price (e.g., 1200)
2. Click "Approve & Set Price"
3. **Watch console**:
   ```
   Finance update success
   ```
4. **Product should disappear**

### Check Product Page:
1. Go to `/products`
2. **Product should be visible**
3. **Price should be finance price**

## Console Emojis to Watch:

### Admin:
- 🔄 = Sending to finance
- ✅ = Success
- 📋 = Products count
- ❌ = Error

### Finance:
- 🔄 = Loading
- 📊 = Found count
- ✅ = Loaded
- ❌ = Error

## If STILL Not Working:

### 1. Check columns exist:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('supplier_price', 'finance_price', 'finance_status');
-- Should return 3 rows
```

### 2. Check constraint:
```sql
SELECT pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'products'::regclass 
AND conname LIKE '%approval%';
-- Should include 'finance_pending'
```

### 3. Hard refresh browser:
- Ctrl + Shift + R (Windows)
- Cmd + Shift + R (Mac)

### 4. Clear cache and reload

## Expected Flow:

```
Admin Page (pending products)
    ↓ Click "Send to Finance"
    ↓ Console: 🔄 ✅ 📋
    ↓ Product disappears
    ↓
Finance Page (empty → shows product)
    ↓ Console: 🔄 📊 ✅
    ↓ Product appears
    ↓ Set price & approve
    ↓ Product disappears
    ↓
Product Page
    ↓ Product visible to customers
```

## Quick Debug:

### In Admin Console:
```javascript
// Check products state
console.log('Products:', products);

// After clicking button
console.log('Should be removed now');
```

### In Finance Console:
```javascript
// Manual check
const test = await supabase
  .from('products')
  .select('*')
  .eq('approval_status', 'finance_pending');
console.log('Finance products:', test);
```

## Success Checklist:

- [ ] SQL ran successfully
- [ ] Admin can see pending products
- [ ] Click "Send to Finance" works
- [ ] Product disappears from admin
- [ ] Console shows ✅ messages
- [ ] Finance dashboard shows product
- [ ] Finance can set price
- [ ] Product disappears from finance
- [ ] Product visible on product page

Done! Follow steps and check console! 🚀
