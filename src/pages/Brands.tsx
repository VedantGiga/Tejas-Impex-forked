import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';

const brands = [
  { name: 'Lindt', country: 'Switzerland', desc: 'Premium Swiss chocolate' },
  { name: 'Ferrero', country: 'Italy', desc: 'Iconic Italian confectionery' },
  { name: 'Godiva', country: 'Belgium', desc: 'Luxury Belgian chocolates' },
  { name: 'Kelloggs', country: 'USA', desc: 'Breakfast cereals & snacks' },
  { name: 'Nestlé', country: 'Switzerland', desc: 'Global food & beverage' },
  { name: 'Cadbury', country: 'UK', desc: 'British chocolate brand' },
];

export default function Brands() {
  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-display text-4xl font-bold mb-6">Brands</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand) => (
            <Link
              key={brand.name}
              to={`/brands/${brand.name.toLowerCase()}`}
              className="group p-6 bg-card rounded-lg border hover:border-primary hover:shadow-lg transition-all"
            >
              <div className="h-20 flex items-center justify-center mb-4 bg-secondary rounded-md">
                <span className="font-display text-2xl font-bold text-primary">{brand.name}</span>
              </div>
              <h3 className="font-semibold group-hover:text-primary transition-colors">{brand.name}</h3>
              <p className="text-sm text-muted-foreground">{brand.country}</p>
              <p className="text-sm text-muted-foreground mt-1">{brand.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
