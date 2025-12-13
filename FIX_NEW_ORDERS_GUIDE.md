# Fix Supplier New Orders - Troubleshooting Guide

## Step 1: Apply Database Policies

Run the SQL file to ensure all policies are in place:

```bash
# Using Supabase CLI
supabase db push

# Or manually run the SQL
# Open Supabase Dashboard > SQL Editor > Run FIX_SUPPLIER_NEW_ORDERS.sql
```

## Step 2: Verify Supplier Role

Make sure your supplier user has the 'supplier' role:

```sql
-- Check if supplier has role
SELECT * FROM user_roles WHERE user_id = 'YOUR_SUPPLIER_USER_ID';

-- If not, add supplier role
INSERT INTO user_roles (user_id, role)
VALUES ('YOUR_SUPPLIER_USER_ID', 'supplier')
ON CONFLICT (user_id, role) DO NOTHING;
```

## Step 3: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to `/supplier/new-orders`
4. Look for any error messages
5. Check what's being logged:
   - "Error loading products"
   - "Error loading order items"
   - "Error loading users"

## Step 4: Test Database Access

Run these queries in Supabase SQL Editor (logged in as supplier):

```sql
-- Test 1: Can supplier see their products?
SELECT id, name FROM products WHERE supplier_id = auth.uid();

-- Test 2: Can supplier see order items?
SELECT oi.* 
FROM order_items oi
JOIN products p ON oi.product_id = p.id
WHERE p.supplier_id = auth.uid() AND oi.supplier_status = 'pending';

-- Test 3: Can supplier see orders?
SELECT o.* 
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE p.supplier_id = auth.uid();
```

## Step 5: Create Test Order

To test real-time functionality:

1. Login as a regular customer
2. Add a product from your supplier to cart
3. Place an order
4. Switch to supplier account
5. Go to `/supplier/new-orders`
6. Order should appear immediately

## Step 6: Check Real-Time Connection

Look for the green "Live" badge on the page. If it's there, real-time is working.

## Common Issues & Solutions

### Issue: "No new orders" shows even when orders exist

**Solution:** Check if orders have `supplier_status = 'pending'`

```sql
-- Update existing orders to pending
UPDATE order_items 
SET supplier_status = 'pending' 
WHERE supplier_status IS NULL;
```

### Issue: User details not showing

**Solution:** Verify profiles table has data

```sql
-- Check if profiles exist
SELECT id, full_name, email, phone FROM profiles;

-- If missing, profiles should be created automatically on signup
```

### Issue: Real-time not working

**Solution:** Check Supabase realtime settings

1. Go to Supabase Dashboard
2. Database > Replication
3. Ensure `orders` and `order_items` tables have replication enabled

### Issue: 403 Forbidden errors

**Solution:** RLS policies not applied correctly. Re-run `FIX_SUPPLIER_NEW_ORDERS.sql`

## Verification Checklist

- [ ] Supplier role exists in user_roles table
- [ ] All RLS policies applied (run FIX_SUPPLIER_NEW_ORDERS.sql)
- [ ] Supplier has products in database
- [ ] Test order exists with supplier_status = 'pending'
- [ ] Profiles table has customer data
- [ ] Real-time replication enabled for orders and order_items
- [ ] Browser console shows no errors
- [ ] Green "Live" badge appears on page

## Expected Behavior

When working correctly:

1. Supplier navigates to `/supplier/new-orders`
2. Page loads with green "Live" indicator
3. All pending orders for supplier's products are displayed
4. Customer name, email, phone are visible
5. Accept/Reject buttons work
6. When customer places new order, it appears instantly
7. After accepting/rejecting, order disappears from list
