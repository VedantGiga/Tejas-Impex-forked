import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactUs() {
  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-display text-4xl font-bold mb-6">Contact Us</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">support@tejasimpex.com</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-muted-foreground">+91 98765 43210</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-muted-foreground">Mumbai, Maharashtra, India</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-xl font-semibold mb-4">Send us a Message</h3>
            <form className="space-y-4">
              <input type="text" placeholder="Name" className="w-full px-4 py-2 rounded-md border bg-background" />
              <input type="email" placeholder="Email" className="w-full px-4 py-2 rounded-md border bg-background" />
              <textarea placeholder="Message" rows={4} className="w-full px-4 py-2 rounded-md border bg-background" />
              <Button type="submit" className="w-full">Send Message</Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
