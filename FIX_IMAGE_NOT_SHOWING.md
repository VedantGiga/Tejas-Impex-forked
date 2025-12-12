# 🔧 Fix: Images Not Showing With Products

## Problem
Supplier adds product with image, but image doesn't appear on product pages.

## Possible Causes & Solutions

### 1. Product Not Approved ⚠️
**Most Common Issue**

**Problem:** Supplier adds product → Product status = "pending" → Public pages filter by `approval_status = 'approved'` → Product doesn't show

**Solution:**
1. Login as **Admin**
2. Go to **Supplier Approvals** (`/admin/suppliers`)
3. Click on the supplier
4. Find the product in the products list
5. Click **Approve** (green checkmark button)
6. Now product will show on all public pages WITH image

**Check in SQL:**
```sql
-- See all products and their approval status
SELECT id, name, approval_status, supplier_id 
FROM products 
ORDER BY created_at DESC;

-- Approve a product manually
UPDATE products 
SET approval_status = 'approved' 
WHERE id = 'PRODUCT_ID_HERE';
```

### 2. Image Not Uploaded to Storage

**Problem:** Image upload failed but product was created

**Check:**
1. Open browser console (F12)
2. Look for errors during product submission
3. Check Supabase Storage bucket

**Solution:**
```sql
-- Check if product has images
SELECT 
  p.id,
  p.name,
  COUNT(pi.id) as image_count
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE p.id = 'PRODUCT_ID_HERE'
GROUP BY p.id, p.name;

-- If image_count = 0, image was not uploaded
```

**Fix:** Re-upload the product with image OR add image manually:
1. Go to Supabase Dashboard
2. Storage → product-images bucket
3. Upload image
4. Copy public URL
5. Insert into product_images table:
```sql
INSERT INTO product_images (product_id, image_url, sort_order)
VALUES ('PRODUCT_ID_HERE', 'IMAGE_URL_HERE', 0);
```

### 3. Storage Bucket Doesn't Exist

**Problem:** `product-images` bucket not created

**Check:**
```sql
SELECT * FROM storage.buckets WHERE id = 'product-images';
```

**Solution:** Run migration:
```sql
-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;
```

### 4. Storage Policies Missing

**Problem:** RLS policies not allowing public access to images

**Check:**
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%product%';
```

**Solution:** Run migration `20251207000007_create_product_images_bucket.sql`

Or manually:
```sql
-- Allow public read access to product images
CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'product-images');
```

### 5. Product Images Table Policy Issue

**Problem:** RLS blocking access to product_images table

**Check:**
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'product_images';
```

**Solution:**
```sql
-- Allow anyone to view product images
CREATE POLICY "Anyone can view product images" ON public.product_images
  FOR SELECT USING (true);
```

### 6. Query Not Joining product_images

**Problem:** Frontend code not fetching images

**Check:** Look at the query in the page code:
```typescript
// ❌ WRONG - No images
.select('*')

// ✅ CORRECT - With images
.select('*, product_images(image_url)')
```

**Solution:** Already fixed in all pages! If still not working, check browser console for errors.

## Step-by-Step Debugging

### Step 1: Run Debug SQL
Copy and run `DEBUG_IMAGE_ISSUE.sql` in Supabase SQL Editor to see:
- All products
- All product images
- Storage bucket status
- RLS policies

### Step 2: Check Specific Product
```sql
-- Replace PRODUCT_ID with actual product ID
SELECT 
  p.*,
  pi.image_url
FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE p.id = 'PRODUCT_ID';
```

### Step 3: Check Browser Console
1. Open product page
2. Press F12
3. Look for errors:
   - 403 Forbidden → RLS policy issue
   - 404 Not Found → Image doesn't exist
   - CORS error → Storage bucket not public

### Step 4: Test Image URL Directly
1. Copy image URL from database
2. Paste in browser
3. If image doesn't load → Storage issue
4. If image loads → Frontend query issue

## Quick Fix Checklist

- [ ] Product approved? (`approval_status = 'approved'`)
- [ ] Image exists in `product_images` table?
- [ ] Storage bucket `product-images` exists?
- [ ] Storage bucket is public?
- [ ] RLS policy allows public read?
- [ ] Frontend query includes `product_images(image_url)`?
- [ ] Browser console shows no errors?

## Common Scenarios

### Scenario 1: Supplier Just Added Product
**Issue:** Image not showing
**Reason:** Product pending approval
**Fix:** Admin approves product

### Scenario 2: Admin Added Product
**Issue:** Image not showing
**Reason:** Admin used old form without image upload
**Fix:** Edit product and add image OR use supplier add product flow

### Scenario 3: Image Shows in Admin Panel but Not Public Pages
**Issue:** Approval status
**Reason:** Public pages filter by `approval_status = 'approved'`
**Fix:** Approve the product

### Scenario 4: Image Shows Broken Icon
**Issue:** Image URL invalid or storage not accessible
**Reason:** Storage bucket not public OR image deleted
**Fix:** 
1. Check storage bucket is public
2. Re-upload image
3. Update image URL in database

## Testing After Fix

1. **Supplier adds product:**
   - Upload image
   - Submit
   - Check Supabase: product_images table has entry

2. **Admin approves:**
   - Go to supplier detail
   - Approve product
   - Check approval_status = 'approved'

3. **Verify on pages:**
   - Products page → Image shows
   - Product detail → Image shows
   - New arrivals → Image shows
   - Brand/Category pages → Image shows

## Need More Help?

Run this query to get full diagnostic:
```sql
-- Full diagnostic
SELECT 
  'Products' as table_name,
  COUNT(*) as total_count,
  COUNT(CASE WHEN approval_status = 'approved' THEN 1 END) as approved_count,
  COUNT(CASE WHEN approval_status = 'pending' THEN 1 END) as pending_count
FROM products

UNION ALL

SELECT 
  'Product Images' as table_name,
  COUNT(*) as total_count,
  COUNT(DISTINCT product_id) as products_with_images,
  NULL as pending_count
FROM product_images

UNION ALL

SELECT 
  'Storage Buckets' as table_name,
  COUNT(*) as total_count,
  COUNT(CASE WHEN public = true THEN 1 END) as public_buckets,
  NULL as pending_count
FROM storage.buckets
WHERE id = 'product-images';
```

This will show:
- Total products vs approved products
- How many products have images
- If storage bucket exists and is public
