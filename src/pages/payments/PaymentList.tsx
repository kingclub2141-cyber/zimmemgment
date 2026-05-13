import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  Filter, 
  Download, 
  Receipt, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ExternalLink,
  Plus,
  Eye
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { safeFormat } from '../../lib/utils';

interface Payment {
  id: string;
  payment_date: string;
  amount: number;
  payment_mode: string;
  receipt_number: string;
  members: {
    name: string;
    member_id: string;
  };
  member_plans: {
    plans: {
      plan_name: string;
    };
  };
}

export default function PaymentList() {
  const { gym } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 10,
    totalCount: 0
  });

  useEffect(() => {
    if (gym) {
      fetchPayments();
    }
  }, [gym, pagination.page, pagination.pageSize]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('payments')
        .select(`
          *,
          members(name, member_id),
          member_plans(plans(plan_name))
        `, { count: 'exact' })
        .eq('gym_id', gym.id)
        .order('payment_date', { ascending: false })
        .range(
          pagination.page * pagination.pageSize,
          (pagination.page + 1) * pagination.pageSize - 1
        );

      if (searchQuery) {
        query = query.or(`receipt_number.ilike.%${searchQuery}%, members.name.ilike.%${searchQuery}%`);
      }

      if (dateRange.from) {
        query = query.gte('payment_date', dateRange.from);
      }
      if (dateRange.to) {
        query = query.lte('payment_date', dateRange.to);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      setPayments(data || []);
      setPagination(prev => ({ ...prev, totalCount: count || 0 }));
    } catch (error: any) {
      toast.error('Failed to load payments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const exportData = payments.map(p => ({
      'Receipt No': p.receipt_number,
      'Date': p.payment_date,
      'Member': p.members?.name,
      'Plan': p.member_plans?.plans?.plan_name,
      'Amount': p.amount,
      'Mode': p.payment_mode
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    XLSX.writeFile(wb, `Gym_Payments_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const totalPages = Math.ceil(pagination.totalCount / pagination.pageSize);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Payment History</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Manage all transactions</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-white border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-[#141414] hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-none active:translate-x-1 active:translate-y-1"
          >
            <Download size={16} />
            Export Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
            <input 
              type="text"
              placeholder="Search member or receipt number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPayments()}
              className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-12 pr-4 py-3 font-bold focus:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] transition-all outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">From</span>
              <input 
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="bg-[#f5f5f5] border-2 border-[#141414] px-4 py-2 font-bold text-sm outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40">To</span>
              <input 
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="bg-[#f5f5f5] border-2 border-[#141414] px-4 py-2 font-bold text-sm outline-none"
              />
            </div>
            <button 
              onClick={fetchPayments}
              className="px-6 py-2.5 bg-[#141414] text-white border-2 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all"
            >
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#141414] text-white">
                <th className="p-4 font-black uppercase tracking-widest text-xs h-12">Receipt No</th>
                <th className="p-4 font-black uppercase tracking-widest text-xs h-12">Member</th>
                <th className="p-4 font-black uppercase tracking-widest text-xs h-12">Plan</th>
                <th className="p-4 font-black uppercase tracking-widest text-xs h-12 text-right">Amount</th>
                <th className="p-4 font-black uppercase tracking-widest text-xs h-12">Date</th>
                <th className="p-4 font-black uppercase tracking-widest text-xs h-12">Mode</th>
                <th className="p-4 font-black uppercase tracking-widest text-xs h-12 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#141414] hidden md:table-row-group">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-20 text-center">
                    <Loader2 className="animate-spin inline-block mr-2" />
                    <span className="font-bold uppercase tracking-widest text-xs">Loading records...</span>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Receipt size={48} />
                      <p className="font-black uppercase tracking-widest text-sm">No transactions found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-[#f5f5f5] transition-colors group">
                    <td className="p-4">
                      <span className="font-mono text-xs font-black">{payment.receipt_number}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-black text-sm">{payment.members?.name}</span>
                        <span className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">ID: {payment.members?.member_id}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-sm">{payment.member_plans?.plans?.plan_name || 'N/A'}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-black text-sm">Rs. {payment.amount}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-xs font-bold opacity-60">
                        <Calendar size={12} />
                        {safeFormat(payment.payment_date, 'dd/MM/yyyy')}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-[#141414] text-white text-[10px] font-black uppercase tracking-widest">
                        {payment.payment_mode}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <Link 
                          to={`/payments/${payment.id}/invoice`}
                          className="p-2 border-2 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
                        >
                          <Eye size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y-2 divide-[#141414]">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="animate-spin inline-block mx-auto" />
              </div>
            ) : payments.length === 0 ? (
              <div className="p-12 text-center opacity-20">
                <Receipt size={40} className="mx-auto mb-2" />
                <p className="font-black text-[10px] uppercase">No records</p>
              </div>
            ) : (
              payments.map((payment) => (
                <div key={payment.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-black uppercase tracking-tighter">{payment.members?.name}</p>
                      <p className="text-[10px] font-bold opacity-40 uppercase">ID: {payment.members?.member_id}</p>
                    </div>
                    <span className="text-lg font-black tracking-tighter">₹{payment.amount}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold opacity-60 flex items-center gap-1">
                        <Calendar size={10} /> {safeFormat(payment.payment_date, 'dd/MM/yyyy')}
                      </p>
                      <p className="text-[10px] font-black text-[#E13D4B]">{payment.receipt_number}</p>
                    </div>
                    <Link 
                      to={`/payments/${payment.id}/invoice`}
                      className="px-4 py-2 border-2 border-[#141414] text-[10px] font-black uppercase tracking-widest hover:bg-[#141414] hover:text-white transition-all"
                    >
                      Receipt
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t-4 border-[#141414] flex flex-col md:flex-row justify-between items-center gap-4 bg-[#f5f5f5]">
          <div className="text-[10px] font-black uppercase tracking-widest opacity-40">
            Showing {pagination.page * pagination.pageSize + 1} to {Math.min((pagination.page + 1) * pagination.pageSize, pagination.totalCount)} of {pagination.totalCount}
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={pagination.pageSize}
              onChange={(e) => setPagination(prev => ({ ...prev, pageSize: Number(e.target.value), page: 0 }))}
              className="bg-white border-2 border-[#141414] px-2 py-1 font-bold text-xs outline-none hidden md:block"
            >
              {[10, 25, 50].map(size => <option key={size} value={size}>{size}/page</option>)}
            </select>
            <div className="flex gap-1">
              <button 
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(0, prev.page - 1) }))}
                disabled={pagination.page === 0}
                className="p-2 border-2 border-[#141414] disabled:opacity-20 hover:bg-white"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="hidden md:flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setPagination(prev => ({ ...prev, page: i }))}
                    className={cn(
                      "w-8 h-8 flex items-center justify-center font-black text-xs border-2 border-[#141414]",
                      pagination.page === i ? "bg-[#141414] text-white" : "bg-white hover:bg-[#f5f5f5]"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              
              <div className="md:hidden flex items-center px-4 font-black text-[10px] uppercase">
                Page {pagination.page + 1} / {totalPages}
              </div>

              <button 
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(totalPages - 1, prev.page + 1) }))}
                disabled={pagination.page === totalPages - 1}
                className="p-2 border-2 border-[#141414] disabled:opacity-20 hover:bg-white"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
