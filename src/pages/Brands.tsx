import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, MapPin } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  short_description: string | null;
}

export default function Brands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const { data } = await supabase
        .from('brands')
        .select('id, name, slug, country, short_description')
        .eq('is_active', true)
        .order('name');
      setBrands(data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12">
        <div className="container">
          <div className="text-center mb-12">
            <h1 className="font-display text-5xl font-bold mb-4">Premium Brands</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover authentic international brands bringing world-class quality to your doorstep
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">Loading brands...</div>
          ) : brands.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No brands available</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  to={`/brands/${brand.slug}`}
                  className="group relative bg-card rounded-xl border-2 border-border hover:border-primary overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative p-6">
                    <div className="h-32 flex items-center justify-center mb-6 bg-gradient-to-br from-secondary to-secondary/50 rounded-lg">
                      <span className="font-display text-3xl font-bold text-primary group-hover:scale-110 transition-transform">
                        {brand.name}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="font-display text-xl font-bold group-hover:text-primary transition-colors">
                        {brand.name}
                      </h3>
                      
                      {brand.country && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{brand.country}</span>
                        </div>
                      )}
                      
                      {brand.short_description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {brand.short_description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 text-primary font-medium text-sm pt-2">
                        <span>Explore Products</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
