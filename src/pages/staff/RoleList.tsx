import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  Shield, 
  Edit3, 
  Trash2, 
  Loader2,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function RoleList() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<any[]>([]);

  useEffect(() => {
    if (gym) fetchRoles();
  }, [gym]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      // Fetch roles and join with staff count
      const { data, error } = await supabase
        .from('roles')
        .select(`
          *,
          staff:staff(count)
        `)
        .eq('gym_id', gym.id)
        .order('name');
      
      if (error) throw error;
      setRoles(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roleId: string, staffCount: number) => {
    if (staffCount > 0) {
      toast.error('Cannot delete role with assigned staff');
      return;
    }

    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);
      
      if (error) throw error;
      toast.success('Role deleted');
      fetchRoles();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Roles & Permissions</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Manage Access Control</p>
        </div>
        <Link 
          to="/roles/add" 
          className="flex items-center justify-center gap-3 bg-[#141414] text-white px-8 py-4 border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
        >
          <Plus size={18} /> Add New Role
        </Link>
      </div>

      <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#141414] text-white font-black uppercase tracking-widest text-[10px]">
              <th className="px-6 py-4">Role Name</th>
              <th className="px-6 py-4">Required Permissions</th>
              <th className="px-6 py-4 text-center">Staff Count</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-[#141414]">
            {loading ? (
              <tr><td colSpan={4} className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
            ) : roles.length === 0 ? (
              <tr><td colSpan={4} className="p-20 text-center opacity-20 font-black uppercase">No roles defined</td></tr>
            ) : (
              roles.map((role) => (
                <tr key={role.id} className="hover:bg-[#f5f5f5] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-700 border border-blue-200">
                        <Lock size={16} />
                      </div>
                      <span className="font-black uppercase tracking-tight">{role.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions?.slice(0, 5).map((p: string) => (
                        <span key={p} className="text-[8px] font-black uppercase px-2 py-0.5 bg-[#f5f5f5] border border-[#141414]">
                          {p.replace('.', ' ')}
                        </span>
                      ))}
                      {role.permissions?.length > 5 && (
                        <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-[#141414] text-white">
                          +{role.permissions.length - 5} More
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-black text-xl">{role.staff?.[0]?.count || 0}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link 
                        to={`/roles/${role.id}/edit`} 
                        className="p-2 border-2 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
                      >
                        <Edit3 size={14} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(role.id, role.staff?.[0]?.count || 0)}
                        className="p-2 border-2 border-[#141414] hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
