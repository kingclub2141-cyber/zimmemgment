import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Search, 
  Plus, 
  Edit2, 
  Eye, 
  Trash2, 
  UserX, 
  UserCheck as UserCheckIcon,
  ChevronLeft, 
  ChevronRight,
  Filter,
  Phone,
  MessageSquare,
  RefreshCw,
  Zap,
  MoreVertical,
  User,
  Calendar,
  CreditCard,
  FileDown,
  FileUp,
  Download,
  Receipt
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { format, parseISO, isValid } from 'date-fns';
import { cn, safeFormat } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import * as XLSX from 'xlsx';

interface Member {
  id: string;
  member_id: string;
  name: string;
  phone: string;
  status: string;
  joining_date: string;
  avatar_url?: string;
  member_plans?: any[];
}

export default function MemberList({ initialStatus = 'All' }: { initialStatus?: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 12;
  const { gym } = useAuth();

  useEffect(() => {
    if (gym?.id) {
      fetchMembers();
    }
  }, [page, statusFilter, gym?.id]);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  async function fetchMembers() {
    setLoading(true);
    try {
      let query = supabase
        .from('members')
        .select('*, member_plans(*, plans(*))', { count: 'exact' })
        .eq('gym_id', gym.id);

      if (statusFilter !== 'All') {
        query = query.eq('status', statusFilter);
      } else {
        query = query.neq('status', 'Deleted');
      }

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,member_id.ilike.%${searchTerm}%`);
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (error) throw error;
      setMembers(data || []);
      setTotalCount(count || 0);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchMembers();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    
    try {
      const { error } = await supabase
        .from('members')
        .update({ status: 'Deleted' })
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Member deleted (soft delete)');
      fetchMembers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleToggleStatus = async (member: any) => {
    const newStatus = member.status === 'Blocked' ? 'Active' : 'Blocked';
    try {
      const { error } = await supabase
        .from('members')
        .update({ status: newStatus })
        .eq('id', member.id);
      
      if (error) throw error;
      toast.success(`Member ${newStatus === 'Blocked' ? 'blocked' : 'unblocked'}`);
      fetchMembers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleExport = () => {
    const dataToExport = members.map(m => ({
      ID: m.member_id,
      Name: m.name,
      Phone: m.phone,
      Status: m.status,
      JoiningDate: m.joining_date
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    XLSX.writeFile(wb, "Gym_Members.xlsx");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        // Basic validation and mapping
        const membersToInsert = data.map((item: any) => ({
          gym_id: gym.id,
          name: item.Name || item.name,
          phone: String(item.Phone || item.phone),
          member_id: item.ID || item.id || `M-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          status: item.Status || item.status || 'Active',
          joining_date: format(new Date(), 'yyyy-MM-dd')
        }));

        const { error } = await supabase.from('members').insert(membersToInsert);
        if (error) throw error;
        toast.success(`Successfully imported ${membersToInsert.length} members`);
        fetchMembers();
      } catch (error: any) {
        toast.error('Import failed: ' + error.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handlePunchIn = async (memberId: string) => {
    try {
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const timeStr = format(new Date(), 'HH:mm:ss');
      
      const { error } = await supabase.from('attendance').insert({
        member_id: memberId,
        gym_id: gym.id,
        attendance_date: todayStr,
        punch_in_time: timeStr,
        status: 'Present'
      });

      if (error) throw error;
      toast.success('Punch in successful');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Active Members</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition-all cursor-pointer">
            <FileUp size={16} />
            Import
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
          </label>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition-all"
          >
            <FileDown size={16} />
            Export
          </button>
          <Link 
            to="/members/add"
            className="flex items-center gap-2 px-6 py-2 bg-[#E13D4B] text-white text-sm font-bold rounded-lg hover:bg-[#c93542] transition-all shadow-lg shadow-rose-100"
          >
            <Plus size={18} />
            Registration
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-4 items-center">
        <form onSubmit={handleSearch} className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search Member..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg text-sm border-none focus:ring-2 focus:ring-rose-500 transition-all font-medium"
          />
        </form>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-100 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-400 focus:outline-none"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Blocked">Blocked</option>
          </select>
          <button 
            type="submit"
            onClick={() => setPage(1) || fetchMembers()}
            className="px-6 py-2 bg-gray-800 text-white text-xs font-bold uppercase tracking-widest rounded-lg"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 bg-white rounded-xl border border-gray-100 animate-pulse"></div>
          ))
        ) : members.length > 0 ? (
          members.map((member: any) => {
            const activePlan = member.member_plans?.[0];
            const expiryDate = activePlan?.expiry_date ? new Date(activePlan.expiry_date) : null;
            const isPlanExpired = expiryDate && isValid(expiryDate) && expiryDate < new Date();
            
            return (
              <div 
                key={member.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between hover:shadow-md transition-all group relative"
              >
                {isPlanExpired && (
                  <div className="absolute top-2 right-12 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 animate-pulse">
                    PLAN EXPIRED
                  </div>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center text-[#E13D4B] shrink-0">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt="" className="w-full h-full rounded-2xl object-cover" />
                      ) : (
                        <User size={32} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <Link to={`/members/${member.id}`} className="text-sm font-bold text-gray-800 truncate hover:text-[#E13D4B] transition-colors">{member.name}</Link>
                        <div className="relative">
                          <button 
                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); setOpenMenuId(openMenuId === member.id ? null : member.id); }}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <MoreVertical size={16} className="text-gray-400" />
                          </button>
                          {openMenuId === member.id && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-100 shadow-xl rounded-lg py-1 w-40 z-20" onClick={(e) => e.stopPropagation()}>
                              <Link to={`/members/${member.id}/edit`} className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase hover:bg-gray-50 transition-colors">
                                <Edit2 size={12} /> Edit
                              </Link>
                              <Link to={`/members/${member.id}`} className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase hover:bg-gray-50 transition-colors">
                                <Eye size={12} /> View Details
                              </Link>
                              {activePlan && (
                                <Link to={`/payments/${member.id}/invoice`} className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase hover:bg-gray-50 transition-colors">
                                  <Receipt size={12} /> Last Invoice
                                </Link>
                              )}
                              <Link to={`/members/${member.id}?tab=payments`} className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase hover:bg-gray-50 transition-colors">
                                <CreditCard size={12} /> Payment History
                              </Link>
                               <button onClick={() => handleDelete(member.id)} className="w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold uppercase hover:bg-rose-50 text-rose-500 transition-colors text-left">
                                <Trash2 size={12} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-[#E13D4B] flex items-center gap-1 mt-1">
                        M ID: {member.member_id}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                    member.status === 'Active' ? "bg-green-50 text-green-600 border-green-100" :
                    member.status === 'Blocked' ? "bg-red-50 text-red-600 border-red-100" :
                    "bg-gray-50 text-gray-600 border-gray-100"
                  )}>
                    {member.status}
                  </span>
                </div>

                <div className="space-y-3 py-4 border-t border-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mobile No.</span>
                    <span className="text-xs font-bold text-gray-700">{member.phone}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Due Amount</span>
                    <span className={cn("text-xs font-bold", (activePlan?.due_amount || 0) > 0 ? "text-rose-500" : "text-gray-700")}>
                      ₹ {activePlan?.due_amount || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Plan Name</span>
                    <span className="text-xs font-bold text-gray-700">{activePlan?.plans?.plan_name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Plan Expiry Date</span>
                    <span className={cn("text-xs font-bold", isPlanExpired ? "text-rose-500" : "text-gray-700")}>
                      {safeFormat(activePlan?.expiry_date, 'dd/MM/yyyy')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Link 
                    to={`/members/${member.id}/renew`}
                    className="flex lg:flex-row flex-col items-center justify-center gap-2 px-3 py-2 bg-rose-50 text-[#E13D4B] text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-rose-100 transition-colors"
                  >
                    <RefreshCw size={14} />
                    Renew
                  </Link>
                  <button 
                    onClick={() => handlePunchIn(member.id)}
                    className="flex lg:flex-row flex-col items-center justify-center gap-2 px-3 py-2 bg-gray-800 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-gray-900 transition-colors shadow-sm"
                  >
                    <Zap size={14} className="fill-current" />
                    Punch In
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-xl border border-gray-100">
            <User size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No members found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalCount > pageSize && (
        <div className="flex items-center justify-center gap-4 py-8">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="p-2 rounded-lg border border-gray-100 bg-white text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all font-bold"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-bold text-gray-700">Page {page} of {Math.ceil(totalCount / pageSize)}</span>
          <button 
            disabled={page * pageSize >= totalCount}
            onClick={() => setPage(p => p + 1)}
            className="p-2 rounded-lg border border-gray-100 bg-white text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all font-bold"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
