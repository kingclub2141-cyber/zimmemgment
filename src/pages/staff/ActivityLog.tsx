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
  Activity,
  Terminal
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function ActivityLog() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    if (gym) fetchLogs();
  }, [gym]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('staff_activity_logs')
        .select('*, staff(name)')
        .order('created_at', { ascending: false })
        .limit(200);
      
      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const dataToExport = logs.map(l => ({
      Staff: l.staff?.name || 'System',
      Action: l.action,
      Details: l.details,
      IP: l.ip_address,
      Timestamp: format(new Date(l.created_at), 'yyyy-MM-dd HH:mm:ss')
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Activity Logs");
    XLSX.writeFile(workbook, `Staff_Activity_Logs_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const filteredLogs = logs.filter(l => 
    (l.staff?.name?.toLowerCase().includes(search.toLowerCase()) || 
     l.action.toLowerCase().includes(search.toLowerCase())) &&
    (!typeFilter || l.action.toLowerCase().includes(typeFilter.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">System Activity Logs</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Track every move</p>
        </div>
        <button 
          onClick={exportToExcel}
          className="flex items-center justify-center gap-3 bg-[#141414] text-white px-8 py-4 border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
        >
          <Download size={18} /> Export History
        </button>
      </div>

      <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
          <input 
            type="text" 
            placeholder="Search by Staff or Action..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-12 pr-4 py-3 font-bold outline-none" 
          />
        </div>
        <select 
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="bg-[#f5f5f5] border-2 border-[#141414] px-4 py-3 font-bold outline-none"
        >
          <option value="">ALL ACTIONS</option>
          <option value="LOGIN">LOGIN</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#141414] text-white font-black uppercase tracking-widest text-[10px]">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Staff Member</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#141414] font-mono text-[11px]">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center text-sm font-sans"><Loader2 className="animate-spin mx-auto" /></td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center opacity-20 font-black uppercase text-sm font-sans">No activity logs recorded</td></tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#f5f5f5] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap opacity-40">
                      {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <div className="p-1 bg-[#141414] text-white rounded-sm">
                           <Activity size={10} />
                         </div>
                         <span className="font-bold">{log.staff?.name || 'SYSTEM'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 border font-black uppercase ${
                        log.action.includes('DELETE') ? 'bg-red-50 text-red-700 border-red-200' : 
                        log.action.includes('CREATE') ? 'bg-green-50 text-green-700 border-green-200' :
                        log.action.includes('LOGIN') ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-gray-50 border-gray-200'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate font-bold opacity-60">
                      {log.details}
                    </td>
                    <td className="px-6 py-4 opacity-40">
                      {log.ip_address || '---.---.---.---'}
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
