# Real-time Product Approval Workflow

## Setup Required

### Step 1: Enable Realtime on Products Table
Run this SQL in Supabase SQL Editor:

```sql
-- File: ENABLE_PRODUCTS_REALTIME.sql
ALTER PUBLICATION supabase_realtime ADD TABLE products;
```

## Complete Workflow

### 1. Supplier Adds Product
```
Supplier Dashboard → Add Product → Submit
Status: approval_status = 'pending'
```

### 2. Admin Approval (Real-time)
```
Admin Dashboard → Product Approvals → See new product instantly
Click "Send to Finance" → Product disappears immediately
Status: approval_status = 'finance_pending'
        supplier_price = original price saved
```

**Real-time Features:**
- ✅ New products appear instantly in admin dashboard
- ✅ Approved products disappear instantly from admin view
- ✅ No page refresh needed

### 3. Finance Dashboard (Real-time)
```
Finance Dashboard → Product appears instantly after admin approval
Set Price → Click "Approve & Set Price"
Status: approval_status = 'approved'
        finance_status = 'approved'
        price = finance price
```

**Real-time Features:**
- ✅ Products appear instantly when admin approves
- ✅ Products disappear instantly after finance approval
- ✅ Live count updates
- ✅ No page refresh needed

### 4. Product Goes Live
```
Product Page → Product visible to customers
Price shown: Finance approved price
Status: Available for purchase
```

**Customer View:**
- ✅ Only sees approved products (both admin + finance)
- ✅ Sees final price set by finance
- ✅ Can add to cart and purchase

## Real-time Subscriptions

### Admin Dashboard
```javascript
// Listens to: approval_status = 'pending'
// Updates when:
- New product added by supplier
- Product status changes from pending
```

### Finance Dashboard
```javascript
// Listens to: approval_status = 'finance_pending'
// Updates when:
- Admin approves product
- Finance approves product (removes from list)
```

## Flow Diagram

```
┌─────────────┐
│  Supplier   │
│ Adds Product│
└──────┬──────┘
       │ status: pending
       ▼
┌─────────────────┐
│ Admin Dashboard │ ◄── Real-time: Shows pending products
│  (Real-time)    │
└──────┬──────────┘
       │ Approves → status: finance_pending
       │ (Disappears instantly)
       ▼
┌──────────────────┐
│Finance Dashboard │ ◄── Real-time: Shows finance_pending products
│   (Real-time)    │
└──────┬───────────┘
       │ Sets Price → status: approved
       │ (Disappears instantly)
       ▼
┌─────────────────┐
│  Product Page   │ ◄── Product visible to customers
│   (Live)        │
└─────────────────┘
```

## Testing Real-time Flow

### Test 1: Admin to Finance
1. Open Admin Dashboard in one browser tab
2. Open Finance Dashboard in another tab
3. Admin approves a product
4. **Expected:** Product disappears from admin, appears in finance instantly

### Test 2: Finance to Live
1. Open Finance Dashboard
2. Open Product Page in another tab
3. Finance approves with price
4. **Expected:** Product disappears from finance, appears on product page

### Test 3: Multiple Users
1. Two admins open dashboard
2. One admin approves product
3. **Expected:** Both see product disappear instantly

## Database Status Flow

```sql
-- Supplier adds
approval_status = 'pending'
finance_status = 'pending'

-- Admin approves
approval_status = 'finance_pending'
supplier_price = [original price]
finance_status = 'pending'

-- Finance approves
approval_status = 'approved'
finance_status = 'approved'
finance_price = [new price]
price = [new price]

-- Customer sees
WHERE approval_status = 'approved' 
  AND finance_status = 'approved'
  AND is_active = true
```

## Troubleshooting

### Products not appearing in real-time?

**Check 1: Realtime enabled**
```sql
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'products';
```
Should return: products

**Check 2: Browser console**
Look for subscription messages:
```
SUBSCRIBED to channel: admin-products-changes
SUBSCRIBED to channel: finance-products-changes
```

**Check 3: RLS Policies**
```sql
-- Admin should see pending
SELECT * FROM products WHERE approval_status = 'pending';

-- Finance should see finance_pending
SELECT * FROM products WHERE approval_status = 'finance_pending';
```

### Product not disappearing after approval?

**Solution:** Check if realtime subscription is active
```javascript
// Should see in console:
postgres_changes event received
```

### Product not visible to customers?

**Check status:**
```sql
SELECT id, name, approval_status, finance_status, is_active
FROM products
WHERE id = 'PRODUCT_ID';

-- Should be:
-- approval_status = 'approved'
-- finance_status = 'approved'
-- is_active = true
```

## Performance Notes

1. **Real-time subscriptions are lightweight**
   - Only listens to specific status changes
   - Automatically reconnects on disconnect

2. **No polling needed**
   - Uses WebSocket connection
   - Instant updates without API calls

3. **Efficient queries**
   - Filtered by status at database level
   - Only fetches relevant products

## Summary

✅ **Admin Dashboard:**
- Real-time pending products
- Instant disappear on approval
- Auto-refresh list

✅ **Finance Dashboard:**
- Real-time finance_pending products
- Instant appear when admin approves
- Instant disappear when finance approves
- Live count updates

✅ **Product Page:**
- Shows only fully approved products
- Finance price displayed
- Ready for customer purchase

✅ **No Manual Refresh:**
- Everything updates automatically
- Smooth user experience
- Real-time collaboration

## Next Steps

1. Run `ENABLE_PRODUCTS_REALTIME.sql`
2. Test the complete flow
3. Verify real-time updates working
4. Deploy to production

Done! 🎉
