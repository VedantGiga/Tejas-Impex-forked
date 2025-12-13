# Finance Role Setup - Hindi Guide

## Kya Changes Hue Hain?

### 1. Database Changes
- **Finance role** add ho gaya hai (4th role)
- Products table mein naye columns:
  - `supplier_price` - Supplier ka original price
  - `finance_price` - Finance ka final price
  - `finance_status` - Finance approval status
  - `finance_approved_at` - Kab approve hua
  - `finance_approved_by` - Kisne approve kiya

### 2. Product Flow (Naya Workflow)

#### Pehle (Old):
```
Supplier → Product Add → Admin Approve → Live ✅
```

#### Ab (New):
```
Supplier → Product Add (₹1000)
    ↓
Admin → Approve & Send to Finance
    ↓
Finance → Price Set (₹1200) → Approve
    ↓
Live ✅ (Customer ko ₹1200 mein dikhega)
```

## Setup Kaise Karein?

### Step 1: Database Migration Run Karein
```sql
-- Supabase SQL Editor mein ye file run karein:
-- File: APPLY_FINANCE_ROLE.sql
```

Ya manually migration file run karein:
```bash
# Terminal mein
cd supabase
supabase db push
```

### Step 2: Finance User Banayein

#### Option A: Signup Page Se
1. Browser mein jao: `http://localhost:5173/signup`
2. Details bharein:
   - Full Name: "Finance Team"
   - Email: "finance@yourcompany.com"
   - Phone: "1234567890"
   - Password: "secure_password"
   - **Account Type: Finance** ✅ (Yeh select karein)
3. Sign Up karein

#### Option B: Direct SQL Se
```sql
-- Pehle Supabase Auth UI se user banao
-- Fir role assign karo:
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_UUID_YAHAN_DALEIN', 'finance');
```

### Step 3: Test Karein

#### Complete Testing Flow:

**1. Supplier Login**
- URL: `/login`
- Email: supplier ka email
- Product add karo price ₹1000 se

**2. Admin Login**
- URL: `/admin-access`
- Product Approvals mein jao
- Product ko "Send to Finance" karo
- Stock quantity set kar sakte ho

**3. Finance Login**
- URL: `/finance-login`
- Email: finance@yourcompany.com
- Dashboard khulega automatically

**4. Finance Dashboard**
- Pending products dikhenge
- Supplier price: ₹1000
- Aap price set karo: ₹1200 (ya koi bhi)
- Margin automatically calculate hoga: +20%
- "Approve & Set Price" button dabao

**5. Customer View**
- Product ab live hai
- Price: ₹1200 (finance ka price)

## Finance Dashboard Features

### Main Features:
1. **Pending Products List**
   - Sirf wo products jo admin ne approve kiye
   - Supplier details visible
   - Original supplier price visible

2. **Price Management**
   - Supplier price dekh sakte ho
   - Apna price set kar sakte ho
   - Real-time margin calculation
   - Increase ya decrease kar sakte ho

3. **Statistics**
   - Total pending products
   - Approved today count
   - Revenue tracking

### Price Setting Example:
```
Supplier Price: ₹1000
Finance Options:
  - ₹1200 → +20% margin ✅
  - ₹900  → -10% margin ⚠️
  - ₹1500 → +50% margin 💰
```

## URLs Reference

### Admin
- Login: `http://localhost:5173/admin-access`
- Dashboard: `http://localhost:5173/admin`
- Approvals: `http://localhost:5173/admin/product-approvals`

### Finance
- Login: `http://localhost:5173/finance-login`
- Dashboard: `http://localhost:5173/finance`

### Supplier
- Login: `http://localhost:5173/login`
- Dashboard: `http://localhost:5173/supplier`

## Product Status Samjhein

### Status Types:

1. **pending**
   - Supplier ne add kiya
   - Admin review pending
   - Customer ko nahi dikhta

2. **finance_pending**
   - Admin ne approve kar diya
   - Finance review pending
   - Customer ko nahi dikhta

