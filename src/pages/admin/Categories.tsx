import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  is_active: boolean;
}

export default function AdminCategories() {
  const { isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    display_order: 0,
  });

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchCategories();
    }
  }, [isAdmin]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setCategories(data || []);
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
      
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update({ ...formData, slug })
          .eq('id', editingCategory.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Category updated successfully' });
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([{ ...formData, slug, is_active: true }]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Category added successfully' });
      }

      setShowForm(false);
      setEditingCategory(null);
      setFormData({ name: '', display_order: 0 });
      fetchCategories();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      display_order: category.display_order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Category deleted successfully' });
      fetchCategories();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const toggleActive = async (category: Category) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !category.is_active })
        .eq('id', category.id);
      if (error) throw error;
      toast({ title: 'Success', description: `Category ${!category.is_active ? 'activated' : 'deactivated'}` });
      fetchCategories();
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
          <h1 className="font-display text-4xl font-bold">Manage Categories</h1>
          <Button onClick={() => { setShowForm(true); setEditingCategory(null); setFormData({ name: '', display_order: 0 }); }}>
            <Plus className="h-4 w-4 mr-2" /> Add Category
          </Button>
        </div>

        {showForm && (
          <div className="bg-card rounded-lg border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Display Order</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingCategory(null); }}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-card rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left p-4">Name</th>
                <th className="text-center p-4">Display Order</th>
                <th className="text-center p-4">Status</th>
                <th className="text-center p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-t">
                  <td className="p-4 font-semibold">{category.name}</td>
                  <td className="p-4 text-center">{category.display_order}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggleActive(category)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${category.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {category.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(category.id)}>
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
