import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Users, UserPlus, ArrowRight, Loader2, Zap, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function VisitorWidget() {
  const { gym } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ today: 0, active: 0, recent: [] });

  useEffect(() => {
    if (gym) fetchVisitorStats();
  }, [gym]);

  const fetchVisitorStats = async () => {
    try {
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const { data: todayVisitors } = await supabase
        .from('visitors')
        .select('id')
        .eq('gym_id', gym.id)
        .gte('created_at', today.toISOString());

      const { data: activeVisitors } = await supabase
        .from('visitors')
        .select('id')
        .eq('gym_id', gym.id)
        .is('time_out', null);

      const { data: recent } = await supabase
        .from('visitors')
        .select('*')
        .eq('gym_id', gym.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        today: todayVisitors?.length || 0,
        active: activeVisitors?.length || 0,
        recent: recent || []
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border-8 border-[#141414] shadow-[16px_16px_0px_0px_rgba(20,20,20,1)] overflow-hidden flex flex-col h-full">
      <div className="p-6 bg-[#141414] text-white flex items-center justify-between">
         <div className="flex items-center gap-3">
            <Users size={20} />
            <h3 className="text-xs font-black uppercase tracking-widest italic">Terminal Traffic</h3>
         </div>
         <button 
           onClick={() => navigate('/visitors/add')}
           className="bg-white text-[#141414] px-3 py-1 text-[9px] font-black uppercase border-2 border-white hover:bg-transparent hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] active:shadow-none"
         >
            Fast Entry
         </button>
      </div>

      <div className="p-8 grid grid-cols-2 gap-8 border-b-4 border-[#141414]/5">
         <div className="space-y-1">
            <p className="text-[10px] font-black uppercase opacity-40">Today's Load</p>
            <p className="text-4xl font-black italic">{stats.today}</p>
         </div>
         <div className="space-y-1">
            <p className="text-[10px] font-black uppercase opacity-40">Active Links</p>
            <div className="flex items-center gap-2">
               <p className="text-4xl font-black italic text-indigo-600">{stats.active}</p>
               <Zap size={16} className="text-indigo-600 animate-pulse" />
            </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto">
         {loading ? (
            <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto opacity-20" /></div>
         ) : stats.recent.length === 0 ? (
            <div className="p-10 text-center uppercase text-[10px] font-black opacity-20 tracking-widest italic">Scanning for signals...</div>
         ) : (
            <div className="divide-y-2 divide-[#141414]/5 px-2">
               {stats.recent.map((v: any) => (
                  <button 
                    key={v.id}
                    onClick={() => navigate(`/visitors/${v.id}`)}
                    className="w-full p-4 flex items-center justify-between hover:bg-[#f5f5f5] transition-all group text-left"
                  >
                     <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-[#141414] text-white flex items-center justify-center font-black italic text-xs border border-[#141414]">
                           {v.name.charAt(0)}
                        </div>
                        <div className="space-y-0.5">
                           <p className="text-[10px] font-black uppercase truncate max-w-[120px]">{v.name}</p>
                           <p className="text-[8px] font-bold opacity-40 uppercase">{format(new Date(v.created_at), 'HH:mm')} | {v.purpose}</p>
                        </div>
                     </div>
                     <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </button>
               ))}
            </div>
         )}
      </div>

      <button 
        onClick={() => navigate('/visitors')}
        className="p-4 bg-[#f5f5f5] border-t-4 border-[#141414] flex items-center justify-center gap-3 hover:bg-[#141414] hover:text-white transition-all group"
      >
         <span className="text-[10px] font-black uppercase tracking-widest">Access Traffic Logs</span>
         <ArrowRight size={14} />
      </button>
    </div>
  );
}
