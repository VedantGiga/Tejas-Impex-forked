-- Ensure brands table has all necessary columns and policies
-- This migration ensures the brands table is properly set up for admin management

-- Add description column if it doesn't exist (for backward compatibility)
ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Update RLS policies for brands
DROP POLICY IF EXISTS "Anyone can view active brands" ON public.brands;
DROP POLICY IF EXISTS "Admins can manage brands" ON public.brands;

-- Anyone can view active brands
CREATE POLICY "Anyone can view active brands" ON public.brands
  FOR SELECT USING (is_active = true);

-- Admins can view all brands (including inactive)
CREATE POLICY "Admins can view all brands" ON public.brands
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert brands
CREATE POLICY "Admins can insert brands" ON public.brands
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update brands
CREATE POLICY "Admins can update brands" ON public.brands
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete brands
CREATE POLICY "Admins can delete brands" ON public.brands
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
