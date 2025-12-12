-- Ensure categories table has proper RLS policies for admin management

-- Update RLS policies for categories
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;

-- Anyone can view active categories
CREATE POLICY "Anyone can view active categories" ON public.categories
  FOR SELECT USING (is_active = true);

-- Admins can view all categories (including inactive)
CREATE POLICY "Admins can view all categories" ON public.categories
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert categories
CREATE POLICY "Admins can insert categories" ON public.categories
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update categories
CREATE POLICY "Admins can update categories" ON public.categories
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete categories
CREATE POLICY "Admins can delete categories" ON public.categories
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
