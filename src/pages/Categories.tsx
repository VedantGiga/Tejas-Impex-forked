import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';

const categories = [
  { name: 'Gourmet Food', slug: 'gourmet-food', count: 45 },
  { name: 'Snacks', slug: 'snacks', count: 32 },
  { name: 'Beverages', slug: 'beverages', count: 28 },
  { name: 'Bakery', slug: 'bakery', count: 19 },
  { name: 'Dairy', slug: 'dairy', count: 15 },
  { name: 'Condiments', slug: 'condiments', count: 22 },
];

export default function Categories() {
  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-display text-4xl font-bold mb-6">Categories</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/products?category=${cat.slug}`}
              className="group p-8 bg-card rounded-lg border hover:border-primary hover:shadow-lg transition-all"
            >
              <div className="w-16 h-16 mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <span className="text-3xl">🍽️</span>
              </div>
              <h3 className="font-semibold text-xl mb-2 group-hover:text-primary transition-colors">{cat.name}</h3>
              <p className="text-muted-foreground">{cat.count} products</p>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
