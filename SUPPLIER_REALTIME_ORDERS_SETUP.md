# Supplier Real-Time Orders Setup

## What's Implemented

Suppliers now receive real-time order notifications with complete customer details when users order their products.

## Features

1. **Real-Time Updates**: Orders appear instantly without page refresh
2. **Customer Details**: Suppliers can see customer name, email, and phone
3. **Live Indicator**: Green "Live" badge shows real-time connection status
4. **Order Management**: Accept/reject individual order items
5. **Auto-Refresh**: Orders update automatically when status changes

## Database Migration

Run this migration to enable suppliers to view customer details:

```bash
# Apply the migration
supabase db push
```

Or manually run the SQL:

```sql
-- Allow suppliers to view customer details for orders containing their products
CREATE POLICY "Suppliers can view customer details for their orders" ON public.profiles
  FOR SELECT USING (
    public.has_role(auth.uid(), 'supplier') AND
    EXISTS (
      SELECT 1 FROM public.orders o
      JOIN public.order_items oi ON o.id = oi.order_id
      JOIN public.products p ON oi.product_id = p.id
      WHERE o.user_id = profiles.id AND p.supplier_id = auth.uid()
    )
  );
```

## How It Works

1. **Real-Time Subscription**: Listens to both `orders` and `order_items` tables
2. **Automatic Updates**: When a user places an order, supplier sees it immediately
3. **Filtered Data**: Suppliers only see orders containing their products
4. **Customer Info**: Full customer details displayed for each order

## Testing

1. Login as a supplier
2. Go to "My Orders" page
3. Notice the green "Live" indicator
4. Have a customer order one of your products
5. Order appears instantly on the supplier's page
6. Customer details (name, email, phone) are visible
7. Accept or reject order items as needed

## What Suppliers See

For each order:
- Order ID and date
- Customer name, email, and phone number
- Product details and quantities
- Order status (placed, confirmed, shipped, etc.)
- Item status (pending, accepted, rejected)
- Accept/Reject buttons for pending items
- Total order amount
