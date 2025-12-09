# 3-Role Authentication Setup Guide

## System Overview

Aapke system mein ab 3 roles hain:
1. **Admin** - Complete control, manage products, orders, users
2. **Supplier** - Add/manage their own products, view their sales
3. **User** - Browse products, place orders, manage profile

---

## Step 1: Database Migrations Run Karo

Terminal mein yeh commands run karo:

```bash
cd d:\tejas-impex-platform-main\tejas-impex-platform-main

# Option 1: Supabase CLI se (recommended)
npx supabase db push

# Option 2: Manual SQL execution (agar CLI nahi hai)
# Supabase Dashboard → SQL Editor mein jao aur files execute karo
```

**Manual execution ke liye:**
1. Supabase Dashboard kholo
2. SQL Editor mein jao
3. Yeh files ka SQL copy-paste karke run karo (order mein):
   - `20251207000000_fix_user_deletion.sql`
   - `20251207000001_add_supplier_role.sql`
   - `20251207000002_update_user_handler.sql`

---

## Step 2: Browser Cache Clear Karo

**Important!** 406 error fix ke liye:

1. Browser DevTools kholo (F12)
2. Right-click on refresh button
3. "Empty Cache and Hard Reload" select karo

**Ya:**
- Incognito/Private window mein test karo

---

## Step 3: Dev Server Restart Karo

```bash
# Terminal mein Ctrl+C press karo (server stop)
# Phir restart karo:
npm run dev
```

---

## Step 4: Email Confirmation Settings

Supabase Dashboard mein:
1. Authentication → Settings
2. **Email provider: ON** ✅
3. **Confirm email: OFF** ❌ (testing ke liye)

---

## Step 5: Test Karo

### User Signup (Regular Customer)
```javascript
// Browser console mein
const { error } = await supabase.auth.signUp({
  email: 'user@test.com',
  password: 'password123',
  options: {
    data: {
      full_name: 'Test User',
      role: 'user'
    }
  }
});
```

### Supplier Signup
```javascript
const { error } = await supabase.auth.signUp({
  email: 'supplier@test.com',
  password: 'password123',
  options: {
    data: {
      full_name: 'Test Supplier',
      role: 'supplier'
    }
  }
});
```

### Admin Create Karna (SQL Editor mein)
```sql
-- Pehle ek user signup karo, phir usko admin banao
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'admin');
```

---

## Role-Based Access

### Admin Dashboard
- URL: `/admin`
- Access: Only admin role
- Features: Manage products, orders, users

### Supplier Dashboard
- URL: `/supplier`
- Access: Only supplier role
- Features: Add products, view sales, manage inventory

### User Profile
- URL: `/profile`
- Access: All logged-in users
- Features: View orders, manage addresses

---

## Troubleshooting

### 406 Error Still Coming?
1. Check browser console for exact error
2. Verify migrations ran successfully
3. Clear cache completely
4. Check Network tab headers:
   - Should have: `Accept: application/json`
   - Should NOT have: `Content-Type` on GET requests

### User Can't Login?
1. Check email confirmation is OFF
2. Verify user exists in auth.users table
3. Check user_roles table has entry

### Role Not Working?
```sql
-- Check user role
SELECT * FROM user_roles WHERE user_id = 'USER_ID';

-- Add role manually if missing
INSERT INTO user_roles (user_id, role) 
VALUES ('USER_ID', 'supplier');
```

---

## Files Changed

1. ✅ `client.ts` - Fixed 406 error
2. ✅ `AuthContext.tsx` - Added supplier role support
3. ✅ `types/index.ts` - Added supplier types
4. ✅ `App.tsx` - Added supplier routes
5. ✅ `SupplierDashboard.tsx` - New supplier page
6. ✅ `ProtectedRoute.tsx` - Role-based protection
7. ✅ Migrations - Database schema updates

---

## Next Steps

1. Run migrations ✅
2. Clear cache ✅
3. Restart server ✅
4. Test signup with different roles ✅
5. Verify dashboard access ✅

Koi problem ho toh batao! 🚀
