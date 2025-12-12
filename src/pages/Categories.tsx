import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('display_order');
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-display text-4xl font-bold mb-6">Categories</h1>
        {loading ? (
          <div className="text-center py-8">Loading categories...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No categories available</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="group p-8 bg-card rounded-lg border hover:border-primary hover:shadow-lg transition-all"
              >
                <div className="w-16 h-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <span className="text-3xl">🍽️</span>
                </div>
                <h3 className="font-semibold text-xl mb-2 group-hover:text-primary transition-colors">{cat.name}</h3>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
