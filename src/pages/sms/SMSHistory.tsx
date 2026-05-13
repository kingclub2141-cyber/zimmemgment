import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  History, 
  Search, 
  Download, 
  Loader2, 
  Calendar, 
  Filter, 
  MessageSquare,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function SMSHistory() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (gym) fetchLogs();
  }, [gym]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sms_history')
        .select('*, members(name), staff(name)')
        .eq('gym_id', gym.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setLogs(data || []);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const exportData = filteredLogs.map(l => ({
      Timestamp: format(new Date(l.created_at), 'yyyy-MM-dd HH:mm:ss'),
      Recipient: l.members?.name || 'N/A',
      Phone: l.phone,
      Message: l.message,
      Status: l.status,
      Provider: l.provider || 'N/A',
      SentBy: l.staff?.name || 'System'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SMS_History");
    XLSX.writeFile(wb, `SMS_History_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.phone.includes(searchTerm) || 
                         (l.members?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Messaging Ledger</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Complete history of SMS communication</p>
        </div>
        <button 
          onClick={exportToExcel}
          className="flex items-center justify-center gap-3 bg-[#141414] text-white px-8 py-4 border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]"
        >
          <Download size={18} /> Export Records
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
              <input 
                type="text" 
                placeholder="Search by phone or member name..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-12 pr-4 py-3 font-bold outline-none uppercase" 
              />
           </div>
        </div>
        <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] flex gap-4">
           {['all', 'sent', 'failed'].map(s => (
             <button 
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex-1 py-1 font-black uppercase text-[10px] tracking-widest border-2 transition-all ${
                statusFilter === s ? 'bg-[#141414] text-white border-[#141414]' : 'bg-white text-[#141414] border-[#141414]/10 hover:border-[#141414]'
              }`}
             >
                {s}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#141414] text-white font-black uppercase tracking-widest text-[10px] border-b-4 border-[#141414]">
                <th className="px-6 py-5">Timestamp</th>
                <th className="px-6 py-5">Recipient</th>
                <th className="px-6 py-5">Content Preview</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Origin</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#141414] font-mono text-[11px]">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="animate-spin mx-auto opacity-20" size={40} /></td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center opacity-20 font-black uppercase text-sm font-sans">No communication logs found</td></tr>
              ) : (
                filteredLogs.map((l) => (
                  <tr key={l.id} className="hover:bg-[#f5f5f5] transition-colors group">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3 font-sans">
                          <Calendar size={12} className="opacity-40" />
                          <div>
                             <p className="font-black text-[10px] uppercase">{format(new Date(l.created_at), 'dd MMM yyyy')}</p>
                             <p className="text-[9px] opacity-40 font-bold">{format(new Date(l.created_at), 'HH:mm:ss')}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="font-sans">
                          <p className="font-black uppercase tracking-tight text-xs">{l.members?.name || 'N/A'}</p>
                          <p className="text-[9px] font-bold opacity-40 flex items-center gap-1">
                             {l.phone}
                          </p>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="bg-[#141414]/5 p-3 border border-[#141414]/5 rounded max-w-xs">
                          <p className="line-clamp-2 italic text-[10px] leading-relaxed">"{l.message}"</p>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className={`flex items-center gap-2 font-black uppercase text-[9px] tracking-widest px-2 py-1 border-2 w-fit ${
                         l.status === 'Sent' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                       }`}>
                          {l.status === 'Sent' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                          {l.status}
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="space-y-1 font-sans">
                          <p className="text-[10px] font-black uppercase tracking-tight">{l.staff?.name || 'Automated'}</p>
                          {l.is_bulk && <span className="bg-[#141414] text-white text-[7px] px-1 font-black">BULK</span>}
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         {[
           { label: 'DELIVERED', val: logs.filter(l => l.status === 'Sent').length, color: 'bg-green-600' },
           { label: 'FAILED', val: logs.filter(l => l.status === 'Failed').length, color: 'bg-red-600' },
           { label: 'BULK COUNT', val: logs.filter(l => l.is_bulk).length, color: 'bg-[#141414]' },
           { label: 'DIRECT COUNT', val: logs.filter(l => !l.is_bulk).length, color: 'bg-indigo-600' }
         ].map(stat => (
           <div key={stat.label} className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] flex items-center justify-between">
              <div>
                 <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{stat.label}</p>
                 <p className="text-3xl font-black">{stat.val}</p>
              </div>
              <div className={`w-8 h-8 ${stat.color} p-2 text-white`}>
                 <History size={16} />
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
