import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  Loader2, 
  Zap, 
  FileText,
  Calendar,
  AlertCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';

export default function MembershipSettings() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<any>(null);

  useEffect(() => {
    if (gym) fetchPlans();
  }, [gym]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('gym_id', gym.id)
        .order('price', { ascending: true });
      
      if (error) throw error;
      setPlans(data || []);
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = async (id: string) => {
    if (!window.confirm('Strike this plan from the registry? This action is irreversible.')) return;
    try {
      const { error } = await supabase.from('plans').delete().eq('id', id);
      if (error) throw error;
      setPlans(plans.filter(p => p.id !== id));
      toast.success('Membership blueprint deleted');
    } catch (error: any) {
      toast.error('Cannot delete plan: Assignments active');
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black uppercase tracking-tighter">Membership Blueprints</h1>
           <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Core subscription tier management</p>
        </div>
        <button 
           onClick={() => {
             setCurrentPlan(null);
             setIsModalOpen(true);
           }}
           className="bg-[#141414] text-white px-10 py-5 border-4 border-[#141414] font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:bg-white hover:text-[#141414] transition-all"
        >
           <Plus size={18} /> Forge New Tier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
         {loading ? (
            <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto opacity-20" size={40} /></div>
         ) : plans.length === 0 ? (
            <div className="col-span-full py-20 text-center border-4 border-dashed border-[#141414]/10 bg-white">
               <CreditCard size={48} className="mx-auto mb-4 opacity-10" />
               <p className="font-black uppercase tracking-widest opacity-20">No active membership blueprints found</p>
            </div>
         ) : plans.map((plan) => (
           <div key={plan.id} className="relative group bg-white border-4 border-[#141414] p-10 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#141414] rotate-45 translate-x-12 -translate-y-12 flex items-end justify-center pb-2">
                 <Tag size={16} className="text-white -rotate-45" />
              </div>
              
              <div className="space-y-8">
                 <div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter leading-tight mb-2 pr-12">{plan.name}</h3>
                    <div className="flex items-center gap-2">
                       <span className={`text-[9px] font-black uppercase px-2 py-0.5 border-2 ${
                          plan.is_active ? 'bg-green-50 text-green-700 border-green-600' : 'bg-red-50 text-red-700 border-red-600'
                       }`}>
                          {plan.is_active ? 'Active Tier' : 'Inactive'}
                       </span>
                    </div>
                 </div>

                 <div className="space-y-4 pt-4 border-t-2 border-[#141414]/5">
                    <div className="flex justify-between items-baseline">
                       <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Pricing Structure</p>
                       <p className="text-3xl font-black italic">₹{plan.price.toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between items-center">
                       <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">Duration Sequence</p>
                       <p className="text-sm font-black uppercase flex items-center gap-2">
                          <Clock size={14} className="opacity-40" /> {plan.duration_months} Months
                       </p>
                    </div>
                 </div>

                 <div className="bg-[#f5f5f5] p-6 space-y-4">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 underline decoration-2 decoration-[#141414]">Privilege Stack</p>
                    <p className="text-[11px] font-medium leading-relaxed italic line-clamp-3">
                       {plan.description || "Full access to cardio & weight sections including lockers & steam."}
                    </p>
                 </div>

                 <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => {
                        setCurrentPlan(plan);
                        setIsModalOpen(true);
                      }}
                      className="flex-1 py-4 border-4 border-[#141414] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-[#141414] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,0.1)] active:shadow-none translate-y-0 active:translate-y-1"
                    >
                       <Edit2 size={14} /> Refine
                    </button>
                    <button 
                      onClick={() => deletePlan(plan.id)}
                      className="p-4 border-4 border-red-100 text-red-600 hover:bg-red-50 transition-all"
                    >
                       <Trash2 size={18} />
                    </button>
                 </div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
