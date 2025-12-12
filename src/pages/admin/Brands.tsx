import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Brand {
  id: string;
  name: string;
  slug: string;
  country: string | null;
  short_description: string | null;
  is_featured: boolean;
  is_active: boolean;
}

export default function AdminBrands() {
  const { isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    short_description: '',
    is_featured: false,
  });

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchBrands();
    }
  }, [isAdmin]);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBrands(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = formData.name.toLowerCase().replace(/\s+/g, '-');
      
      if (editingBrand) {
        const { error } = await supabase
          .from('brands')
          .update({ ...formData, slug })
          .eq('id', editingBrand.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Brand updated successfully' });
      } else {
        const { error } = await supabase
          .from('brands')
          .insert([{ ...formData, slug, is_active: true }]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Brand added successfully' });
      }

      setShowForm(false);
      setEditingBrand(null);
      setFormData({ name: '', country: '', short_description: '', is_featured: false });
      fetchBrands();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      country: brand.country || '',
      short_description: brand.short_description || '',
      is_featured: brand.is_featured,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;
    try {
      const { error } = await supabase.from('brands').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Brand deleted successfully' });
      fetchBrands();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const toggleActive = async (brand: Brand) => {
    try {
      const { error } = await supabase
        .from('brands')
        .update({ is_active: !brand.is_active })
        .eq('id', brand.id);
      if (error) throw error;
      toast({ title: 'Success', description: `Brand ${!brand.is_active ? 'activated' : 'deactivated'}` });
      fetchBrands();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  if (isLoading || loading) return <Layout><div className="container py-8">Loading...</div></Layout>;
  if (!isAdmin) return null;

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-display text-4xl font-bold">Manage Brands</h1>
          <Button onClick={() => { setShowForm(true); setEditingBrand(null); setFormData({ name: '', country: '', short_description: '', is_featured: false }); }}>
            <Plus className="h-4 w-4 mr-2" /> Add Brand
          </Button>
        </div>

        {showForm && (
          <div className="bg-card rounded-lg border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{editingBrand ? 'Edit Brand' : 'Add New Brand'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                />
                <label htmlFor="featured" className="text-sm font-medium">Featured Brand</label>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingBrand(null); }}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-card rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Country</th>
                <th className="text-left p-4">Description</th>
                <th className="text-center p-4">Featured</th>
                <th className="text-center p-4">Status</th>
                <th className="text-center p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr key={brand.id} className="border-t">
                  <td className="p-4 font-semibold">{brand.name}</td>
                  <td className="p-4">{brand.country || '-'}</td>
                  <td className="p-4 text-sm text-muted-foreground">{brand.short_description || '-'}</td>
                  <td className="p-4 text-center">{brand.is_featured ? '⭐' : '-'}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggleActive(brand)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${brand.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {brand.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(brand)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(brand.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
