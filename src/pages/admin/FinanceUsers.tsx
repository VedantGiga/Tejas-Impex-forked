import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Plus, Mail, Phone, Calendar } from 'lucide-react';

interface FinanceUser {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
}

export default function FinanceUsers() {
  const { isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [financeUsers, setFinanceUsers] = useState<FinanceUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/');
    } else {
      loadFinanceUsers();
    }
  }, [isAdmin, isLoading, navigate]);

  const loadFinanceUsers = async () => {
    setLoading(true);
    
    // Get finance user IDs
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'finance');

    if (roleError) {
      toast({ title: 'Error', description: 'Failed to load finance users', variant: 'destructive' });
      setLoading(false);
      return;
    }

    if (!roleData || roleData.length === 0) {
      setFinanceUsers([]);
      setLoading(false);
      return;
    }

    // Get profiles for those user IDs
    const userIds = roleData.map(r => r.user_id);
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, created_at')
      .in('id', userIds);

    if (profileError) {
      toast({ title: 'Error', description: 'Failed to load user profiles', variant: 'destructive' });
    } else {
      setFinanceUsers(profileData || []);
    }
    
    setLoading(false);
  };

  if (isLoading || loading) return <Layout><div className="container py-8">Loading...</div></Layout>;
  if (!isAdmin) return null;

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-primary" />
            <h1 className="font-display text-4xl font-bold">Finance Team</h1>
          </div>
          <Button onClick={() => navigate('/admin/create-finance')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Finance User
          </Button>
        </div>

        {financeUsers.length === 0 ? (
          <div className="bg-card rounded-lg border p-12 text-center">
            <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Finance Users</h3>
            <p className="text-muted-foreground mb-6">Create your first finance team member</p>
            <Button onClick={() => navigate('/admin/create-finance')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Finance Account
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {financeUsers.map((user) => (
              <div key={user.id} className="bg-card rounded-lg border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-3">{user.full_name}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{user.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    Finance
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
