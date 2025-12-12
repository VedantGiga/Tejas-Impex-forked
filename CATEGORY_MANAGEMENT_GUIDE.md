# Category Management System

## Overview
Categories can now be managed dynamically by admins. Categories added/edited by admins will automatically appear on the frontend.

## What Was Done

### 1. Database Migration
- **File**: `supabase/migrations/20251207000010_categories_management.sql`
- Added proper RLS policies for category management

### 2. Admin Categories Management Page
- **File**: `src/pages/admin/Categories.tsx`
- Full CRUD functionality:
  - Add new categories
  - Edit existing categories
  - Delete categories
  - Toggle active/inactive status
  - Set display order

### 3. Frontend Updates
- **File**: `src/pages/Categories.tsx`
  - Fetches categories from database
  - Shows only active categories
  
- **File**: `src/pages/Index.tsx`
  - Shop by Category section fetches from database
  - Shows only active categories (max 6 on homepage)

### 4. Admin Dashboard
- **File**: `src/pages/admin/Dashboard.tsx`
- Added "Manage Categories" card

### 5. Routing
- **File**: `src/App.tsx`
- Added route: `/admin/categories`

## How to Use

### For Admins:
1. Login as admin
2. Go to Admin Dashboard
3. Click "Manage Categories"
4. Add new categories with:
   - Category Name (required)
   - Display Order (for sorting)
5. Categories are automatically active when created

### For Users:
- Active categories appear on:
  - `/categories` page (all active categories)
  - Homepage (max 6 categories)

## Database Schema

```sql
categories table:
- id: UUID
- name: TEXT
- slug: TEXT (auto-generated)
- display_order: INT (for sorting)
- is_active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## Next Steps
Run migrations:
```bash
supabase db push
```
