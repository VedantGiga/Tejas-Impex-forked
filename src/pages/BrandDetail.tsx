import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/currency';
import { ShoppingCart, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Brand {
  id: string;
  name: string;
  country: string | null;
  short_description: string | null;
  full_story: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  discount_percent: number;
  stock_quantity: number;
  currency: string;
  product_images: { image_url: string }[];
}

export default function BrandDetail() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { isSupplier } = useAuth();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchBrandAndProducts();
    }
  }, [slug]);

  const fetchBrandAndProducts = async () => {
    try {
      const { data: brandData } = await supabase
        .from('brands')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (brandData) {
        setBrand(brandData);

        const { data: productsData } = await supabase
          .from('products')
          .select('id, name, slug, price, discount_percent, stock_quantity, currency, product_images(image_url)')
          .eq('brand_id', brandData.id)
          .eq('is_active', true)
          .eq('approval_status', 'approved')
          .order('created_at', { ascending: false });

        setProducts(productsData || []);
      }
    } catch (error) {
      console.error('Error fetching brand:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product.id);
    toast({ title: 'Success', description: 'Product added to cart' });
  };

  if (loading) {
    return <Layout><div className="container py-8">Loading...</div></Layout>;
  }

  if (!brand) {
    return <Layout><div className="container py-8">Brand not found</div></Layout>;
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Brand Header */}
        <div className="bg-card rounded-lg border p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-20 w-20 flex items-center justify-center bg-secondary rounded-lg">
              <span className="font-display text-2xl font-bold text-primary">{brand.name}</span>
            </div>
            <div>
              <h1 className="font-display text-4xl font-bold">{brand.name}</h1>
              {brand.country && <p className="text-muted-foreground">{brand.country}</p>}
            </div>
          </div>
          {brand.short_description && (
            <p className="text-lg mb-2">{brand.short_description}</p>
          )}
          {brand.full_story && (
            <p className="text-muted-foreground">{brand.full_story}</p>
          )}
        </div>

        {/* Products */}
        <div>
          <h2 className="font-display text-2xl font-bold mb-6">
            Products from {brand.name} ({products.length})
          </h2>
          
          {products.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-lg border">
              <p className="text-muted-foreground">No products available from this brand yet</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => {
                const finalPrice = product.price * (1 - product.discount_percent / 100);
                const imageUrl = product.product_images?.[0]?.image_url || '/placeholder.svg';

                return (
                  <div key={product.id} className="group bg-card rounded-lg border overflow-hidden hover:shadow-lg transition-all">
                    <Link to={`/product/${product.id}`} className="block">
                      <div className="aspect-square overflow-hidden bg-secondary">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    </Link>
                    <div className="p-4">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-xl font-bold">
                          {formatCurrency(finalPrice, product.currency)}
                        </span>
                        {product.discount_percent > 0 && (
                          <>
                            <span className="text-sm text-muted-foreground line-through">
                              {formatCurrency(product.price, product.currency)}
                            </span>
                            <span className="text-xs font-semibold text-green-600">
                              {product.discount_percent}% OFF
                            </span>
                          </>
                        )}
                      </div>
                      {!isSupplier && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleAddToCart(product)}
                            disabled={product.stock_quantity === 0}
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            {product.stock_quantity === 0 ? 'Out of Stock' : 'Add'}
                          </Button>
                          <Button size="sm" variant="outline">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
