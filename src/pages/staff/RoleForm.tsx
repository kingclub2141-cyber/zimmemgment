import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  CheckCircle2,
  Circle,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

const PERMISSION_GROUPS = [
  {
    module: 'Dashboard',
    permissions: ['dashboard.view', 'dashboard.edit']
  },
  {
    module: 'Members',
    permissions: ['members.view', 'members.add', 'members.edit', 'members.delete', 'members.block']
  },
  {
    module: 'Plans',
    permissions: ['plans.view', 'plans.add', 'plans.edit', 'plans.delete', 'plans.assign']
  },
  {
    module: 'Payments',
    permissions: ['payments.view', 'payments.add', 'payments.delete', 'payments.export']
  },
  {
    module: 'Attendance',
    permissions: ['attendance.view', 'attendance.punch_in', 'attendance.punch_out', 'attendance.report']
  },
  {
    module: 'Expenses',
    permissions: ['expenses.view', 'expenses.add', 'expenses.edit', 'expenses.delete']
  },
  {
    module: 'Trainers',
    permissions: ['trainers.view', 'trainers.add', 'trainers.edit', 'trainers.delete', 'trainers.assign']
  },
  {
    module: 'Services',
    permissions: ['services.view', 'services.add', 'services.edit', 'services.delete', 'services.assign']
  },
  {
    module: 'POS',
    permissions: ['pos.view', 'pos.create_orders', 'pos.manage_products', 'pos.manage_categories']
  },
  {
    module: 'Staff',
    permissions: ['staff.view', 'staff.add', 'staff.edit', 'staff.delete']
  },
  {
    module: 'Reports',
    permissions: ['reports.view', 'reports.export']
  },
  {
    module: 'Settings',
    permissions: ['settings.view', 'settings.edit']
  },
  {
    module: 'Leads',
    permissions: ['leads.view', 'leads.add', 'leads.edit', 'leads.convert']
  },
  {
    module: 'Diet',
    permissions: ['diet.view', 'diet.edit']
  },
  {
    module: 'Notifications',
    permissions: ['notifications.view', 'notifications.send']
  }
];

export default function RoleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { gym } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(id ? true : false);
  
  const [formData, setFormData] = useState({
    name: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    if (id && gym) fetchRole();
  }, [id, gym]);

  const fetchRole = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setFormData({
        name: data.name,
        permissions: data.permissions || []
      });
    } catch (error: any) {
      toast.error(error.message);
      navigate('/roles');
    } finally {
      setFetching(false);
    }
  };

  const togglePermission = (perm: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  const selectAll = () => {
    const all = PERMISSION_GROUPS.flatMap(g => g.permissions);
    setFormData(prev => ({ ...prev, permissions: all }));
  };

  const unselectAll = () => {
    setFormData(prev => ({ ...prev, permissions: [] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym) return;

    try {
      setLoading(true);
      const data = {
        gym_id: gym.id,
        name: formData.name,
        permissions: formData.permissions
      };

      if (id) {
        const { error } = await supabase
          .from('roles')
          .update(data)
          .eq('id', id);
        if (error) throw error;
        toast.success('Role updated');
      } else {
        const { error } = await supabase
          .from('roles')
          .insert([data]);
        if (error) throw error;
        toast.success('Role created');
      }
      navigate('/roles');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/roles')} className="p-3 border-4 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">{id ? 'Edit Role' : 'Create Role'}</h1>
          <p className="text-xs font-black uppercase tracking-widest opacity-40">Define Access Boundaries</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest">Role Name</label>
            <input 
              required
              type="text"
              value={formData.name}
              onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. MANAGER, MANAGER_OPS, FRONT_DESK" 
              className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-black uppercase outline-none focus:bg-white"
            />
          </div>
        </div>

        <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
          <div className="p-6 border-b-4 border-[#141414] flex flex-col md:flex-row justify-between items-center gap-4 bg-[#f5f5f5]">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck size={20} /> Module Permissions
            </h3>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={selectAll}
                className="px-4 py-2 border-2 border-[#141414] font-black uppercase text-[10px] hover:bg-[#141414] hover:text-white transition-all"
              >
                Select All
              </button>
              <button 
                type="button" 
                onClick={unselectAll}
                className="px-4 py-2 border-2 border-[#141414] font-black uppercase text-[10px] hover:bg-white transition-all"
              >
                Unselect All
              </button>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.module} className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 border-b-2 border-[#f0f0f0] pb-2">
                  {group.module}
                </h4>
                <div className="space-y-2">
                  {group.permissions.map((perm) => {
                    const isSelected = formData.permissions.includes(perm);
                    return (
                      <button
                        key={perm}
                        type="button"
                        onClick={() => togglePermission(perm)}
                        className={`w-full flex items-center justify-between p-3 border-2 transition-all ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-600' 
                            : 'bg-white border-[#f0f0f0] hover:border-[#141414]'
                        }`}
                      >
                        <span className={`text-[10px] font-black uppercase ${isSelected ? 'text-blue-700' : 'text-[#141414]'}`}>
                          {perm.split('.')[1].replace('_', ' ')}
                        </span>
                        {isSelected ? (
                          <CheckCircle2 size={16} className="text-blue-600" />
                        ) : (
                          <Circle size={16} className="opacity-20" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-6 bg-[#141414] text-white border-4 border-[#141414] font-black uppercase tracking-[0.4em] text-sm hover:bg-white hover:text-[#141414] transition-all flex items-center justify-center gap-3 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] active:shadow-none translate-y-0 active:translate-y-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save System Role</>}
        </button>
      </form>
    </div>
  );
}
