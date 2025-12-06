import { Layout } from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';

export default function NewArrivals() {
  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-display text-4xl font-bold mb-6">New Arrivals</h1>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-card rounded-lg border p-4 hover:shadow-lg transition-shadow">
              <Badge className="mb-2 bg-accent text-accent-foreground">NEW</Badge>
              <div className="aspect-square bg-secondary rounded-md mb-4" />
              <h3 className="font-semibold mb-2">New Product {i}</h3>
              <p className="text-muted-foreground text-sm mb-3">Just arrived from abroad</p>
              <p className="font-bold text-primary">₹{1299 + i * 150}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
