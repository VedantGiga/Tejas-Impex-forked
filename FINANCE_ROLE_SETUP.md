# Finance Role Implementation Guide

## Overview
Finance role ka implementation complete ho gaya hai. Ab product approval workflow yeh hai:
1. **Supplier** → Product add karta hai apne price se
2. **Admin** → Product approve karta hai aur finance ko bhejta hai
3. **Finance** → Final price set karta hai (increase/decrease)
4. **Live** → Product customer ko dikhta hai finance ke price se

## Database Changes

### Migration File
Location: `supabase/migrations/20251207000017_add_finance_role.sql`

**Changes:**
- Finance role add kiya `app_role` enum mein
- Products table mein naye columns:
  - `finance_status`: Finance approval status
  - `supplier_price`: Original supplier ka price
  - `finance_price`: Finance ka final price
  - `finance_approved_at`: Finance approval timestamp
  - `finance_approved_by`: Finance user ID
- `approval_status` mein `finance_pending` state add kiya
- Finance ke liye RLS policies
- `finance_pending_products` view banaya

### Apply Migration
```sql
-- Run this migration in Supabase SQL Editor
-- File: supabase/migrations/20251207000017_add_finance_role.sql
```

## Frontend Changes

### 1. Signup Page (`src/pages/Signup.tsx`)
- Finance role option add kiya
- Ab 3 roles available: User, Supplier, Finance

### 2. Finance Login (`src/pages/FinanceLogin.tsx`)
- Dedicated finance login page
- URL: `/finance-login`
- Finance credentials verify karta hai

### 3. Finance Dashboard (`src/pages/finance/Dashboard.tsx`)
**Features:**
- Pending products list (jo admin ne approve kiye)
- Supplier price dikhta hai
- Finance apna price set kar sakta hai
- Margin calculation (supplier price vs finance price)
- Approve button se product live ho jata hai

**URL:** `/finance`

### 4. Admin Product Approvals (`src/pages/admin/ProductApprovals.tsx`)
**Updated Workflow:**
- Admin ab price set nahi karta
- "Approve" button ab "Send to Finance" hai
- Product finance_pending status mein chala jata hai
- Stock quantity admin set kar sakta hai

### 5. Routes (`src/App.tsx`)
Naye routes add kiye:
- `/finance-login` - Finance login page
- `/finance` - Finance dashboard

### 6. Types (`src/types/index.ts`)
- UserRole mein 'finance' add kiya

## Product Flow Example

### Step 1: Supplier adds product
```
Product Details:
- Name: "Sample Product"
- Supplier Price: ₹1000
- Status: pending
```

### Step 2: Admin approves
```
Admin Action: "Send to Finance"
Updated Status:
- approval_status: finance_pending
- supplier_price: ₹1000 (saved)
- Stock updated by admin
```

### Step 3: Finance sets price
```
Finance Dashboard shows:
- Supplier Price: ₹1000
- Finance can set: ₹1200 (20% margin)
- Or decrease: ₹900 (-10% margin)

Finance Action: "Approve & Set Price"
Updated Status:
- finance_price: ₹1200
- price: ₹1200 (final customer price)
- finance_status: approved
- approval_status: approved
- Product goes LIVE
```

### Step 4: Customer sees product
```
Product Page shows:
- Price: ₹1200 (finance ka price)
- Product is now visible to all customers
```

## Access URLs

### For Admin
- Login: `/admin-access`
- Dashboard: `/admin`
- Product Approvals: `/admin/product-approvals`

### For Finance
- Login: `/finance-login`
- Dashboard: `/finance`

### For Supplier
- Login: `/login` (with supplier account)
- Dashboard: `/supplier`

## Creating Finance User

### Method 1: Via Signup Page
1. Go to `/signup`
2. Fill details
3. Select "Finance" role
4. Submit

### Method 2: Via SQL (Direct)
```sql
-- First create auth user (via Supabase Auth UI or signup)
-- Then insert role
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_UUID_HERE', 'finance');
```

## Testing Workflow

### Complete Test Flow:
1. **Supplier Login** → Add product with price ₹1000
2. **Admin Login** → Approve product → Sends to finance
3. **Finance Login** → See product in dashboard
4. **Finance** → Set price to ₹1200 → Approve
5. **Customer** → Product visible at ₹1200

## Security (RLS Policies)

### Finance Policies:
- Finance can only view `finance_pending` products
- Finance can only update prices of `finance_pending` products
- Public can only see `approved` + `finance_approved` products

### Admin Policies:
- Admin can view all products
- Admin can approve/reject pending products

### Supplier Policies:
- Supplier can only edit products in `pending` status
- Cannot edit after admin approval

## Important Notes

1. **Price Flow:**
   - Supplier price → Saved as `supplier_price`
   - Finance price → Saved as `finance_price` and `price`
   - Customer sees `price` column

2. **Status Flow:**
   - `pending` → Admin review
   - `finance_pending` → Finance review
   - `approved` → Live on site
   - `rejected` → Not visible

3. **Finance Dashboard:**
   - Shows only products waiting for pricing
   - Real-time margin calculation
   - One-click approval with price update

4. **Admin Dashboard:**
   - No longer sets prices
   - Only approves/rejects products
   - Can set stock quantity

## Troubleshooting

### Finance can't see products?
- Check if admin approved the product
- Verify product status is `finance_pending`
- Check finance user role in `user_roles` table

### Products not showing to customers?
- Verify `approval_status = 'approved'`
- Verify `finance_status = 'approved'`
- Check `is_active = true`

### Finance can't update price?
- Check RLS policies
- Verify user has 'finance' role
- Check product is in `finance_pending` status

## Next Steps

1. Apply the migration file
2. Create a finance user account
3. Test the complete workflow
4. Monitor the finance dashboard

## Support

For any issues:
1. Check Supabase logs
2. Verify RLS policies
3. Check user roles in database
4. Ensure migration is applied
