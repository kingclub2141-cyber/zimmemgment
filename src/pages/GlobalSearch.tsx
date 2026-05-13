import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, 
  User, 
  ChevronRight, 
  Database, 
  History, 
  Zap, 
  ArrowRight,
  Loader2,
  Tag,
  CreditCard,
  Users,
  Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function GlobalSearch() {
  const { gym } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>({
    members: [],
    leads: [],
    visitors: [],
    trainers: [],
    staff: []
  });

  const handleSearch = async (term: string) => {
    if (!term || term.length < 2) {
      setResults({ members: [], leads: [], visitors: [], trainers: [], staff: [] });
      return;
    }

    try {
      setLoading(true);
      
      const searchPattern = `%${term}%`;
      
      const [members, leads, visitors, trainers, staff] = await Promise.all([
        supabase.from('members').select('id, name, phone').eq('gym_id', gym.id).ilike('name', searchPattern).limit(5),
        supabase.from('leads').select('id, name, phone').eq('gym_id', gym.id).ilike('name', searchPattern).limit(5),
        supabase.from('visitors').select('id, name, phone').eq('gym_id', gym.id).ilike('name', searchPattern).limit(5),
        supabase.from('trainers').select('id, name, phone').eq('gym_id', gym.id).ilike('name', searchPattern).limit(5),
        supabase.from('staff').select('id, name').eq('gym_id', gym.id).ilike('name', searchPattern).limit(5)
      ]);

      setResults({
        members: members.data || [],
        leads: leads.data || [],
        visitors: visitors.data || [],
        trainers: trainers.data || [],
        staff: staff.data || []
      });

    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const ResultSection = ({ title, items, path, icon }: { title: string, items: any[], path: string, icon: any }) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 border-b-2 border-[#141414] pb-4">
           {icon}
           <h3 className="text-xs font-black uppercase tracking-widest">{title} <span className="opacity-20">({items.length})</span></h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {items.map((item: any) => (
             <button 
               key={item.id}
               onClick={() => navigate(`${path}/${item.id}`)}
               className="bg-white border-4 border-[#141414] p-6 text-left flex justify-between items-center hover:bg-[#141414] hover:text-white group transition-all shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] active:shadow-none translate-y-0 active:translate-y-1"
             >
                <div className="space-y-1">
                   <p className="font-black uppercase text-sm italic">{item.name}</p>
                   <p className="text-[10px] font-black opacity-40 group-hover:opacity-60">{item.phone || '#' + item.id.substring(0,8)}</p>
                </div>
                <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
             </button>
           ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="border-b-8 border-[#141414] pb-12">
        <h1 className="text-7xl font-black uppercase tracking-tighter italic">Global Nexus</h1>
        <p className="text-sm font-black uppercase tracking-[1em] opacity-40">Unified system entity search</p>
      </div>

      <div className="relative">
         <div className="absolute left-8 top-1/2 -translate-y-1/2">
            {loading ? <Loader2 className="animate-spin opacity-40" /> : <Search size={32} className="opacity-40" />}
         </div>
         <input 
           autoFocus
           type="text" 
           placeholder="SCAN SYSTEM FOR ENTITIES..."
           value={searchTerm}
           onChange={e => setSearchTerm(e.target.value)}
           className="w-full bg-white border-8 border-[#141414] py-10 pl-24 pr-10 text-4xl font-black uppercase italic outline-none shadow-[20px_20px_0px_0px_rgba(20,20,20,1)] placeholder:opacity-10"
         />
      </div>

      <div className="space-y-16 pt-8">
        {!searchTerm ? (
           <div className="py-20 text-center grayscale opacity-10 space-y-6">
              <Database size={120} className="mx-auto" />
              <p className="text-3xl font-black uppercase tracking-[0.3em]">System Standby: Input Core Query</p>
           </div>
        ) : (
          <>
            <ResultSection title="Active Members" items={results.members} path="/members" icon={<Users size={18}/>} />
            <ResultSection title="CRM Leads" items={results.leads} path="/leads" icon={<Tag size={18}/>} />
            <ResultSection title="Protocol Visitors" items={results.visitors} path="/visitors" icon={<Zap size={18}/>} />
            <ResultSection title="Trainer Corps" items={results.trainers} path="/trainers" icon={<CreditCard size={18}/>} />
            <ResultSection title="Staff Hierarchy" items={results.staff} path="/staff" icon={<Briefcase size={18}/>} />
            
            {Object.values(results).every((arr: any) => arr.length === 0) && !loading && (
               <div className="py-20 text-center border-4 border-dashed border-[#141414]/10">
                  <p className="font-black uppercase tracking-widest opacity-20">Query yielded zero matches across all matrices</p>
               </div>
            )}
          </>
        )}
      </div>

      <div className="bg-[#141414] text-white p-12 flex justify-between items-center shadow-[16px_16px_0px_0px_rgba(20,20,20,0.1)] border-4 border-[#141414]">
         <div className="flex items-center gap-8">
            <History size={48} className="opacity-20" />
            <div className="space-y-1">
               <h4 className="text-xl font-black uppercase italic">Search Forensics</h4>
               <p className="text-[10px] font-black uppercase opacity-40 tracking-widest leading-relaxed">
                  Queries are logged for system optimization. High-frequency searches will be indexed for instant retrieval in future cycles.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
