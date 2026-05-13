import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Apple, 
  Search, 
  Loader2, 
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function DietManagement() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (gym) fetchMembersWithDiet();
  }, [gym]);

  const fetchMembersWithDiet = async () => {
    try {
      setLoading(true);
      // Fetch members and their count of diet plans
      const { data, error } = await supabase
        .from('members')
        .select(`
          id, 
          name, 
          member_id,
          member_diet_plans (count)
        `)
        .eq('gym_id', gym.id)
        .order('name');
      
      if (error) throw error;
      setMembers(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.member_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black uppercase tracking-tighter">Nutrition Protocols</h1>
           <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Manage member diet plans & prescriptions</p>
        </div>
        <Link 
          to="/diet-templates"
          className="flex items-center justify-center gap-3 bg-white text-[#141414] px-8 py-4 border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-[#141414] hover:text-white transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]"
        >
          <ClipboardList size={18} /> Manage Templates
        </Link>
      </div>

      <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
          <input 
            type="text" 
            placeholder="Search member by name or ID..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-12 pr-4 py-3 font-bold outline-none" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto opacity-20" size={40} /></div>
        ) : filteredMembers.length === 0 ? (
          <div className="col-span-full py-20 text-center opacity-20 font-black uppercase italic">No members discovered</div>
        ) : filteredMembers.map((member) => (
          <div key={member.id} className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] flex flex-col justify-between hover:translate-y-[-4px] transition-transform">
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-1">
                <h3 className="font-black uppercase tracking-tight text-lg leading-none">{member.name}</h3>
                <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest leading-none">ID: {member.member_id}</p>
              </div>
              <div className="p-2 bg-rose-50 text-[#E13D4B] border-2 border-[#141414]">
                <Apple size={20} />
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-6">
               <span className={`text-[10px] font-black uppercase px-2 py-1 border-2 ${
                  member.member_diet_plans?.[0]?.count > 0 ? 'bg-green-50 text-green-700 border-green-600' : 'bg-amber-50 text-amber-700 border-amber-600'
               }`}>
                  {member.member_diet_plans?.[0]?.count || 0} PLANS ASSIGNED
               </span>
               <Link 
                 to={`/members/${member.id}/diet-plans`}
                 className="p-2 border-2 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]"
               >
                 <ArrowRight size={16} />
               </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
