-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Suppliers can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Suppliers can update their product images" ON storage.objects;
DROP POLICY IF EXISTS "Suppliers can delete their product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;

-- Allow suppliers to upload images
CREATE POLICY "Suppliers can upload product images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'product-images' AND
    public.has_role(auth.uid(), 'supplier')
  );

-- Allow suppliers to update their images
CREATE POLICY "Suppliers can update their product images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'product-images' AND
    public.has_role(auth.uid(), 'supplier')
  );

-- Allow suppliers to delete their images
CREATE POLICY "Suppliers can delete their product images" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'product-images' AND
    public.has_role(auth.uid(), 'supplier')
  );

-- Allow public read access to product images
CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'product-images');
