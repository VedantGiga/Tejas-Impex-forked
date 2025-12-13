# Test Admin → Finance Flow (Real-time)

## What Changed:
✅ Product will **immediately disappear** from admin after approval
✅ Product will **immediately appear** in finance dashboard
✅ Product will **immediately disappear** from finance after price update

## Test Steps:

### 1. Open Two Browser Windows

**Window 1: Admin**
- Login as admin
- Go to `/admin/product-approvals`
- Open browser console (F12)

**Window 2: Finance**
- Login as finance
- Go to `/finance`
- Open browser console (F12)

### 2. Test Approval

**In Admin Window:**
1. See pending products
2. Click "Send to Finance" button
3. **Expected:** 
   - Product disappears immediately ✅
   - Console shows: "Update success: [...]"

**In Finance Window:**
1. **Expected:**
   - Product appears immediately ✅
   - Console shows: "Finance: Product updated: {...}"

### 3. Test Finance Approval

**In Finance Window:**
1. Set price (e.g., ₹1200)
2. Click "Approve & Set Price"
3. **Expected:**
   - Product disappears immediately ✅
   - Console shows: "Finance update success"

**Check Product Page:**
1. Go to `/products`
2. **Expected:** Product visible with finance price ✅

## If Product Not Disappearing:

### Check Console Errors:
Look for any red errors in browser console

### Manual Test in SQL:
```sql
-- Check if update worked
SELECT id, name, approval_status, supplier_price, finance_status
FROM products
ORDER BY updated_at DESC
LIMIT 5;
```

### Force Refresh:
1. After clicking button, wait 2 seconds
2. Refresh page manually
3. Product should be gone

## Debug Commands:

### In Admin Console:
```javascript
// Check current products
console.log('Current products:', products);

// After approval, check if removed
console.log('Products after approval:', products);
```

### In Finance Console:
```javascript
// Check if products loading
const test = await supabase
  .from('products')
  .select('*')
  .eq('approval_status', 'finance_pending');
console.log('Finance pending products:', test.data);
```

## Expected Console Output:

### Admin (after clicking Send to Finance):
```
Sending to finance: {approval_status: "finance_pending", supplier_price: 1000, ...}
Update success: [{...}]
Product updated: {new: {...}, old: {...}}
```

### Finance (when product arrives):
```
Finance: Product updated: {new: {approval_status: "finance_pending", ...}}
```

### Finance (after setting price):
```
Finance update success
```

## Complete Flow Test:

```
1. Admin sees product ✅
   ↓
2. Admin clicks "Send to Finance" ✅
   ↓
3. Product disappears from admin (instant) ✅
   ↓
4. Product appears in finance (instant) ✅
   ↓
5. Finance sets price ✅
   ↓
6. Product disappears from finance (instant) ✅
   ↓
7. Product visible on product page ✅
```

## If Still Not Working:

1. **Clear browser cache**
2. **Hard refresh** (Ctrl+Shift+R)
3. **Check if realtime is enabled:**
   ```sql
   SELECT * FROM pg_publication_tables 
   WHERE pubname = 'supabase_realtime' 
   AND tablename = 'products';
   ```

Done! Test karo aur batao kya ho raha hai! 🚀
