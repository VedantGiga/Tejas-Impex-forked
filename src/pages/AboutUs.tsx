import { Layout } from '@/components/layout/Layout';
import { Globe, Users, Award, TrendingUp } from 'lucide-react';

export default function AboutUs() {
  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-display text-4xl font-bold mb-6">About Us</h1>
        
        <div className="prose max-w-none mb-12">
          <p className="text-lg text-muted-foreground">
            TejasImpex is India's premier destination for authentic imported gourmet products. 
            We bring the world's finest brands and flavors directly to your doorstep, making 
            international culinary experiences accessible to everyone.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-muted-foreground">
              To connect Indian consumers with premium international products while supporting 
              global suppliers through a trusted, transparent marketplace platform.
            </p>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-2xl font-semibold mb-4">Our Vision</h2>
            <p className="text-muted-foreground">
              To become India's most trusted platform for imported gourmet products, known for 
              authenticity, quality, and exceptional customer service.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="text-center p-6">
            <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
              <Globe className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Global Reach</h3>
            <p className="text-muted-foreground text-sm">
              Partnering with suppliers from over 20 countries worldwide
            </p>
          </div>
          <div className="text-center p-6">
            <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Trusted Community</h3>
            <p className="text-muted-foreground text-sm">
              Thousands of satisfied customers across India
            </p>
          </div>
          <div className="text-center p-6">
            <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">100% Authentic</h3>
            <p className="text-muted-foreground text-sm">
              Every product verified for authenticity and quality
            </p>
          </div>
          <div className="text-center p-6">
            <div className="inline-flex p-3 rounded-full bg-primary/10 mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Growing Fast</h3>
            <p className="text-muted-foreground text-sm">
              Expanding our catalog with new brands every month
            </p>
          </div>
        </div>

        <div className="bg-secondary/50 rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Why Choose TejasImpex?</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>Curated selection of premium international brands</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>Direct partnerships with verified global suppliers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>Secure payment processing and data protection</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>Fast and reliable delivery across India</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>Dedicated customer support team</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
