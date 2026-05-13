import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Zap, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  Loader2, 
  Activity, 
  ChevronRight,
  ShieldAlert,
  Dumbbell,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

export default function ActivityManagement() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (gym) fetchActivities();
  }, [gym]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('activities').select('*').eq('gym_id', gym.id);
      if (error) throw error;
      setActivities(data || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-8 border-[#141414] pb-12">
        <div>
           <h1 className="text-4xl font-black uppercase tracking-tighter">Engagement Activities</h1>
           <p className="text-sm font-black uppercase tracking-[0.4em] opacity-40">Class & discipline categorization</p>
        </div>
        <button className="bg-[#141414] text-white px-8 py-4 border-4 border-[#141414] font-black uppercase tracking-widest text-xs flex items-center gap-3">
           <Plus size={18} /> Initiate Activity
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {loading ? (
           <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto opacity-20" size={40} /></div>
         ) : activities.length === 0 ? (
           <div className="col-span-full py-20 text-center border-4 border-dashed border-[#141414]/10 bg-white">
              <Activity size={48} className="mx-auto mb-4 opacity-10" />
              <p className="font-black uppercase tracking-widest opacity-20">No activities classified</p>
           </div>
         ) : activities.map((activity) => (
           <div key={activity.id} className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] group hover:bg-[#141414] hover:text-white transition-all cursor-pointer">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-[#141414] text-white flex items-center justify-center p-3 group-hover:bg-white group-hover:text-[#141414] transition-all">
                       <Dumbbell size={24} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black uppercase tracking-tighter italic">{activity.name}</h3>
                       <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-black uppercase border-2 border-current px-2">Core discipline</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 border-2 border-white/20 hover:bg-white hover:text-[#141414] transition-all"><Edit2 size={16}/></button>
                    <button className="p-2 border-2 border-red-400 hover:bg-red-600 transition-all"><Trash2 size={16}/></button>
                 </div>
              </div>
           </div>
         ))}
      </div>

      <div className="bg-emerald-50 border-4 border-emerald-500 p-8 flex gap-6 shadow-[10px_10px_0px_0px_rgba(16,185,129,0.2)]">
         <Target className="text-emerald-600 shrink-0" size={32} />
         <div className="space-y-2">
            <h4 className="text-lg font-black uppercase tracking-tighter text-emerald-900">Activity Analytics</h4>
            <p className="text-xs font-medium text-emerald-800 leading-relaxed uppercase tracking-wider">
               Classification of activities allows the report engine to aggregate peak usage times per discipline. Ensure each activity is mapped to at least one trainer for valid payroll generation.
            </p>
         </div>
      </div>
    </div>
  );
}
