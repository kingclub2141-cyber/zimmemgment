import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  IndianRupee, 
  Calendar, 
  ArrowRight, 
  TrendingUp,
  Clock,
  Briefcase,
  History,
  Download
} from 'lucide-react';
import { format, startOfYear, endOfYear } from 'date-fns';
import { toast } from 'sonner';

export default function TrainerEarnings() {
  const { profile } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarned: 0,
    pendingSalary: 0,
    commissionEarnings: 0
  });

  useEffect(() => {
    if (profile?.trainer_id) fetchEarnings();
  }, [profile]);

  async function fetchEarnings() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trainer_payments')
        .select('*')
        .eq('trainer_id', profile.trainer_id)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments(data || []);

      const total = data?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;
      setStats({
        totalEarned: total,
        pendingSalary: profile.trainers?.monthly_amount || 0, // Mock for now
        commissionEarnings: total * 0.1 // Mock commission
      });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><Clock className="animate-spin text-[#E13D4B]" /></div>;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">My Earnings</h1>
          <p className="text-gray-500 font-medium italic">Overview of your salary and commissions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-gray-200">
           <div className="absolute top-0 right-0 w-32 h-32 bg-[#E13D4B] rounded-full -mr-16 -mt-16 blur-[40px] opacity-20" />
           <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Total Accumulated</p>
           <p className="text-4xl font-black tracking-tighter">₹{stats.totalEarned}</p>
           <div className="mt-6 flex items-center gap-2 text-green-400 text-[10px] font-black uppercase tracking-widest">
              <TrendingUp size={14} /> +12% from last month
           </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-gray-100 border border-gray-50">
           <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Current Month Salary</p>
           <p className="text-4xl font-black tracking-tighter text-gray-900">₹{stats.pendingSalary}</p>
           <div className="mt-6 flex items-center gap-2 text-[#E13D4B] text-[10px] font-black uppercase tracking-widest">
              <Clock size={14} /> Scheduled for 1st {format(new Date(), 'MMM')}
           </div>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-gray-100 border border-gray-50">
           <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Commissions</p>
           <p className="text-4xl font-black tracking-tighter text-gray-900">₹{stats.commissionEarnings.toFixed(0)}</p>
           <div className="mt-6 flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-widest">
              <Briefcase size={14} /> From PT sessions
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-100 border border-gray-50 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
            <History size={20} />
          </div>
          <h2 className="text-sm font-black uppercase tracking-widest text-[#141414]">Payment History</h2>
        </div>
        <div className="overflow-x-auto">
           <table className="w-full text-left font-bold">
              <thead>
                 <tr className="bg-gray-50/50">
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Method</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                    <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Remarks</th>
                    <th className="px-8 py-6"></th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                 {payments.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                       <td className="px-8 py-5">
                          <span className="text-sm text-gray-900">{format(new Date(p.payment_date), 'dd MMM yyyy')}</span>
                       </td>
                       <td className="px-8 py-5 text-xs text-gray-500 uppercase tracking-widest">{p.payment_mode}</td>
                       <td className="px-8 py-5">
                          <span className="text-sm font-black text-[#E13D4B]">₹{p.amount}</span>
                       </td>
                       <td className="px-8 py-5 text-xs text-gray-400">{p.remarks || 'Standard Payout'}</td>
                       <td className="px-8 py-5 text-right">
                          <button className="p-2 hover:bg-rose-50 text-gray-400 hover:text-[#E13D4B] rounded-lg transition-all">
                             <Download size={18} />
                          </button>
                       </td>
                    </tr>
                 ))}
                 {payments.length === 0 && (
                   <tr>
                     <td colSpan={5} className="px-8 py-20 text-center text-gray-300 italic">No payment history found</td>
                   </tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
}
