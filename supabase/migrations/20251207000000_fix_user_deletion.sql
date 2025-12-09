-- Add DELETE policy for profiles table
-- Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE USING (auth.uid() = id);

-- Add DELETE policy for user_roles table  
-- Users can delete their own roles (needed for account deletion)
CREATE POLICY "Users can delete own roles" ON public.user_roles
  FOR DELETE USING (auth.uid() = user_id);
