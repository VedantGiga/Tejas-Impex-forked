import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Check, X, Radio } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function NewOrders() {
  const { user, isSupplier } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupplier || !user) {
      navigate('/login');
      return;
    }
    loadOrders();

    const ordersChannel = supabase
      .channel('new-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => loadOrders())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => loadOrders())
      .subscribe();

    return () => { supabase.removeChannel(ordersChannel); };
  }, [isSupplier, user, navigate]);

  const loadOrders = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    
    try {
      const { data: supplierProducts, error: productsError } = await supabase
        .from('products')
        .select('id')
        .eq('supplier_id', user.id);

      if (productsError) {
        console.error('Error loading products:', productsError);
        setOrders([]);
        setLoading(false);
        return;
      }

      if (!supplierProducts || supplierProducts.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const productIds = supplierProducts.map(p => p.id);

      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*, order:orders!inner(*), product:products(*)')
        .in('product_id', productIds)
        .eq('supplier_status', 'pending')
        .order('created_at', { ascending: false });

      if (itemsError) {
        console.error('Error loading order items:', itemsError);
        setOrders([]);
        setLoading(false);
        return;
      }

      if (orderItems && orderItems.length > 0) {
        const userIds = [...new Set(orderItems.map((item: any) => item.order.user_id))];
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone')
          .in('id', userIds);
        
        if (usersError) {
          console.error('Error loading users:', usersError);
        }

        const userMap = new Map(users?.map(u => [u.id, u]) || []);
        orderItems.forEach((item: any) => {
          item.order.user = userMap.get(item.order.user_id);
        });

        const groupedOrders = orderItems.reduce((acc: any, item: any) => {
          const orderId = item.order.id;
          if (!acc[orderId]) {
            acc[orderId] = { ...item.order, items: [] };
          }
          acc[orderId].items.push(item);
          return acc;
        }, {});

        setOrders(Object.values(groupedOrders));
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error in loadOrders:', error);
      setOrders([]);
    }
    
    setLoading(false);
  };

  const handleOrderItemStatus = async (itemId: string, status: 'accepted' | 'rejected') => {
    const { error } = await supabase
      .from('order_items')
      .update({ supplier_status: status })
      .eq('id', itemId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Order item ${status}` });
      loadOrders();
    }
  };

  if (loading) return <Layout><div className="container py-8">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="container py-8">
        <Button variant="ghost" onClick={() => navigate('/supplier')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <h1 className="font-display text-3xl font-bold">New Orders</h1>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            <Radio className="h-3 w-3 animate-pulse" />
            <span>Live</span>
          </div>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg p-6 bg-card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                    {order.user && (
                      <div className="mt-2 text-sm">
                        <p className="font-medium">{order.user.full_name}</p>
                        <p className="text-muted-foreground">{order.user.email}</p>
                        {order.user.phone && <p className="text-muted-foreground">{order.user.phone}</p>}
                      </div>
                    )}
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {order.order_status}
                  </span>
                </div>

                <div className="space-y-3">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex gap-4 p-3 bg-muted/50 rounded">
                      <Package className="h-10 w-10 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">{item.product_snapshot.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <p className="font-semibold">₹{(item.quantity * item.price).toFixed(2)}</p>
                        <div className="flex gap-1">
                          <Button size="sm" variant="default" onClick={() => handleOrderItemStatus(item.id, 'accepted')}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleOrderItemStatus(item.id, 'rejected')}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No new orders</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
