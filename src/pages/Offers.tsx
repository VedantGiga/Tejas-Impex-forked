import { Layout } from '@/components/layout/Layout';
import { Badge } from '@/components/ui/badge';

const offers = [
  { title: 'Summer Sale', discount: '30% OFF', desc: 'On all beverages', code: 'SUMMER30' },
  { title: 'New Customer', discount: '₹200 OFF', desc: 'On orders above ₹1999', code: 'NEW200' },
  { title: 'Premium Brands', discount: '25% OFF', desc: 'Selected premium brands', code: 'PREMIUM25' },
  { title: 'Free Shipping', discount: 'FREE', desc: 'On orders above ₹999', code: 'FREESHIP' },
];

export default function Offers() {
  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-display text-4xl font-bold mb-6">Special Offers</h1>
        <div className="grid md:grid-cols-2 gap-6">
          {offers.map((offer) => (
            <div key={offer.code} className="gradient-primary rounded-lg p-6 text-primary-foreground">
              <Badge className="mb-3 bg-accent text-accent-foreground">{offer.discount}</Badge>
              <h3 className="font-bold text-2xl mb-2">{offer.title}</h3>
              <p className="mb-4 opacity-90">{offer.desc}</p>
              <div className="flex items-center gap-2">
                <code className="px-3 py-1 bg-background/20 rounded text-sm font-mono">{offer.code}</code>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
