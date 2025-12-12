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

interface Category {
  id: string;
  name: string;
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

export default function CategoryDetail() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { isSupplier } = useAuth();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchCategoryAndProducts();
    }
  }, [slug]);

  const fetchCategoryAndProducts = async () => {
    try {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (categoryData) {
        setCategory(categoryData);

        const { data: productsData } = await supabase
          .from('products')
          .select('id, name, slug, price, discount_percent, stock_quantity, currency, product_images(image_url)')
          .eq('category_id', categoryData.id)
          .eq('is_active', true)
          .eq('approval_status', 'approved')
          .order('created_at', { ascending: false });

        setProducts(productsData || []);
      }
    } catch (error) {
      console.error('Error fetching category:', error);
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

  if (!category) {
    return <Layout><div className="container py-8">Category not found</div></Layout>;
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold mb-2">{category.name}</h1>
          <p className="text-muted-foreground">{products.length} products available</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <p className="text-muted-foreground">No products available in this category yet</p>
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
    </Layout>
  );
}
