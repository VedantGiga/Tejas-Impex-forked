# Supplier Signup Fields Update

## Changes Made

### 1. Updated Signup Page (`src/pages/Signup.tsx`)
- Added `businessAddress` state for supplier accounts
- Business Address field appears conditionally when "Supplier" is selected
- Field is a textarea for complete address entry
- All fields are now required for suppliers:
  - Name (Full Name)
  - Email
  - Phone
  - Business Address (only for suppliers)
  - Password

### 2. Database Update Required

Run the SQL file `UPDATE_SUPPLIER_SIGNUP.sql` in your Supabase SQL Editor to update the user signup handler.

This will ensure that when a supplier creates an account, the following fields are saved:
- `full_name` → profiles.full_name
- `email` → profiles.email
- `phone` → profiles.phone
- `business_address` → profiles.business_address (only for suppliers)

## Supplier Signup Flow

1. User visits `/signup`
2. Fills in Name, Email, Phone
3. Selects "Supplier" as Account Type
4. Business Address field appears
5. Fills in Business Address (required)
6. Enters Password
7. Clicks "Sign Up"
8. Account is created with all supplier information

## Fields Collected

### For All Users:
- Name
- Email
- Phone
- Password

### Additional for Suppliers:
- Business Address (complete address)

## Database Schema

The `profiles` table already has these fields (from previous migrations):
- `full_name` TEXT
- `email` TEXT
- `phone` TEXT
- `business_address` TEXT (for suppliers)
- `business_name` TEXT (optional, can be added later)
- `gst_number` TEXT (optional, can be added later)

## Next Steps

1. Run `UPDATE_SUPPLIER_SIGNUP.sql` in Supabase SQL Editor
2. Test supplier signup flow
3. Verify data is saved correctly in profiles table
