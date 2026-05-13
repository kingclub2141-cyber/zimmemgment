import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  History, 
  Download, 
  Search,
  Filter,
  FileText,
  Calendar,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { safeFormat } from '../../lib/utils';
import { Link } from 'react-router-dom';

export default function MemberPayments() {
  const { profile } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.member_id) {
      fetchPayments();
    }
  }, [profile]);

  const fetchPayments = async () => {
    try {
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('member_id', profile.member_id)
        .order('payment_date', { ascending: false });

      const { data: plansData } = await supabase
        .from('member_plans')
        .select('*, plans(*)')
        .eq('member_id', profile.member_id);

      setPayments(paymentsData || []);
      setPlans(plansData || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPaid = payments.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalDue = plans.reduce((acc, curr) => acc + (curr.due_amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#141414] p-8 -mx-8 -mt-8 mb-8 text-white">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Financial Overview</h1>
          <p className="text-rose-400 font-bold uppercase tracking-widest text-[10px] mt-1">Manage your subscriptions and payments</p>
        </div>
        <div className="flex gap-8">
           <div className="text-right">
             <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Paid</p>
             <p className="text-2xl font-black">₹{totalPaid}</p>
           </div>
           <div className="text-right">
             <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Due</p>
             <p className="text-2xl font-black text-rose-400">₹{totalDue}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Subscriptions Summary */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-green-500" /> Active Subscriptions
          </h2>
          {plans.filter(p => p.status === 'Active').map((p, idx) => (
            <div key={idx} className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] relative overflow-hidden group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
               <div className="absolute top-0 right-0 p-2 bg-[#141414] text-white">
                 <CreditCard size={14} />
               </div>
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{p.plans?.plan_type || 'Membership'}</p>
               <h3 className="text-xl font-black uppercase mb-4">{p.plans?.plan_name}</h3>
               
               <div className="space-y-2">
                 <div className="flex justify-between items-center text-xs">
                   <span className="font-bold opacity-40">Plan Amount</span>
                   <span className="font-black">₹{p.amount}</span>
                 </div>
                 <div className="flex justify-between items-center text-xs">
                   <span className="font-bold opacity-40">Paid</span>
                   <span className="font-black text-green-600">₹{p.paid_amount}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm pt-2 border-t border-dashed border-gray-200">
                   <span className="font-black">DUE</span>
                   <span className="font-black text-[#E13D4B]">₹{p.due_amount}</span>
                 </div>
               </div>

               {p.due_amount > 0 && (
                 <button className="w-full mt-6 py-3 bg-[#E13D4B] text-white font-black uppercase text-[10px] tracking-widest border-2 border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:shadow-none transition-all">
                   Pay Now
                 </button>
               )}
            </div>
          ))}

          {plans.filter(p => p.status === 'Active').length === 0 && (
            <div className="p-8 text-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
               <AlertCircle size={32} className="mx-auto mb-2 opacity-20" />
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No active subscriptions</p>
            </div>
          )}
        </div>

        {/* Payment History */}
        <div className="lg:col-span-2">
          <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
            <div className="p-6 border-b-4 border-[#141414] bg-[#fdfdfd] flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <History size={18} /> Payment History
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#141414] text-white text-[10px] font-black uppercase tracking-widest">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Receipt #</th>
                    <th className="px-6 py-4">Mode</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#141414]">
                  {loading ? (
                    <tr><td colSpan={5} className="p-20 text-center"><History className="animate-spin mx-auto opacity-20" /></td></tr>
                  ) : payments.length === 0 ? (
                    <tr><td colSpan={5} className="p-20 text-center font-black uppercase text-gray-300 opacity-50 tracking-widest">No payments found</td></tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id} className="hover:bg-rose-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={12} className="opacity-40" />
                            <span className="text-xs font-bold text-gray-600">{safeFormat(p.payment_date, 'dd MMM yyyy')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-black text-[#E13D4B]">{p.receipt_number}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-[#141414] text-white text-[10px] font-black uppercase tracking-widest">{p.payment_mode}</span>
                        </td>
                        <td className="px-6 py-4 font-black">₹{p.amount}</td>
                        <td className="px-6 py-4 text-center">
                          <Link 
                            to={`/payments/${p.id}/invoice`}
                            className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-[#141414] text-[10px] font-black uppercase tracking-widest hover:bg-[#141414] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none bg-white"
                          >
                            <Download size={14} /> Receipt
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
