import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Clock, 
  Download, 
  Search, 
  Loader2, 
  Calendar, 
  Filter, 
  Zap, 
  AlertCircle,
  Smartphone,
  ChevronRight,
  TrendingDown,
  UserCheck
} from 'lucide-react';
import { format, addDays, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function ExpiryReport() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    if (gym) fetchExpirations();
  }, [gym, period]);

  const fetchExpirations = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString();
      const targetDate = addDays(new Date(), period).toISOString();

      const { data, error } = await supabase
        .from('members')
        .select('*, member_plans(name)')
        .eq('gym_id', gym.id)
        .gte('expiry_date', today)
        .lte('expiry_date', targetDate)
        .order('expiry_date', { ascending: true });
      
      if (error) throw error;
      setMembers(data || []);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const exportData = members.map(m => ({
      'Member ID': m.member_id,
      Name: m.name,
      Phone: m.phone,
      Plan: m.member_plans?.name || 'N/A',
      'Expiry Date': format(new Date(m.expiry_date), 'dd/MM/yyyy'),
      'Days Left': differenceInDays(new Date(m.expiry_date), new Date())
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Upcoming Expiries");
    XLSX.writeFile(wb, `Expiry_Report_Next_${period}_Days.xlsx`);
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Renewal Forecast</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Upcoming membership expirations</p>
        </div>
        <div className="flex gap-4">
           <div className="flex bg-white border-4 border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
              {[7, 15, 30, 60].map(p => (
                <button 
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 font-black uppercase text-[10px] tracking-widest transition-all ${
                    period === p ? 'bg-[#141414] text-white' : 'hover:bg-gray-100'
                  }`}
                >
                   {p}D
                </button>
              ))}
           </div>
           <button 
             onClick={exportToExcel}
             className="p-4 bg-[#141414] text-white border-4 border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:bg-white hover:text-[#141414] transition-all"
           >
              <Download size={20} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'TOTAL EXPIRING', val: members.length, icon: <Clock />, color: 'bg-[#141414]' },
          { label: 'URGENT (NEXT 3D)', val: members.filter(m => differenceInDays(new Date(m.expiry_date), new Date()) <= 3).length, icon: <AlertCircle />, color: 'bg-red-600' },
          { label: 'POTENTIAL REVENUE', val: `₹${members.reduce((acc, m) => acc + (m.plan_amount || 0), 0).toLocaleString()}`, icon: <TrendingDown />, color: 'bg-green-600' },
          { label: 'RENEWAL QUEUE', val: 'PROCESSED', icon: <UserCheck />, color: 'bg-indigo-600' }
        ].map(stat => (
          <div key={stat.label} className="bg-white border-4 border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] flex items-center justify-between">
             <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{stat.label}</p>
                <p className="text-3xl font-black">{stat.val}</p>
             </div>
             <div className={`w-12 h-12 ${stat.color} text-white flex items-center justify-center`}>
                {stat.icon}
             </div>
          </div>
        ))}
      </div>

      <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
          <input 
            type="text" 
            placeholder="Search renewal candidates..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-12 pr-4 py-3 font-bold outline-none uppercase" 
          />
        </div>
      </div>

      <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#141414] text-white text-[10px] font-black uppercase tracking-widest border-b-4 border-[#141414]">
                <th className="px-6 py-5">Identity Profile</th>
                <th className="px-6 py-5">Contract Details</th>
                <th className="px-6 py-5">Expiration Status</th>
                <th className="px-6 py-5 text-right">Potential</th>
                <th className="px-6 py-5 text-center">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#141414] font-mono text-[11px]">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="animate-spin mx-auto opacity-20" size={40} /></td></tr>
              ) : filteredMembers.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center opacity-20 font-black uppercase text-sm font-sans">No records detected for this period</td></tr>
              ) : (
                filteredMembers.map((m) => {
                  const daysLeft = differenceInDays(new Date(m.expiry_date), new Date());
                  return (
                    <tr key={m.id} className={`hover:bg-gray-50 transition-colors ${daysLeft <= 3 ? 'bg-red-50/30' : ''}`}>
                      <td className="px-6 py-4">
                         <div className="font-sans">
                            <p className="font-black uppercase tracking-tight text-xs">{m.name}</p>
                            <p className="text-[9px] font-bold opacity-40 uppercase">{m.phone} • ID: {m.member_id}</p>
                         </div>
                      </td>
                      <td className="px-6 py-4 font-sans">
                         <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-tight">{m.member_plans?.name || 'N/A'}</p>
                            <p className="text-[9px] font-bold opacity-40 italic">Last Interaction: Today</p>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-gray-100 border border-[#141414]/10">
                               <div 
                                className={`h-full ${daysLeft <= 7 ? 'bg-red-600' : 'bg-indigo-600'}`} 
                                style={{ width: `${Math.max(0, Math.min(100, (daysLeft / period) * 100))}%` }}
                               />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${daysLeft <= 7 ? 'text-red-600' : 'opacity-40'}`}>
                               {daysLeft} Days
                            </span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-right font-sans font-black text-sm">
                         ₹{(m.plan_amount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                           <button className="p-3 border-2 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none">
                              <Smartphone size={14} />
                           </button>
                           <button className="p-3 border-2 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none">
                              <ChevronRight size={14} />
                           </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
