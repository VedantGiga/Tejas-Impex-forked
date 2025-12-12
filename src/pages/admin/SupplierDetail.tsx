import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock, Mail, Phone, Building, ArrowLeft, MapPin, FileText, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface SupplierDetail {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  business_name: string;
  business_address: string;
  gst_number: string;
  approval_status: string;
  is_verified: boolean;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  currency: string;
  stock_quantity: number;
  weight: string;
  discount_percent: number;
  description: string;
  approval_status: string;
  is_active: boolean;
  created_at: string;
  category?: { name: string };
  brand?: { name: string };
  product_images?: { image_url: string }[];
}

export default function SupplierDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<SupplierDetail | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState<{ [key: string]: number }>({});
  const { toast } = useToast();

  useEffect(() => {
    loadSupplierDetail();
    loadSupplierProducts();
  }, [id]);

  const loadSupplierDetail = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      navigate('/admin/suppliers');
    } else {
      setSupplier(data as SupplierDetail);
    }
    setLoading(false);
  };

  const loadSupplierProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(name),
        brand:brands(name),
        product_images(image_url)
      `)
      .eq('supplier_id', id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data as Product[]);
    }
  };

  const handleApproval = async (status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('profiles')
      .update({ approval_status: status, is_verified: status === 'approved' })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ 
        title: 'Success', 
        description: `Supplier ${status === 'approved' ? 'approved' : 'rejected'} successfully` 
      });
      loadSupplierDetail();
    }
  };

  const handleProductApproval = async (productId: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('products')
      .update({ approval_status: status })
      .eq('id', productId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ 
        title: 'Success', 
        description: `Product ${status === 'approved' ? 'approved' : 'rejected'} successfully` 
      });
      loadSupplierProducts();
    }
  };

  const handleStockUpdate = async (productId: string, currentStock: number) => {
    const newStock = editingStock[productId];
    
    if (newStock === undefined || newStock > currentStock) {
      toast({ 
        title: 'Error', 
        description: 'You can only decrease stock quantity', 
        variant: 'destructive' 
      });
      return;
    }

    if (newStock < 0) {
      toast({ 
        title: 'Error', 
        description: 'Stock cannot be negative', 
        variant: 'destructive' 
      });
      return;
    }

    const { error } = await supabase
      .from('products')
      .update({ stock_quantity: newStock })
      .eq('id', productId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Stock updated successfully' });
      setEditingStock(prev => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      loadSupplierProducts();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800"><Check className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800"><X className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">Loading...</div>
      </Layout>
    );
  }

  if (!supplier) {
    return (
      <Layout>
        <div className="container py-8">Supplier not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-full px-8">
        <Button variant="ghost" onClick={() => navigate('/admin/suppliers')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Suppliers
        </Button>

        <div className="bg-card rounded-lg border p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">{supplier.full_name}</h1>
              <p className="text-sm text-muted-foreground">
                Supplier ID: {supplier.id}
              </p>
              <p className="text-sm text-muted-foreground">
                Registered: {new Date(supplier.created_at).toLocaleDateString()}
              </p>
            </div>
            {getStatusBadge(supplier.approval_status)}
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{supplier.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{supplier.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Business Information</h2>
              <div className="grid gap-4">
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Business Name</p>
                    <p className="font-medium">{supplier.business_name || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">GST Number</p>
                    <p className="font-medium">{supplier.gst_number || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">Business Address</p>
                    <p className="font-medium">{supplier.business_address || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {supplier.approval_status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={() => handleApproval('approved')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve Supplier
                </Button>
                <Button 
                  onClick={() => handleApproval('rejected')}
                  variant="destructive"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject Supplier
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-lg border p-8 mt-6">
          <div className="flex items-center gap-2 mb-6">
            <Package className="h-6 w-6" />
            <h2 className="text-2xl font-semibold">Products ({products.length})</h2>
          </div>

          {products.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No products found</p>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    {product.product_images?.[0] && (
                      <img 
                        src={product.product_images[0].image_url} 
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">SKU: {product.sku || 'N/A'}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground text-xs">Category</p>
                      <p className="font-medium">{product.category?.name || 'N/A'}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground text-xs">Brand</p>
                      <p className="font-medium">{product.brand?.name || 'N/A'}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground text-xs">Price</p>
                      <p className="font-medium">{product.currency} {product.price}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground text-xs">Stock</p>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          className="w-16 px-1 py-1 border rounded text-sm"
                          value={editingStock[product.id] ?? product.stock_quantity}
                          onChange={(e) => setEditingStock(prev => ({
                            ...prev,
                            [product.id]: parseInt(e.target.value) || 0
                          }))}
                          max={product.stock_quantity}
                        />
                        {editingStock[product.id] !== undefined && editingStock[product.id] !== product.stock_quantity && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-7 px-2"
                            onClick={() => handleStockUpdate(product.id, product.stock_quantity)}
                          >
                            Save
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground text-xs">Weight</p>
                      <p className="font-medium">{product.weight || 'N/A'}</p>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground text-xs">Discount</p>
                      <p className="font-medium">{product.discount_percent}%</p>
                    </div>
                    <div>
                      {getStatusBadge(product.approval_status)}
                    </div>
                    {product.approval_status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => handleProductApproval(product.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700 h-8"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleProductApproval(product.id, 'rejected')}
                          variant="destructive"
                          className="h-8"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
