import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Loader2, 
  Calendar,
  MoreVertical,
  CheckCircle2,
  Clock,
  UserPlus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Mail,
  Smartphone
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function VisitorList() {
  const { gym } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [purposeFilter, setPurposeFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('visitors')
        .select(`
          *,
          staff:staff_assigned (name)
        `, { count: 'exact' })
        .eq('gym_id', gym.id)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (purposeFilter !== 'all') {
        query = query.eq('purpose', purposeFilter);
      }

      if (dateRange.start) {
        query = query.gte('created_at', dateRange.start);
      }

      if (dateRange.end) {
        query = query.lte('created_at', dateRange.end + 'T23:59:59');
      }

      const { data, count, error } = await query
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) throw error;
      setVisitors(data || []);
      setTotalCount(count || 0);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gym) fetchVisitors();
  }, [gym, page, pageSize, searchTerm, statusFilter, purposeFilter, dateRange]);

  const exportExcel = () => {
    const data = visitors.map(v => ({
      Name: v.name,
      Phone: v.phone,
      Email: v.email || 'N/A',
      Purpose: v.purpose,
      'Check In': v.created_at ? format(new Date(v.created_at), 'dd MMM yyyy HH:mm') : 'N/A',
      'Check Out': v.time_out ? format(new Date(v.time_out), 'dd MMM yyyy HH:mm') : 'N/A',
      Status: v.status,
      Staff: v.staff?.name || 'N/A'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Visitors");
    XLSX.writeFile(wb, `Visitors_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  const handleCheckOut = async (id: string) => {
    try {
      const { error } = await supabase
        .from('visitors')
        .update({ 
          time_out: new Date().toISOString(),
          status: 'Completed'
        })
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Visitor checked out successfully');
      fetchVisitors();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-8 border-[#141414] pb-10">
        <div>
           <h1 className="text-5xl font-black uppercase tracking-tighter">Terminal Visitors</h1>
           <p className="text-sm font-black uppercase tracking-[0.4em] opacity-40">Live traffic & check-in management</p>
        </div>
        <div className="flex items-center gap-4">
           <button 
             onClick={exportExcel}
             className="hidden md:flex items-center gap-3 bg-white text-[#141414] px-6 py-4 border-4 border-[#141414] font-black uppercase tracking-widest text-[10px] hover:bg-[#141414] hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] active:shadow-none translate-y-0 active:translate-y-1"
           >
              <Download size={14} /> Export XLS
           </button>
           <button 
             onClick={() => navigate('/visitors/add')}
             className="flex items-center gap-3 bg-[#141414] text-white px-8 py-5 border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:invert transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,0.1)] active:shadow-none translate-y-0 active:translate-y-1"
           >
              <Plus size={20} /> Register Entry
           </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-8 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6">
        <div className="lg:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={18} />
          <input 
            type="text"
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#f5f5f5] border-3 border-[#141414] pl-12 pr-4 py-4 font-black uppercase text-xs outline-none"
          />
        </div>
        <div>
           <select 
             value={statusFilter}
             onChange={e => setStatusFilter(e.target.value)}
             className="w-full bg-[#f5f5f5] border-3 border-[#141414] p-4 font-black uppercase text-[10px] outline-none appearance-none"
           >
              <option value="all">Every State</option>
              <option value="Waiting">Waiting</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
           </select>
        </div>
        <div>
           <select 
             value={purposeFilter}
             onChange={e => setPurposeFilter(e.target.value)}
             className="w-full bg-[#f5f5f5] border-3 border-[#141414] p-4 font-black uppercase text-[10px] outline-none appearance-none"
           >
              <option value="all">Every Purpose</option>
              <option value="Inquiry">Inquiry</option>
              <option value="Trial">Free Trial</option>
              <option value="Payment">Payment</option>
              <option value="Meeting">Meeting</option>
              <option value="Delivery">Delivery</option>
              <option value="Other">Other</option>
           </select>
        </div>
        <div>
           <input 
             type="date"
             value={dateRange.start}
             onChange={e => setDateRange({...dateRange, start: e.target.value})}
             className="w-full bg-[#f5f5f5] border-3 border-[#141414] p-3 font-black uppercase text-[10px] outline-none"
           />
        </div>
        <div>
           <input 
             type="date"
             value={dateRange.end}
             onChange={e => setDateRange({...dateRange, end: e.target.value})}
             className="w-full bg-[#f5f5f5] border-3 border-[#141414] p-3 font-black uppercase text-[10px] outline-none"
           />
        </div>
      </div>

      {/* Table */}
        <div className="bg-white border-8 border-[#141414] shadow-[16px_16px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
          <table className="w-full text-left border-collapse hidden md:table">
          <thead>
            <tr className="bg-[#141414] text-white text-[10px] font-black uppercase tracking-widest">
              <th className="px-6 py-6 border-r border-white/10">Visitor Identity</th>
              <th className="px-6 py-6 border-r border-white/10">Communication</th>
              <th className="px-6 py-6 border-r border-white/10">Operational Context</th>
              <th className="px-6 py-6 border-r border-white/10">Arrival Protocol</th>
              <th className="px-6 py-6 border-r border-white/10">State</th>
              <th className="px-6 py-6 text-center">Protocol Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y-4 divide-[#141414]">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <Loader2 className="animate-spin mx-auto opacity-20" size={40} />
                </td>
              </tr>
            ) : visitors.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-32 text-center grayscale opacity-20">
                  <Users size={80} className="mx-auto mb-6" />
                  <p className="font-black uppercase tracking-[0.5em] text-2xl">No Entry Logs Found</p>
                </td>
              </tr>
            ) : visitors.map((v) => (
              <tr key={v.id} className="hover:bg-gray-50 group transition-colors">
                <td className="px-6 py-8 border-r border-[#141414]/5">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#141414] text-white flex items-center justify-center font-black italic text-lg border-2 border-[#141414]">
                         {v.name.charAt(0)}
                      </div>
                      <div className="space-y-1">
                         <p className="font-black font-mono uppercase text-sm leading-tight group-hover:text-indigo-600 transition-colors">{v.name}</p>
                         <p className="text-[10px] font-black uppercase opacity-40 italic">{v.visitor_type || 'INDIVIDUAL'}</p>
                      </div>
                   </div>
                </td>
                <td className="px-6 py-8 border-r border-[#141414]/5 space-y-2">
                   <div className="flex items-center gap-2">
                      <Smartphone size={12} className="opacity-40" />
                      <span className="text-[10px] font-black uppercase">{v.phone}</span>
                   </div>
                   {v.email && (
                     <div className="flex items-center gap-2">
                        <Mail size={12} className="opacity-40" />
                        <span className="text-[10px] font-black opacity-40 lowercase">{v.email}</span>
                     </div>
                   )}
                </td>
                <td className="px-6 py-8 border-r border-[#141414]/5">
                   <div className="space-y-2">
                      <span className="bg-[#141414] text-white text-[9px] font-black uppercase px-2 py-0.5 tracking-widest">{v.purpose}</span>
                      <p className="text-[10px] font-black uppercase opacity-40">Attending: {v.staff?.name || 'Reception'}</p>
                   </div>
                </td>
                <td className="px-6 py-8 border-r border-[#141414]/5">
                   <div className="space-y-2">
                      <div className="flex items-center gap-2">
                         <Clock size={12} className="text-green-600" />
                         <span className="text-[10px] font-black uppercase tracking-tight">IN: {format(new Date(v.created_at), 'HH:mm')}</span>
                      </div>
                      {v.time_out ? (
                        <div className="flex items-center gap-2">
                           <LogOut size={12} className="text-red-600" />
                           <span className="text-[10px] font-black uppercase tracking-tight">OUT: {format(new Date(v.time_out), 'HH:mm')}</span>
                        </div>
                      ) : (
                        <span className="text-[9px] font-black uppercase italic opacity-20">Currently Active</span>
                      )}
                   </div>
                </td>
                <td className="px-6 py-8 border-r border-[#141414]/5">
                   <span className={`text-[9px] font-black uppercase px-2 py-1 border-2 ${
                      v.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-600' :
                      v.status === 'Waiting' ? 'bg-amber-50 text-amber-700 border-amber-600' :
                      'bg-indigo-50 text-indigo-700 border-indigo-600'
                   }`}>
                      {v.status}
                   </span>
                </td>
                <td className="px-6 py-8 text-center bg-[#fcfcfc]">
                   <div className="flex items-center justify-center gap-3">
                      <div className="relative group/actions">
                         <button className="p-3 border-2 border-[#141414] hover:bg-[#141414] hover:text-white transition-all">
                            <MoreVertical size={16} />
                         </button>
                         <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border-4 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] z-[70] hidden group-hover/actions:block">
                            {!v.time_out && (
                              <button 
                                onClick={() => handleCheckOut(v.id)}
                                className="w-full text-left px-4 py-3 text-[10px] font-black uppercase hover:bg-red-50 text-red-600 border-b-2 border-[#141414]"
                              >
                                Check Out
                              </button>
                            )}
                            <button 
                              onClick={() => navigate('/leads/add', { state: { prefill: { name: v.name, phone: v.phone, email: v.email } } })}
                              className="w-full text-left px-4 py-3 text-[10px] font-black uppercase hover:bg-indigo-50 text-indigo-600 border-b-2 border-[#141414]"
                            >
                              Convert to Lead
                            </button>
                            <button 
                              onClick={() => navigate('/members/add', { state: { prefill: { name: v.name, phone: v.phone, email: v.email } } })}
                              className="w-full text-left px-4 py-3 text-[10px] font-black uppercase hover:bg-green-50 text-green-600"
                            >
                              Convert to Member
                            </button>
                         </div>
                      </div>
                      <button 
                        onClick={() => navigate(`/visitors/${v.id}`)}
                        className="p-3 border-2 border-[#141414]/10 hover:border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[3px_3px_0px_0px_rgba(20,20,20,0.1)] active:shadow-none"
                      >
                         <ArrowRight size={16} />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y-4 divide-[#141414]">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="animate-spin inline-block mx-auto" />
            </div>
          ) : visitors.length === 0 ? (
            <div className="p-12 text-center opacity-20 text-[10px] font-black uppercase tracking-widest italic">No entry logs</div>
          ) : (
            visitors.map((v) => (
              <div key={v.id} className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#141414] text-white flex items-center justify-center font-black italic border border-[#141414] shrink-0">
                      {v.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-xs uppercase">{v.name}</p>
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">{v.phone}</p>
                    </div>
                  </div>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 border ${
                    v.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-600' :
                    v.status === 'Waiting' ? 'bg-amber-50 text-amber-700 border-amber-600' :
                    'bg-indigo-50 text-indigo-700 border-indigo-600'
                  }`}>
                    {v.status}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-[#fcfcfc] border border-[#141414]/5 p-2 rounded">
                   <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#141414] text-white tracking-widest">{v.purpose}</span>
                   <div className="flex items-center gap-2">
                      <Clock size={10} className="text-green-600" />
                      <span className="text-[9px] font-black uppercase tracking-tight">IN: {format(new Date(v.created_at), 'HH:mm')}</span>
                   </div>
                </div>
                <div className="flex gap-2">
                   {!v.time_out && (
                     <button 
                       onClick={() => handleCheckOut(v.id)}
                       className="flex-1 py-3 border-2 border-[#141414] text-[10px] font-black uppercase bg-[#141414] text-white"
                     >
                       Check Out
                     </button>
                   )}
                   <button 
                    onClick={() => navigate(`/visitors/${v.id}`)}
                    className="flex-1 py-3 border-2 border-[#141414] text-[10px] font-black uppercase"
                   >
                     Details
                   </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="p-8 bg-[#f5f5f5] border-t-8 border-[#141414] flex flex-col md:flex-row justify-between items-center gap-10">
           <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase opacity-40">View Density:</span>
              <div className="flex bg-white border-2 border-[#141414]">
                 {[10, 25, 50].map(s => (
                   <button 
                     key={s} 
                     onClick={() => { setPageSize(s); setPage(1); }}
                     className={`px-4 py-2 text-[10px] font-black transition-all ${pageSize === s ? 'bg-[#141414] text-white' : 'hover:bg-gray-100'}`}
                   >
                     {s}
                   </button>
                 ))}
              </div>
           </div>

           <div className="flex items-center gap-6">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-4 border-2 border-[#141414] bg-white disabled:opacity-20 hover:bg-[#141414] hover:text-white transition-all"
              >
                 <ChevronLeft size={20} />
              </button>
              <div className="flex flex-col items-center">
                 <span className="text-[9px] font-black uppercase opacity-40">Operational Page</span>
                 <span className="font-black text-xl italic">{page} / {Math.ceil(totalCount / pageSize)}</span>
              </div>
              <button 
                onClick={() => setPage(p => p + 1)}
                disabled={page * pageSize >= totalCount}
                className="p-4 border-2 border-[#141414] bg-white disabled:opacity-20 hover:bg-[#141414] hover:text-white transition-all"
              >
                 <ChevronRight size={20} />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
