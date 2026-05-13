import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  X, 
  Loader2,
  DollarSign,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface UpdateMembershipPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  onSuccess: () => void;
}

export default function UpdateMembershipPaymentModal({ 
  isOpen, 
  onClose, 
  memberId,
  onSuccess 
}: UpdateMembershipPaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (isOpen && memberId) {
      fetchActivePlan();
    }
  }, [isOpen, memberId]);

  async function fetchActivePlan() {
    setFetching(true);
    try {
      const { data, error } = await supabase
        .from('member_plans')
        .select('*, plans(*)')
        .eq('member_id', memberId)
        .eq('status', 'Active')
        .maybeSingle();
      
      if (error) throw error;
      setPlan(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setFetching(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payAmt = parseFloat(amount);
    if (isNaN(payAmt) || payAmt <= 0) return toast.error('Enter valid amount');
    if (!plan) return toast.error('No active plan found');

    try {
      setLoading(true);
      
      const newPaid = (plan.paid_amount || 0) + payAmt;
      const newDue = Math.max(0, (plan.due_amount || 0) - payAmt);

      // 1. Update member_plan
      const { error: updateError } = await supabase
        .from('member_plans')
        .update({ 
          paid_amount: newPaid,
          due_amount: newDue
        })
        .eq('id', plan.id);

      if (updateError) throw updateError;

      // 2. Record in payments table
      await supabase.from('payments').insert({
        member_id: memberId,
        gym_id: plan.gym_id,
        amount: payAmt,
        payment_date: new Date().toISOString().split('T')[0],
        payment_mode: 'Cash', // Default to Cash
        payment_type: 'Membership',
        notes: `Balance payment for ${plan.plans?.plan_name}`
      });
      
      toast.success('Payment recorded successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#141414]/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white border-4 border-[#141414] w-full max-w-sm shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
        <div className="p-6 border-b-4 border-[#141414] flex items-center justify-between bg-[#f5f5f5]">
          <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            <DollarSign size={24} /> Plan Payment
          </h2>
          <button onClick={onClose} className="p-2 border-2 border-[#141414] hover:bg-white transition-all">
            <X size={20} />
          </button>
        </div>

        {fetching ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-[#E13D4B]" size={32} />
          </div>
        ) : !plan ? (
          <div className="p-12 text-center space-y-4">
            <AlertCircle size={48} className="mx-auto text-amber-500" />
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">No active plan found to update payment.</p>
            <button onClick={onClose} className="text-[10px] font-black underline uppercase tracking-widest">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="text-center pb-6 border-b-2 border-[#141414] border-dashed">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Current Due for {plan.plans?.plan_name}</p>
              <p className="text-4xl font-black text-red-600">₹{plan.due_amount?.toLocaleString()}</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-60">Amount to Pay (₹)</label>
              <input 
                required
                type="number"
                max={plan.due_amount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-4 bg-[#f5f5f5] border-2 border-[#141414] text-3xl font-black outline-none focus:bg-white transition-all"
                placeholder="0"
                autoFocus
              />
              <p className="text-[10px] font-bold text-gray-400 italic mt-1">
                Total Paid: ₹{plan.paid_amount || 0} / Total Plan: ₹{plan.amount || 0}
              </p>
            </div>

            <button 
              type="submit"
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="w-full flex items-center justify-center gap-3 py-4 bg-[#141414] text-white font-black uppercase tracking-[0.2em] hover:opacity-90 transition-all shadow-[6px_6px_0px_0px_rgba(20,20,20,0.3)] disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
              Confirm Payment
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
