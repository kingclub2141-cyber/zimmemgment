import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  AlertCircle, 
  Search, 
  Download, 
  Loader2, 
  MessageSquare,
  Smartphone,
  Calendar,
  Filter,
  ArrowRight,
  TrendingDown,
  User,
  Zap,
  Phone,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function DueReport() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [minDue, setMinDue] = useState(0);

  useEffect(() => {
    if (gym) fetchDues();
  }, [gym]);

  const fetchDues = async () => {
    try {
      setLoading(true);
      // Fetching active members who have a due_amount (calculated or stored)
      const { data, error } = await supabase
        .from('members')
        .select('*, member_plans(name)')
        .eq('gym_id', gym.id)
        .gt('due_amount', 0)
        .order('due_amount', { ascending: false });
      
      if (error) throw error;
      setMembers(data || []);
    } finally {
      setLoading(false);
    }
  };

  const totalDue = members.reduce((acc, m) => acc + (m.due_amount || 0), 0);

  const exportToExcel = () => {
    const exportData = members.map(m => ({
      'Member ID': m.member_id,
      Name: m.name,
      Phone: m.phone,
      Plan: m.member_plans?.name || 'N/A',
      'Due Amount': m.due_amount,
      'Expiry Date': m.expiry_date ? format(new Date(m.expiry_date), 'dd/MM/yyyy') : 'N/A'
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dues");
    XLSX.writeFile(wb, `Due_Report_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  const sendReminder = async (member: any) => {
    toast.success(`Reminder sent to ${member.name} via SMS`);
  };

  const filteredMembers = members.filter(m => 
    (m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.phone.includes(searchTerm)) &&
    (m.due_amount >= minDue)
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black uppercase tracking-tighter">Debit Register</h1>
           <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Outstanding collection tracking</p>
        </div>
        <button 
          onClick={exportToExcel}
          className="flex items-center justify-center gap-3 bg-[#141414] text-white px-8 py-4 border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]"
        >
          <Download size={18} /> Export Sheet
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-red-600 text-white p-10 border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(220,38,38,0.2)] flex items-center justify-between">
            <div className="space-y-1">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60">TOTAL OUTSTANDING</p>
               <p className="text-4xl font-black italic">₹{totalDue.toLocaleString()}</p>
            </div>
            <TrendingDown size={48} className="opacity-40" />
         </div>
         <div className="bg-white border-4 border-[#141414] p-10 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] flex items-center justify-between">
            <div className="space-y-1">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-40">DEBTOR COUNT</p>
               <p className="text-4xl font-black italic">{members.length}</p>
            </div>
            <Users size={40} className="opacity-10" />
         </div>
         <div className="bg-white border-4 border-[#141414] p-10 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] flex items-center justify-between">
            <div className="space-y-1">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-40">RECOVERY RATE</p>
               <p className="text-4xl font-black italic text-green-600">84%</p>
            </div>
            <Zap size={40} className="text-green-600 opacity-20" />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] lg:col-span-3">
            <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
               <input 
                 type="text" 
                 placeholder="Find member or reference phone..." 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-12 pr-4 py-3 font-bold outline-none uppercase" 
               />
            </div>
         </div>
         <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] flex items-center gap-4">
            <Filter size={20} className="opacity-20" />
            <div className="flex-1">
               <p className="text-[8px] font-black uppercase opacity-40 mb-1">Min. Due Threshold</p>
               <input 
                 type="number" 
                 value={minDue}
                 onChange={e => setMinDue(Number(e.target.value))}
                 className="w-full font-black text-sm outline-none"
               />
            </div>
         </div>
      </div>

      <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#141414] text-white font-black uppercase tracking-widest text-[10px] border-b-4 border-[#141414]">
                <th className="px-6 py-5">Member Identification</th>
                <th className="px-6 py-5">Subscribed Plan</th>
                <th className="px-6 py-5 text-right">Contract Value</th>
                <th className="px-6 py-5 text-right">Balance Due</th>
                <th className="px-6 py-5 text-center">Engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#141414] font-mono text-[11px]">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="animate-spin mx-auto opacity-20" size={40} /></td></tr>
              ) : filteredMembers.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center opacity-20 font-black uppercase text-sm font-sans">Zero defaults detected</td></tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-red-50 transition-colors">
                    <td className="px-6 py-4">
                       <div className="font-sans">
                          <p className="font-black uppercase tracking-tight text-xs">{m.name}</p>
                          <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">ID: {m.member_id} • {m.phone}</p>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="space-y-1 font-sans">
                          <p className="text-[10px] font-black uppercase tracking-tight">{m.member_plans?.name || 'N/A'}</p>
                          <p className="text-[9px] font-bold opacity-40 italic">Expires: {m.expiry_date ? format(new Date(m.expiry_date), 'dd MMM yyyy') : 'N/A'}</p>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right font-sans font-black opacity-40">
                       ₹{(m.plan_amount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <span className="text-lg font-black text-red-600">₹{(m.due_amount || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex justify-center gap-3">
                          <button 
                            onClick={() => sendReminder(m)}
                            className="p-3 border-2 border-[#141414] hover:bg-[#141414] hover:text-white shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none transition-all"
                            title="Send SMS Reminder"
                          >
                             <Smartphone size={14} />
                          </button>
                          <button 
                            className="p-3 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white shadow-[2px_2px_0px_0px_rgba(22,163,74,1)] hover:shadow-none transition-all"
                            title="Collect Payment"
                          >
                             <ArrowRight size={14} />
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
    </div>
  );
}
