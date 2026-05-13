import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Loader2,
  Filter,
  User,
  Key,
  Mail,
  Phone,
  ShieldUser
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function StaffList() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (gym) {
      fetchData();
    }
  }, [gym]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staffRes, rolesRes] = await Promise.all([
        supabase
          .from('staff')
          .select('*, roles(name)')
          .eq('gym_id', gym.id)
          .order('name'),
        supabase
          .from('roles')
          .select('id, name')
          .eq('gym_id', gym.id)
      ]);

      if (staffRes.error) throw staffRes.error;
      setStaff(staffRes.data || []);
      setRoles(rolesRes.data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (staffId: string) => {
    if (!confirm('Are you sure? This action is irreversible.')) return;

    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', staffId);
      
      if (error) throw error;
      toast.success('Staff member removed');
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                         s.email.toLowerCase().includes(search.toLowerCase()) ||
                         s.phone.includes(search);
    const matchesRole = !roleFilter || s.role_id === roleFilter;
    const matchesStatus = !statusFilter || s.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Staff Directory</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Manage your workforce</p>
        </div>
        <Link 
          to="/staff/add" 
          className="flex items-center justify-center gap-3 bg-[#141414] text-white px-8 py-4 border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
        >
          <Plus size={18} /> Onboard Staff
        </Link>
      </div>

      <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
          <input 
            type="text" 
            placeholder="Search by Name, Email or Phone..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-12 pr-4 py-3 font-bold outline-none" 
          />
        </div>
        <select 
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="bg-[#f5f5f5] border-2 border-[#141414] px-4 py-3 font-bold outline-none"
        >
          <option value="">ALL ROLES</option>
          {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <select 
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#f5f5f5] border-2 border-[#141414] px-4 py-3 font-bold outline-none"
        >
          <option value="">ALL STATUS</option>
          <option value="Active">ACTIVE</option>
          <option value="Inactive">INACTIVE</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>
        ) : filteredStaff.length === 0 ? (
          <div className="col-span-full py-20 text-center opacity-20 font-black uppercase">No staff members found</div>
        ) : (
          filteredStaff.map((s) => (
            <div key={s.id} className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all relative group">
              <div className="absolute top-6 right-6 flex flex-col gap-3">
                <Link 
                  to={`/staff/${s.id}/edit`} 
                  className="p-2 border-2 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:shadow-none bg-white"
                >
                  <Edit3 size={16} />
                </Link>
                <button 
                  onClick={() => handleDelete(s.id)}
                  className="p-2 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(239,68,68,1)] hover:shadow-none bg-white"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 border-4 border-[#141414] bg-gray-100 overflow-hidden shrink-0">
                    {s.profile_picture ? (
                      <img src={s.profile_picture} alt={s.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-20 bg-gray-200">
                        <User size={32} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight leading-none mb-1">{s.name}</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{s.status}</p>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                    <Phone size={16} className="text-[#E13D4B]" />
                    <span>{s.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
                    <Mail size={16} className="text-[#E13D4B]" />
                    <span className="truncate">{s.email}</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  <span className="inline-block px-4 py-1.5 bg-[#E13D4B] text-white text-[10px] font-black uppercase tracking-widest border-2 border-[#E13D4B]">
                    {s.roles?.name || 'Staff'}
                  </span>
                  <div className="text-right">
                    <p className="text-[8px] font-black uppercase opacity-30 tracking-tighter">Last Active</p>
                    <p className="text-[10px] font-bold text-gray-400">
                      {s.last_login ? format(new Date(s.last_login), 'MMM dd, HH:mm') : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
