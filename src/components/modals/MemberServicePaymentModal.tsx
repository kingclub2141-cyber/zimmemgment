import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  X, 
  Loader2,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

interface MemberServicePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceAssignmentId: string;
  currentDue: number;
  onSuccess: () => void;
}

export default function MemberServicePaymentModal({ 
  isOpen, 
  onClose, 
  serviceAssignmentId, 
  currentDue,
  onSuccess 
}: MemberServicePaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payAmt = parseFloat(amount);
    if (isNaN(payAmt) || payAmt <= 0) return toast.error('Enter valid amount');

    try {
      setLoading(true);
      
      // 1. Fetch current record
      const { data: record } = await supabase.from('member_services').select('paid_amount, due_amount').eq('id', serviceAssignmentId).single();
      if (!record) throw new Error('Record not found');

      const newPaid = (record.paid_amount || 0) + payAmt;
      const newDue = Math.max(0, (record.due_amount || 0) - payAmt);

      // 2. Update record
      const { error } = await supabase
        .from('member_services')
        .update({ 
          paid_amount: newPaid,
          due_amount: newDue
        })
        .eq('id', serviceAssignmentId);

      if (error) throw error;
      
      toast.success('Payment recorded');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white border-4 border-[#141414] w-full max-w-sm shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
        <div className="p-6 border-b-4 border-[#141414] flex items-center justify-between">
          <h2 className="text-xl font-black uppercase tracking-tighter">Service Payment</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="text-center pb-4 border-b-2 border-[#141414] border-dashed">
            <p className="text-[10px] font-black uppercase opacity-40">Outstanding Balance</p>
            <p className="text-3xl font-black text-red-600">₹{currentDue.toLocaleString()}</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest">Amount to Pay</label>
            <input 
              required
              type="number"
              max={currentDue}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-4 text-2xl font-black outline-none"
              placeholder="0.00"
            />
          </div>

          <button 
            type="submit"
            disabled={loading || !amount}
            className="w-full py-4 bg-[#141414] text-white font-black uppercase tracking-widest border-4 border-[#141414] hover:bg-white hover:text-[#141414] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm Payment'}
          </button>
        </form>
      </div>
    </div>
  );
}
