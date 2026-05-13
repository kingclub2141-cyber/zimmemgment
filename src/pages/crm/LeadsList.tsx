import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Loader2,
  Filter,
  User,
  Phone,
  Calendar,
  Share2,
  Tag,
  ArrowRight,
  Download,
  MoreVertical
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { format, isToday, isPast, isThisWeek } from 'date-fns';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function LeadsList() {
  const { gym } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [followUpFilter, setFollowUpFilter] = useState('');

  useEffect(() => {
    if (gym) fetchData();
  }, [gym]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [leadsRes, sourcesRes, categoriesRes] = await Promise.all([
        supabase.from('leads').select('*, lead_sources(name), lead_categories(name, color)').eq('gym_id', gym.id).order('created_at', { ascending: false }),
        supabase.from('lead_sources').select('*').eq('gym_id', gym.id),
        supabase.from('lead_categories').select('*').eq('gym_id', gym.id)
      ]);

      if (leadsRes.error) throw leadsRes.error;
      setLeads(leadsRes.data || []);
      setSources(sourcesRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getFollowUpStatus = (date: string) => {
    if (!date) return 'none';
    const d = new Date(date);
    if (isPast(d) && !isToday(d)) return 'overdue';
    if (isToday(d)) return 'today';
    if (isThisWeek(d)) return 'upcoming';
    return 'none';
  };

  const deleteLead = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
      toast.success('Lead deleted');
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const exportLeads = () => {
    const data = filteredLeads.map(l => ({
      Name: l.name,
      Phone: l.phone,
      Email: l.email || 'N/A',
      Source: l.lead_sources?.name || 'Unknown',
      Category: l.lead_categories?.name || 'Uncategorized',
      Status: l.status,
      'Follow-up Date': l.next_followup_date || 'None',
      'Created At': format(new Date(l.created_at), 'yyyy-MM-dd')
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, "Gym_Leads_Report.xlsx");
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search);
    const matchesStatus = !statusFilter || l.status === statusFilter;
    const matchesSource = !sourceFilter || l.source_id === sourceFilter;
    const matchesCategory = !categoryFilter || l.category_id === categoryFilter;
    
    let matchesFollowUp = true;
    const fuStatus = getFollowUpStatus(l.next_followup_date);
    if (followUpFilter === 'today') matchesFollowUp = fuStatus === 'today';
    if (followUpFilter === 'overdue') matchesFollowUp = fuStatus === 'overdue';
    if (followUpFilter === 'this_week') matchesFollowUp = fuStatus === 'today' || fuStatus === 'upcoming';

    return matchesSearch && matchesStatus && matchesSource && matchesCategory && matchesFollowUp;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[#141414]">Prospect Pipeline</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Convert leads to members</p>
        </div>
        <div className="flex gap-4">
           <button onClick={exportLeads} className="px-6 py-4 bg-white border-4 border-[#141414] font-black uppercase tracking-widest text-[10px] hover:bg-[#f5f5f5] transition-all">
             <Download size={16} />
           </button>
           <Link 
            to="/leads/add" 
            className="flex items-center justify-center gap-3 bg-[#141414] text-white px-8 py-4 border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
           >
            <Plus size={18} /> New Prospect
          </Link>
        </div>
      </div>

      <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
          <input 
            type="text" 
            placeholder="Search..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-12 pr-4 py-3 font-bold outline-none" 
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-[#f5f5f5] border-2 border-[#141414] px-4 py-3 font-bold outline-none text-xs">
          <option value="">STATUS</option>
          <option value="Pending">PENDING</option>
          <option value="Converted">CONVERTED</option>
          <option value="Lost">LOST</option>
        </select>
        <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="bg-[#f5f5f5] border-2 border-[#141414] px-4 py-3 font-bold outline-none text-xs">
          <option value="">SOURCE</option>
          {sources.map((s, i) => <option key={`${s.id}-${i}`} value={s.id}>{s.name.toUpperCase()}</option>)}
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-[#f5f5f5] border-2 border-[#141414] px-4 py-3 font-bold outline-none text-xs">
          <option value="">CATEGORY</option>
          {categories.map((c, i) => <option key={`${c.id}-${i}`} value={c.id}>{c.name.toUpperCase()}</option>)}
        </select>
        <select value={followUpFilter} onChange={e => setFollowUpFilter(e.target.value)} className="bg-[#f5f5f5] border-2 border-[#141414] px-4 py-3 font-bold outline-none text-xs">
          <option value="">FOLLOW UP</option>
          <option value="overdue">OVERDUE</option>
          <option value="today">TODAY</option>
          <option value="this_week">THIS WEEK</option>
        </select>
      </div>

      <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#141414] text-white font-black uppercase tracking-widest text-[10px]">
                <th className="px-6 py-4">Prospect</th>
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Follow-up</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#141414]">
              {loading ? (
                <tr><td colSpan={6} className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
              ) : filteredLeads.length === 0 ? (
                <tr><td colSpan={6} className="p-20 text-center opacity-20 font-black uppercase">No prospects found</td></tr>
              ) : (
                filteredLeads.map((l, index) => (
                  <tr key={`${l.id}-${index}`} className="hover:bg-[#f5f5f5] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-100 border border-[#141414]">
                           <User size={20} className="opacity-20" />
                        </div>
                        <div>
                          <p className="font-black uppercase tracking-tight">{l.name}</p>
                          <p className="text-[10px] font-bold opacity-40">{l.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black uppercase px-2 py-1 bg-white border border-[#141414] flex items-center gap-2 w-fit">
                        <Share2 size={10} /> {l.lead_sources?.name || 'Direct'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: l.lead_categories?.color || '#141414' }}></div>
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            {l.lead_categories?.name || 'Unsorted'}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 border ${
                        l.status === 'Converted' ? 'bg-green-100 text-green-700 border-green-200' :
                        l.status === 'Lost' ? 'bg-red-100 text-red-700 border-red-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       {l.next_followup_date ? (
                         <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase flex items-center gap-1">
                               <Calendar size={10} /> {format(new Date(l.next_followup_date), 'MMM dd')}
                            </p>
                            {getFollowUpStatus(l.next_followup_date) === 'overdue' && (
                              <span className="text-[8px] font-black uppercase text-red-600 bg-red-50 px-1">Overdue</span>
                            )}
                            {getFollowUpStatus(l.next_followup_date) === 'today' && (
                              <span className="text-[8px] font-black uppercase text-green-600 bg-green-50 px-1">Today</span>
                            )}
                         </div>
                       ) : (
                         <span className="text-[10px] opacity-20 font-black italic">No Date</span>
                       )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link 
                          to={`/leads/${l.id}`} 
                          className="p-2 border-2 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
                        >
                          <ArrowRight size={14} />
                        </Link>
                        <div className="relative group/menu">
                           <button className="p-2 border-2 border-[#141414] hover:bg-[#141414] hover:text-white">
                              <MoreVertical size={14} />
                           </button>
                           <div className="absolute right-0 top-full mt-2 w-48 bg-white border-4 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] z-10 hidden group-hover/menu:block">
                              <Link to={`/leads/${l.id}/edit`} className="block px-4 py-3 text-[10px] font-black uppercase hover:bg-[#f5f5f5] border-b-2 border-[#141414]">Edit Profile</Link>
                              <button 
                                onClick={() => navigate('/members/add', { state: { prefill: { name: l.name, phone: l.phone, email: l.email } } })}
                                className="w-full text-left px-4 py-3 text-[10px] font-black uppercase hover:bg-green-50 text-green-600 border-b-2 border-[#141414]"
                              >
                                Convert to Member
                              </button>
                              <button onClick={() => deleteLead(l.id)} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase hover:bg-red-50 text-red-600">Delete Lead</button>
                           </div>
                        </div>
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
