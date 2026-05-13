import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  CreditCard, 
  Calendar as CalendarIcon, 
  User, 
  Phone, 
  Hash,
  Loader2,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import ReceiptModal from '../../components/modals/ReceiptModal';

interface Member {
  id: string;
  name: string;
  member_id: string;
  phone: string;
}

interface MemberPlan {
  id: string;
  plan_id: string;
  plans: {
    plan_name: string;
    description: string;
  };
  total_amount: number;
  paid_amount: number;
  due_amount: number;
  status: string;
}

export default function AddPayment() {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const { gym } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [member, setMember] = useState<Member | null>(null);
  const [activePlans, setActivePlans] = useState<MemberPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  
  const [formData, setFormData] = useState({
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_mode: 'Cash',
    receipt_number: '',
    remarks: ''
  });

  const [showReceipt, setShowReceipt] = useState(false);
  const [lastPayment, setLastPayment] = useState<any>(null);

  useEffect(() => {
    fetchMemberData();
    generateReceiptNumber();
  }, [memberId]);

  const generateReceiptNumber = () => {
    const today = new Date();
    const datePart = today.toISOString().split('T')[0].replace(/-/g, '');
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    setFormData(prev => ({
      ...prev,
      receipt_number: `RCP-${datePart}-${randomPart}`
    }));
  };

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      const [memberRes, plansRes] = await Promise.all([
        supabase.from('members').select('id, name, member_id, phone').eq('id', memberId).single(),
        supabase.from('member_plans').select('*, plans(*)').eq('member_id', memberId).eq('status', 'Active')
      ]);

      if (memberRes.error) throw memberRes.error;
      setMember(memberRes.data);
      
      const duePlans = (plansRes.data || []).filter(p => p.due_amount > 0);
      setActivePlans(duePlans);
      
      if (duePlans.length > 0) {
        setSelectedPlanId(duePlans[0].id);
        setFormData(prev => ({ ...prev, amount: duePlans[0].due_amount }));
      }
    } catch (error: any) {
      toast.error('Failed to load member details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const planId = e.target.value;
    setSelectedPlanId(planId);
    const plan = activePlans.find(p => p.id === planId);
    if (plan) {
      setFormData(prev => ({ ...prev, amount: plan.due_amount }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanId || formData.amount <= 0) {
      toast.error('Please select a plan and enter a valid amount');
      return;
    }

    const selectedPlan = activePlans.find(p => p.id === selectedPlanId);
    if (selectedPlan && formData.amount > selectedPlan.due_amount) {
      toast.error(`Amount cannot exceed the due amount of Rs. ${selectedPlan.due_amount}`);
      return;
    }

    try {
      setSubmitting(true);
      
      const newPaidAmount = (selectedPlan?.paid_amount || 0) + formData.amount;
      const newDueAmount = (selectedPlan?.due_amount || 0) - formData.amount;

      const { data: paymentData, error: paymentError } = await supabase.from('payments').insert([{
        gym_id: gym?.id,
        member_id: memberId,
        member_plan_id: selectedPlanId,
        amount: formData.amount,
        payment_date: formData.payment_date,
        payment_mode: formData.payment_mode,
        receipt_number: formData.receipt_number,
        remarks: formData.remarks
      }]).select().single();

      if (paymentError) throw paymentError;

      const { error: updateError } = await supabase.from('member_plans').update({
        paid_amount: newPaidAmount,
        due_amount: newDueAmount,
        status: newDueAmount === 0 ? 'Completed' : 'Active'
      }).eq('id', selectedPlanId);

      if (updateError) throw updateError;

      setLastPayment(paymentData);
      toast.success('Payment recorded successfully');
      setShowReceipt(true);
    } catch (error: any) {
      toast.error(error.message || 'Failed to process payment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#141414]" size={40} />
      </div>
    );
  }

  const selectedPlan = activePlans.find(p => p.id === selectedPlanId);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/members')}
            className="p-2 hover:bg-white border-2 border-transparent hover:border-[#141414] transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Add Payment</h1>
            <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Record transaction for member</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Member & Plan Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <User size={14} /> Member Details
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Name</p>
                <p className="font-black text-lg">{member?.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Member ID</p>
                  <p className="font-bold flex items-center gap-1.5"><Hash size={12} /> {member?.member_id}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Phone</p>
                  <p className="font-bold flex items-center gap-1.5"><Phone size={12} /> {member?.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {selectedPlan && (
            <div className="bg-[#141414] text-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,0.1)]">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 opacity-60">
                <CreditCard size={14} /> Outstanding Balance
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Selected Plan</p>
                  <p className="font-black text-xl leading-tight">{selectedPlan.plans?.plan_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Total Amount</p>
                  <p className="font-bold text-lg">₹{selectedPlan.total_amount}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Total Paid Amount</p>
                  <p className="font-bold text-green-400 text-lg">₹{selectedPlan.paid_amount}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Remaining / Unpaid Amount</p>
                <p className="text-4xl font-black tracking-tighter text-red-500">₹{selectedPlan.due_amount}</p>
              </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 border-b-2 border-[#141414] pb-4">
              Payment Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Select Plan to pay for</label>
                  <select
                    value={selectedPlanId}
                    onChange={handlePlanChange}
                    className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-4 font-bold focus:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] transition-all outline-none"
                    required
                  >
                    {activePlans.length === 0 ? (
                      <option disabled>No plans with pending dues</option>
                    ) : (
                      activePlans.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.plans?.plan_name} (Due: Rs. {p.due_amount})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Enter Paid Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    max={selectedPlan?.due_amount}
                    min={1}
                    className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-4 font-black text-2xl tracking-tighter focus:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] transition-all outline-none"
                    required
                  />
                  <p className="mt-2 text-[10px] font-bold text-red-600 uppercase">Max allowed to pay: ₹{selectedPlan?.due_amount || 0}</p>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Payment Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.payment_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
                      className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-4 font-bold focus:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] transition-all outline-none"
                      required
                    />
                    <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none" size={20} />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Payment Mode</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Cash', 'Card', 'UPI'].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, payment_mode: mode }))}
                        className={cn(
                          "py-3 border-2 border-[#141414] font-black text-xs uppercase tracking-widest transition-all",
                          formData.payment_mode === mode 
                            ? "bg-[#141414] text-white shadow-[4px_4px_0px_0px_rgba(20,20,20,0.2)]" 
                            : "bg-white text-[#141414] opacity-50 hover:opacity-100"
                        )}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Receipt Number</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.receipt_number}
                      readOnly
                      className="flex-1 bg-[#f5f5f5] border-2 border-[#141414] p-4 font-mono text-sm opacity-50"
                    />
                    <button 
                      type="button"
                      onClick={generateReceiptNumber}
                      className="p-4 border-2 border-[#141414] bg-white hover:bg-[#f5f5f5]"
                      title="Regenerate"
                    >
                      <Loader2 size={18} className={submitting ? "animate-spin" : ""} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Remarks (Optional)</label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                    className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-4 font-medium focus:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] transition-all outline-none min-h-[100px]"
                    placeholder="Enter any notes about this payment..."
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t-2 border-[#141414]/10 flex justify-end">
              <button
                type="submit"
                disabled={submitting || activePlans.length === 0}
                className="flex items-center gap-3 px-10 py-5 bg-[#141414] text-white border-4 border-[#141414] font-black uppercase tracking-[0.2em] text-sm hover:bg-white hover:text-[#141414] transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:shadow-none active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {submitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Process Payment
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showReceipt && lastPayment && member && selectedPlan && (
        <ReceiptModal
          isOpen={showReceipt}
          onClose={() => {
            setShowReceipt(false);
            navigate('/payments');
          }}
          gymName={gym?.name || 'Zimme Gym'}
          payment={lastPayment}
          member={member}
          plan={{
            plan_name: selectedPlan.plans?.plan_name || 'N/A',
            total_amount: selectedPlan.total_amount,
            paid_amount: lastPayment.amount + selectedPlan.paid_amount,
            due_amount: selectedPlan.due_amount - lastPayment.amount
          }}
        />
      )}
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
