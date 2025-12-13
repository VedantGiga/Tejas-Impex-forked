# Quick Fix Guide - 500 Errors & Auth Issues

## Step 1: Fix Database Policies (CRITICAL)

Run this SQL in Supabase SQL Editor:

```bash
# Apply the fix
supabase db push
```

Or manually run `FIX_ALL_RLS_POLICIES.sql` in Supabase Dashboard > SQL Editor

## Step 2: Clear Browser Data

The refresh token error means your session is corrupted. Fix it:

1. Open browser DevTools (F12)
2. Go to Application tab (Chrome) or Storage tab (Firefox)
3. Expand "Local Storage"
4. Find your Supabase domain
5. Click "Clear All" or delete all items
6. Close DevTools
7. Refresh the page
8. Login again

**OR** Use incognito/private window to test

## Step 3: Verify Database Setup

Run these queries in Supabase SQL Editor:

```sql
-- Check if user_roles table exists
SELECT * FROM user_roles LIMIT 5;

-- Check if profiles table exists
SELECT * FROM profiles LIMIT 5;

-- Check if orders table exists
SELECT * FROM orders LIMIT 5;

-- Check if order_items has supplier_status
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'order_items' AND column_name = 'supplier_status';
```

## Step 4: Test Ordering Flow

1. **Logout completely**
2. **Clear browser storage** (see Step 2)
3. **Login as regular user** (not supplier/admin)
4. **Add product to cart**
5. **Place order**
6. **Check browser console** - should be no 500 errors

## Step 5: Test Supplier New Orders

1. **Logout**
2. **Login as supplier**
3. **Go to** `/supplier/new-orders`
4. **Check console** - should see:
   - No 500 errors
   - Green "Live" badge
   - Orders appear (if any exist)

## Common Errors & Solutions

### Error: "Invalid Refresh Token"
**Solution:** Clear browser local storage and login again

### Error: "500 on /rest/v1/profiles"
**Solution:** Run `FIX_ALL_RLS_POLICIES.sql` - profiles policy has recursion

### Error: "500 on /rest/v1/orders"
**Solution:** Run `FIX_ALL_RLS_POLICIES.sql` - orders policy has recursion

### Error: "No new orders" but orders exist
**Solution:** 
```sql
UPDATE order_items SET supplier_status = 'pending' WHERE supplier_status IS NULL;
```

### Error: User details not showing
**Solution:** Check if profiles exist:
```sql
SELECT * FROM profiles WHERE id IN (SELECT user_id FROM orders);
```

## Testing Checklist

After applying fixes:

- [ ] Can login without errors
- [ ] Can view products page
- [ ] Can add to cart
- [ ] Can place order (no 500 errors)
- [ ] Supplier can view `/supplier/new-orders`
- [ ] New orders show in real-time
- [ ] Customer details visible
- [ ] Accept/Reject buttons work

## If Still Not Working

1. Check Supabase logs:
   - Dashboard > Logs > Postgres Logs
   - Look for policy errors

2. Enable RLS debugging:
```sql
SET log_statement = 'all';
```

3. Check if tables have RLS enabled:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'orders', 'order_items', 'products');
```

All should show `rowsecurity = true`

## Emergency Reset (Last Resort)

If nothing works, reset all policies:

```sql
-- Disable RLS temporarily (DANGEROUS - only for testing)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;

-- Test if it works now
-- If yes, the issue is with RLS policies

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Then run FIX_ALL_RLS_POLICIES.sql
```
