import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  UserCheck, 
  Download, 
  Search, 
  Loader2, 
  TrendingUp, 
  Filter, 
  ArrowRight,
  Users,
  Wallet,
  Activity,
  Award
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function TrainerReport() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trainers, setTrainers] = useState<any[]>([]);

  useEffect(() => {
    if (gym) fetchTrainers();
  }, [gym]);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trainers')
        .select(`
          *,
          member_services (
            id,
            members (id, name, status)
          )
        `)
        .eq('gym_id', gym.id);
      
      if (error) throw error;
      setTrainers(data || []);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const exportData = trainers.map(t => ({
      Name: t.name,
      Phone: t.phone,
      Specialization: t.specialization,
      'Salary (Fixed)': t.salary || 0,
      'Total Assignments': t.member_services?.length || 0,
      'Active Members': t.member_services?.filter((ms: any) => ms.members?.status === 'Active').length || 0
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Trainers");
    XLSX.writeFile(wb, `Trainer_Performance_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Trainer Performance</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Staff assignment audits & capacity analysis</p>
        </div>
        <button 
          onClick={exportToExcel}
          className="flex items-center justify-center gap-3 bg-[#141414] text-white px-8 py-4 border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]"
        >
          <Download size={18} /> Export Stats
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'STAFF COUNT', val: trainers.length, icon: <UserCheck />, color: 'bg-indigo-600' },
          { label: 'TOTAL PT ASSIGNMENTS', val: trainers.reduce((acc, t) => acc + (t.member_services?.length || 0), 0), icon: <Users />, color: 'bg-[#141414]' },
          { label: 'AVG CAPACITY', val: trainers.length ? (trainers.reduce((acc, t) => acc + (t.member_services?.length || 0), 0) / trainers.length).toFixed(1) : 0, icon: <Activity />, color: 'bg-green-600' },
          { label: 'PAYROLL EXPENSE', val: `₹${trainers.reduce((acc, t) => acc + (t.salary || 0), 0).toLocaleString()}`, icon: <Wallet />, color: 'bg-red-600' }
        ].map(stat => (
          <div key={stat.label} className="bg-white border-4 border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] flex items-center justify-between">
             <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{stat.label}</p>
                <p className="text-3xl font-black italic">{stat.val}</p>
             </div>
             <div className={`w-12 h-12 ${stat.color} text-white flex items-center justify-center`}>
                {stat.icon}
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         {trainers.map((t) => (
           <div key={t.id} className="bg-white border-4 border-[#141414] p-8 shadow-[10px_10px_0px_0px_rgba(20,20,20,1)] space-y-8">
              <div className="flex justify-between items-start border-b-2 border-[#141414] pb-6">
                 <div className="space-y-1">
                    <h3 className="text-2xl font-black uppercase tracking-tighter">{t.name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest bg-[#141414] text-white px-2 py-0.5 w-fit">{t.specialization || 'General Trainer'}</p>
                 </div>
                 <Award className="text-indigo-600" size={32} />
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="p-4 bg-gray-50 border-2 border-[#141414]/10 space-y-1">
                    <p className="text-[8px] font-black uppercase opacity-40">Client Load</p>
                    <p className="text-xl font-black">{t.member_services?.length || 0}</p>
                 </div>
                 <div className="p-4 bg-gray-50 border-2 border-[#141414]/10 space-y-1">
                    <p className="text-[8px] font-black uppercase opacity-40">Active Ratio</p>
                    <p className="text-xl font-black text-green-600">
                      {t.member_services?.length ? Math.round((t.member_services.filter((ms: any) => ms.members?.status === 'Active').length / t.member_services.length) * 100) : 0}%
                    </p>
                 </div>
              </div>

              <div className="space-y-4">
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Recent Assignments</p>
                 <div className="space-y-2">
                    {t.member_services?.slice(0, 3).map((ms: any) => (
                      <div key={ms.id} className="flex justify-between items-center text-[11px] font-bold py-2 border-b border-gray-100 uppercase">
                         <span>{ms.members?.name}</span>
                         <span className={`text-[8px] px-1 border ${ms.members?.status === 'Active' ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}`}>
                            {ms.members?.status}
                         </span>
                      </div>
                    ))}
                    {(t.member_services?.length || 0) === 0 && <p className="text-[10px] opacity-20 italic">No clients assigned</p>}
                 </div>
              </div>

              <button className="w-full py-4 bg-[#141414] text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:invert transition-all">
                 View Full Dossier <ArrowRight size={14}/>
              </button>
           </div>
         ))}
      </div>
    </div>
  );
}
