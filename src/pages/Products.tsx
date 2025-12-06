import { Layout } from '@/components/layout/Layout';

export default function Products() {
  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-display text-4xl font-bold mb-6">Products</h1>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-card rounded-lg border p-4 hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-secondary rounded-md mb-4" />
              <h3 className="font-semibold mb-2">Product {i}</h3>
              <p className="text-muted-foreground text-sm mb-3">Premium imported product</p>
              <p className="font-bold text-primary">₹{999 + i * 100}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
