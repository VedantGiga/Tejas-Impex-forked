# Finance Role Setup - Quick Instructions

## Problem: Enum Transaction Error
PostgreSQL mein enum value add karne ke baad same transaction mein use nahi kar sakte. Isliye 2 steps mein setup karna padega.

## Solution: Run in 2 Steps

### Step 1: Add Finance Role (Run First)
```sql
-- File: APPLY_FINANCE_ROLE.sql
-- Ya direct run karo:

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'finance';
```

**Important:** Is query ko run karne ke baad:
1. Query complete hone ka wait karo
2. 2-3 seconds wait karo
3. Tab Step 2 run karo

### Step 2: Add Finance Workflow (Run Second)
```sql
-- File: APPLY_FINANCE_ROLE_STEP2.sql
-- Complete file run karo
```

## Supabase Dashboard Mein Kaise Karein?

### Method 1: SQL Editor (Recommended)

1. **Supabase Dashboard** kholo
2. **SQL Editor** mein jao
3. **New Query** click karo

4. **First Query Run Karo:**
   ```sql
   ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'finance';
   ```
   - Run button dabao
   - Success message ka wait karo
   - **2-3 seconds wait karo**

5. **Second Query Run Karo:**
   - `APPLY_FINANCE_ROLE_STEP2.sql` file ka content copy karo
   - SQL Editor mein paste karo
   - Run button dabao
   - Success message ka wait karo

### Method 2: Migrations (Alternative)

Agar local development hai to:

```bash
# Terminal mein
cd supabase

# Step 1 migration
supabase migration new add_finance_role_step1

# File mein ye dalo:
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'finance';

# Push karo
supabase db push

# Wait 2-3 seconds

# Step 2 migration
supabase migration new add_finance_workflow

# APPLY_FINANCE_ROLE_STEP2.sql ka content copy karo
# Push karo
supabase db push
```

## Verification

Setup complete hone ke baad verify karo:

```sql
-- 1. Check finance role exists
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'public.app_role'::regtype;
-- Output mein 'finance' dikhna chahiye

-- 2. Check new columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name LIKE '%finance%';
-- Output: finance_status, finance_price, finance_approved_at, finance_approved_by

-- 3. Check policies
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'products' 
AND policyname LIKE '%finance%';
-- Output: Finance can view pending products, Finance can update product prices

-- 4. Check view
SELECT * FROM finance_pending_products LIMIT 1;
-- Should work without error
```

## Quick Summary

**DO THIS:**
1. Run `APPLY_FINANCE_ROLE.sql` → Wait 2-3 seconds
2. Run `APPLY_FINANCE_ROLE_STEP2.sql` → Done!

**DON'T DO THIS:**
❌ Run both queries together
❌ Run complete migration file at once
❌ Skip waiting between steps

## After Setup

1. Create finance user via `/signup` with Finance role
2. Login at `/finance-login`
3. Test complete workflow

## Files Reference

- `APPLY_FINANCE_ROLE.sql` - Step 1 (Enum only)
- `APPLY_FINANCE_ROLE_STEP2.sql` - Step 2 (Everything else)
- `supabase/migrations/20251207000017_add_finance_role_step1.sql` - Migration Step 1
- `supabase/migrations/20251207000018_add_finance_workflow.sql` - Migration Step 2

## Still Getting Error?

Agar phir bhi error aa raha hai:

1. **Check if finance already exists:**
   ```sql
   SELECT enumlabel FROM pg_enum WHERE enumtypid = 'public.app_role'::regtype;
   ```
   Agar 'finance' already hai, to directly Step 2 run karo

2. **Manual enum add:**
   ```sql
   -- Separate query window mein
   ALTER TYPE public.app_role ADD VALUE 'finance';
   ```
   Wait 5 seconds, then run Step 2

3. **Fresh start:**
   ```sql
   -- Agar test database hai to reset karo
   -- Production mein mat karo!
   ```

Done! 🎉
