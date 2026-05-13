import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, Clock, Crown, ArrowRight, CheckCircle2, History, IndianRupee } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { motion } from 'motion/react';

export default function MemberPlans() {
  const { profile } = useAuth();
  const [activePlan, setActivePlan] = useState<any>(null);
  const [planHistory, setPlanHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.member_id) {
      fetchPlans();
    }
  }, [profile]);

  const fetchPlans = async () => {
    try {
      const { data: plans } = await supabase
        .from('member_plans')
        .select('*, plans(*), trainers(name)')
        .eq('member_id', profile.member_id)
        .order('purchase_date', { ascending: false });

      if (plans) {
        setActivePlan(plans.find(p => p.status === 'Active'));
        setPlanHistory(plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Memberships</h1>
          <p className="text-gray-500 font-medium italic">Manage and renew your fitness plans</p>
        </div>
        <button className="px-6 py-2.5 bg-gray-900 text-white font-black rounded-lg text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-100 flex items-center gap-2">
          <Crown size={16} className="text-amber-400" /> Upgrade Plan
        </button>
      </div>

      {/* Active Plan Highlight */}
      {activePlan ? (
        <div className="bg-gray-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl shadow-rose-100 border border-white/5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#E13D4B] rounded-full -mr-32 -mt-32 blur-[100px] opacity-20" />
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Active Plan</span>
              </div>
              
              <div>
                <h2 className="text-4xl font-black mb-2">{activePlan.plans?.plan_name}</h2>
                <p className="text-white/60 font-medium">{activePlan.plans?.plan_type} • {activePlan.plans?.duration_value} {activePlan.plans?.duration_type}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Started On</p>
                  <p className="text-lg font-black">{format(new Date(activePlan.start_date), 'dd MMM yyyy')}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Valid Until</p>
                  <p className="text-lg font-black text-[#E13D4B]">{format(new Date(activePlan.expiry_date), 'dd MMM yyyy')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6">
              <div className="flex items-center justify-between text-white/60 text-xs font-bold">
                <span>Plan Subtotal</span>
                <span>₹{activePlan.paid_amount + (activePlan.due_amount || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-white/60 text-xs font-bold">
                <span>Total Paid</span>
                <span className="text-white font-black">₹{activePlan.paid_amount}</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Amount Due</p>
                  <p className={`text-2xl font-black ${activePlan.due_amount > 0 ? 'text-amber-400' : 'text-green-400'}`}>₹{activePlan.due_amount || 0}</p>
                </div>
                {activePlan.due_amount > 0 && (
                  <button className="px-4 py-2 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-gray-100 transition-all">
                    Pay Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
          <Crown size={48} className="mx-auto text-gray-200 mb-4" />
          <h2 className="text-xl font-black text-gray-400 uppercase tracking-widest">No Active Membership</h2>
          <button className="mt-6 px-8 py-3 bg-[#E13D4B] text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-[#c93542] transition-all">
            Browse Plans
          </button>
        </div>
      )}

      {/* Membership History */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-50 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
            <History size={18} />
          </div>
          <h2 className="font-black text-sm uppercase tracking-widest">Plan History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Plan Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount Paid</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {planHistory.map((p, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-black text-gray-900">{p.plans?.plan_name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Purchased: {format(new Date(p.purchase_date), 'dd MMM yyyy')}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                      <Calendar size={14} className="text-gray-400" />
                      <span>{format(new Date(p.start_date), 'MMM yy')} - {format(new Date(p.expiry_date), 'MMM yy')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-black text-gray-900">₹{p.paid_amount}</p>
                      {p.due_amount > 0 && <p className="text-[10px] font-bold text-amber-500 uppercase">₹{p.due_amount} Pending</p>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${
                      p.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-rose-50 text-[#666] hover:text-[#E13D4B] rounded-lg transition-all">
                      <ArrowRight size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
