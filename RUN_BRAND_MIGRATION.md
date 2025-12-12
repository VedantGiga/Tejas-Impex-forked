# How to Apply Brand Management Migration

## Step 1: Run the Migration

You need to apply the new migration to your Supabase database. Choose one of these methods:

### Method A: Using Supabase CLI (Recommended)
```bash
# Make sure you're in the project directory
cd tejas-impex-platform-main

# Run the migration
supabase db push
```

### Method B: Manual SQL Execution
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/20251207000009_brands_management.sql`
4. Paste and execute the SQL

## Step 2: Clear Existing Hardcoded Brands (Optional)

The database already has some sample brands from the initial migration. You can:
- Keep them and manage through admin panel
- Or delete them and add fresh brands

To delete existing brands (run in Supabase SQL Editor):
```sql
DELETE FROM public.brands;
```

## Step 3: Test the System

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Login as Admin**:
   - Go to `/login`
   - Login with admin credentials

3. **Access Brand Management**:
   - Go to `/admin` (Admin Dashboard)
   - Click "Manage Brands"
   - Or directly visit `/admin/brands`

4. **Add a Test Brand**:
   - Click "Add Brand" button
   - Fill in:
     - Name: "Test Brand"
     - Country: "USA"
     - Description: "Test description"
     - Check "Featured Brand" if you want it on homepage
   - Click "Save"

5. **Verify on Frontend**:
   - Go to `/brands` - should see your brand
   - Go to `/` (homepage) - should see featured brands

## Troubleshooting

### If brands don't show up:
1. Check browser console for errors
2. Verify the brand is marked as "active" in admin panel
3. Check Supabase logs for RLS policy errors
4. Ensure you're logged in as admin when accessing `/admin/brands`

### If you get RLS policy errors:
- Make sure the migration ran successfully
- Check that your user has admin role in `user_roles` table

### To verify admin role:
```sql
-- Run in Supabase SQL Editor
SELECT * FROM public.user_roles WHERE user_id = 'YOUR_USER_ID';
```

## Features Available

✅ Add new brands
✅ Edit existing brands  
✅ Delete brands
✅ Toggle active/inactive status
✅ Mark brands as featured (shows on homepage)
✅ Automatic slug generation
✅ Frontend displays only active brands
✅ Homepage shows only featured brands (max 4)

## Notes

- Brands are automatically set to "active" when created
- Slug is auto-generated from brand name (lowercase, spaces replaced with hyphens)
- Only admins can manage brands
- Public users can only view active brands
- Featured brands appear on homepage (limited to 4)
