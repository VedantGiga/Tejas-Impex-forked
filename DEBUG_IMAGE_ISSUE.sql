-- ⚠️ RUN THIS IN SUPABASE SQL EDITOR TO DEBUG IMAGE ISSUES ⚠️
-- This will help identify why images are not showing

-- 1. Check if products exist
SELECT 
  id, 
  name, 
  supplier_id, 
  approval_status,
  is_active,
  created_at
FROM public.products
ORDER BY created_at DESC
LIMIT 10;

-- 2. Check if product_images exist for these products
SELECT 
  pi.id,
  pi.product_id,
  pi.image_url,
  p.name as product_name,
  p.approval_status,
  pi.created_at
FROM public.product_images pi
JOIN public.products p ON pi.product_id = p.id
ORDER BY pi.created_at DESC
LIMIT 10;

-- 3. Check if storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'product-images';

-- 4. Check storage policies
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%product%';

-- 5. Check product_images RLS policies
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'product_images';

-- 6. Check if any products have images
SELECT 
  p.id,
  p.name,
  p.approval_status,
  COUNT(pi.id) as image_count
FROM public.products p
LEFT JOIN public.product_images pi ON p.id = pi.product_id
GROUP BY p.id, p.name, p.approval_status
ORDER BY p.created_at DESC
LIMIT 20;