3. **approved**
   - Finance ne approve kar diya
   - Price set ho gaya
   - Customer ko dikhta hai ✅

4. **rejected**
   - Admin ya Finance ne reject kar diya
   - Customer ko nahi dikhta

## Common Issues & Solutions

### Issue 1: Finance dashboard khali hai
**Solution:**
- Check karo admin ne products approve kiye ya nahi
- Database mein dekho: `approval_status = 'finance_pending'`
- Finance user ka role check karo

### Issue 2: Products customer ko nahi dikh rahe
**Solution:**
```sql
-- Ye check karo:
SELECT id, name, approval_status, finance_status, is_active
FROM products
WHERE id = 'PRODUCT_ID';

-- Chahiye:
-- approval_status = 'approved'
-- finance_status = 'approved'
-- is_active = true
```

### Issue 3: Finance price update nahi ho raha
**Solution:**
- User role verify karo: `SELECT role FROM user_roles WHERE user_id = 'USER_ID'`
- Product status check karo: `finance_pending` hona chahiye
- RLS policies check karo

## Database Queries (Helpful)

### Finance user banane ke liye:
```sql
-- User ID nikalo
SELECT id, email FROM auth.users WHERE email = 'finance@company.com';

-- Role assign karo
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_YAHAN', 'finance');
```

### Pending products dekhne ke liye:
```sql
SELECT * FROM finance_pending_products;
```

### Product status update karne ke liye (manual):
```sql
-- Admin approval
UPDATE products 
SET approval_status = 'finance_pending',
    supplier_price = price
WHERE id = 'PRODUCT_ID';

-- Finance approval
UPDATE products 
SET finance_price = 1200,
    price = 1200,
    finance_status = 'approved',
    approval_status = 'approved'
WHERE id = 'PRODUCT_ID';
```

## Security Features

### Finance User Sirf:
- Finance pending products dekh sakta hai
- Sirf price update kar sakta hai
- Approved products edit nahi kar sakta

### Admin User:
- Sab products dekh sakta hai
- Approve/reject kar sakta hai
- Price set nahi kar sakta (ab finance ka kaam hai)

### Supplier User:
- Sirf apne products dekh sakta hai
- Sirf pending products edit kar sakta hai
- Approved products edit nahi kar sakta

## Important Notes

1. **Ek hi email se different roles nahi ho sakte**
   - Admin: admin@company.com
   - Finance: finance@company.com
   - Alag alag emails chahiye

2. **Price flow:**
   - Supplier → `price` column (original)
   - Admin approve → `supplier_price` mein save
   - Finance set → `finance_price` aur `price` dono update

3. **Customer ko sirf approved products dikhte hain:**
   - `approval_status = 'approved'`
   - `finance_status = 'approved'`
   - `is_active = true`

## Testing Checklist

- [ ] Migration run ho gaya
- [ ] Finance user ban gaya
- [ ] Finance login ho raha hai
- [ ] Finance dashboard khul raha hai
- [ ] Supplier product add kar paya
- [ ] Admin product approve kar paya
- [ ] Finance dashboard mein product dikh raha hai
- [ ] Finance price set kar paya
- [ ] Product customer ko dikh raha hai
- [ ] Price sahi dikh raha hai (finance ka price)

## Support

Agar koi problem ho to:
1. Browser console check karo (F12)
2. Supabase logs dekho
3. Database queries run karke verify karo
4. RLS policies check karo

## Summary

**Kya achieve hua:**
✅ Finance role add ho gaya
✅ Separate finance login aur dashboard
✅ Admin se finance ko product flow
✅ Finance price management
✅ Real-time margin calculation
✅ Complete workflow implementation

**Next Steps:**
1. `APPLY_FINANCE_ROLE.sql` run karo
2. Finance user banao
3. Complete flow test karo
4. Production mein deploy karo

Bas! Finance role setup complete! 🎉
