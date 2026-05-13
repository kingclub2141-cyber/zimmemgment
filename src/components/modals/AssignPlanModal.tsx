import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  X, 
  Search, 
  Calendar, 
  DollarSign, 
  CreditCard,
  Tag,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { addDays, addMonths, addWeeks, addYears, format, parseISO, isValid } from 'date-fns';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

interface AssignPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId?: string;
  onSuccess?: () => void;
}

export default function AssignPlanModal({ isOpen, onClose, memberId, onSuccess }: AssignPlanModalProps) {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    member_id: memberId || '',
    plan_id: '',
    purchase_date: new Date().toISOString().split('T')[0],
    start_date: new Date().toISOString().split('T')[0],
    amount: 0,
    discount: 0,
    discount_type: 'Amount',
    paid_amount: 0,
    trainer_id: ''
  });

  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
      if (!memberId) fetchMembers();
    }
  }, [isOpen, memberId]);

  async function fetchPlans() {
    const { data } = await supabase.from('plans').select('*').eq('gym_id', gym?.id).eq('is_active', true);
    setPlans(data || []);
  }

  async function fetchMembers() {
    const { data } = await supabase.from('members').select('id, name, member_id').eq('gym_id', gym?.id).eq('status', 'Active');
    setMembers(data || []);
  }

  if (!isOpen) return null;

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const planId = e.target.value;
    const plan = plans.find(p => p.id === planId);
    setSelectedPlan(plan);
    setFormData(prev => ({ 
      ...prev, 
      plan_id: planId, 
      amount: plan?.amount || 0,
      paid_amount: plan?.amount || 0
    }));
  };

  const calculateExpiry = (startDate: string, durationValue: number, durationType: string) => {
    if (!startDate) return 'Not Set';
    try {
      const start = parseISO(startDate);
      if (!isValid(start)) return 'Invalid Date';
      
      let expiry;
      switch (durationType) {
        case 'Days': expiry = addDays(start, durationValue); break;
        case 'Weeks': expiry = addWeeks(start, durationValue); break;
        case 'Months': expiry = addMonths(start, durationValue); break;
        case 'Years': expiry = addYears(start, durationValue); break;
        default: expiry = addMonths(start, durationValue);
      }
      
      if (!isValid(expiry)) return 'Invalid Date';
      return format(expiry, 'yyyy-MM-dd');
    } catch (error) {
      return 'Error';
    }
  };

  const calculateDue = () => {
    const totalAmount = formData.amount;
    let discountVal = Number(formData.discount);
    if (formData.discount_type === 'Percent') {
      discountVal = (totalAmount * discountVal) / 100;
    }
    return totalAmount - discountVal - Number(formData.paid_amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.member_id || !formData.plan_id) {
      toast.error('Please select member and plan');
      return;
    }

    setLoading(true);
    const expiryDate = calculateExpiry(formData.start_date, selectedPlan.duration_value, selectedPlan.duration_type);
    
    if (expiryDate === 'Invalid Date' || expiryDate === 'Error') {
      toast.error('Invalid start date');
      setLoading(false);
      return;
    }

    const dueAmount = calculateDue();

    try {
      const { error } = await supabase.from('member_plans').insert([{
        member_id: formData.member_id,
        plan_id: formData.plan_id,
        purchase_date: formData.purchase_date,
        start_date: formData.start_date,
        expiry_date: expiryDate,
        amount: formData.amount,
        discount: formData.discount,
        discount_type: formData.discount_type,
        paid_amount: formData.paid_amount,
        due_amount: dueAmount,
        status: 'Active'
      }]);

      if (error) throw error;
      
      // If payment is made, optionally create a payment entry too
      if (formData.paid_amount > 0) {
        // Find the newly created member_plan id is tricky without returning data
        // For simplicity in this demo we skip it or fetch it back
      }

      toast.success('Plan assigned successfully!');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#141414]/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white border-4 border-[#141414] w-full max-w-2xl shadow-[12px_12px_0px_0px_rgba(20,20,20,0.5)] overflow-hidden">
        <div className="p-6 border-b-4 border-[#141414] flex items-center justify-between bg-[#f5f5f5]">
          <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            <CreditCard size={24} /> Assign New Plan
          </h2>
          <button onClick={onClose} className="p-2 border-2 border-[#141414] hover:bg-white transition-all">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!memberId && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Select Member</label>
                <select
                  required
                  value={formData.member_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, member_id: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#f5f5f5] border-2 border-[#141414] text-sm font-bold focus:bg-white transition-all outline-none"
                >
                  <option value="">-- Select Member --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.member_id})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Select Plan</label>
              <select
                required
                value={formData.plan_id}
                onChange={handlePlanChange}
                className="w-full px-4 py-3 bg-[#f5f5f5] border-2 border-[#141414] text-sm font-bold focus:bg-white transition-all outline-none"
              >
                <option value="">-- Select Plan --</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.plan_name} (${p.amount})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Purchase Date</label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData(prev => ({ ...prev, purchase_date: e.target.value }))}
                className="w-full px-4 py-3 bg-[#f5f5f5] border-2 border-[#141414] text-sm font-bold focus:bg-white transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                className="w-full px-4 py-3 bg-[#f5f5f5] border-2 border-[#141414] text-sm font-bold focus:bg-white transition-all outline-none"
              />
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border-2 border-[#141414] border-dashed">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4">Payment Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-[10px] font-bold opacity-40 uppercase">Base Price</p>
                <p className="text-lg font-black">${selectedPlan?.amount || 0}</p>
              </div>
              <div className="col-span-2">
                 <p className="text-[10px] font-bold opacity-40 uppercase">Discount</p>
                 <div className="flex mt-1">
                    <input 
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount: Number(e.target.value) }))}
                      className="w-full px-2 py-1 bg-white border-2 border-[#141414] border-r-0 text-xs font-bold focus:bg-white transition-all outline-none"
                    />
                    <select
                      value={formData.discount_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, discount_type: e.target.value }))}
                      className="bg-[#141414] text-white text-[10px] font-bold px-2 py-1 outline-none appearance-none"
                    >
                      <option value="Amount">$</option>
                      <option value="Percent">%</option>
                    </select>
                 </div>
              </div>
              <div>
                <p className="text-[10px] font-bold opacity-40 uppercase">Paid Amount</p>
                <input 
                  type="number"
                  value={formData.paid_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, paid_amount: Number(e.target.value) }))}
                   className="w-full px-2 py-1 mt-1 bg-white border-2 border-[#141414] text-xs font-bold focus:bg-white transition-all outline-none"
                />
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-[#141414]/10 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold opacity-40 uppercase">Due Amount</p>
                <p className={cn("text-xl font-black", calculateDue() > 0 ? "text-red-600" : "text-green-600")}>
                  ${calculateDue()}
                </p>
              </div>
              {selectedPlan && (
                <div className="text-right">
                  <p className="text-[10px] font-bold opacity-40 uppercase">Expiring On</p>
                  <p className="text-sm font-black italic">
                    {calculateExpiry(formData.start_date, selectedPlan.duration_value, selectedPlan.duration_type)}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 border-2 border-[#141414] text-xs font-black uppercase tracking-widest hover:bg-[#f5f5f5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-12 py-3 bg-[#141414] text-white text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,0.3)] disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
              Confirm Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
