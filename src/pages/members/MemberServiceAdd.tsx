import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  Zap,
  Tag,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { format, addMonths } from 'date-fns';

export default function MemberServiceAdd() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { gym } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [member, setMember] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    service_id: '',
    purchase_date: format(new Date(), 'yyyy-MM-dd'),
    start_date: format(new Date(), 'yyyy-MM-dd'),
    amount: '0',
    discount_type: 'Amount',
    discount_value: '0',
    paid_amount: '0',
    due_amount: '0',
    status: 'Active'
  });

  useEffect(() => {
    if (memberId && gym) {
      fetchData();
    }
  }, [memberId, gym]);

  const fetchData = async () => {
    const [{ data: mbr }, { data: svcs }] = await Promise.all([
      supabase.from('members').select('id, name').eq('id', memberId).single(),
      supabase.from('services').select('*').eq('gym_id', gym.id).eq('status', 'Active')
    ]);
    setMember(mbr);
    setServices(svcs || []);
    setFetching(false);
  };

  const handleServiceChange = (id: string) => {
    const svc = services.find(s => s.id === id);
    if (svc) {
      setFormData(f => ({ ...f, service_id: id, amount: svc.amount.toString(), paid_amount: svc.amount.toString(), due_amount: '0' }));
    }
  };

  const calculateDue = (amount: string, discType: string, discVal: string, paid: string) => {
    const amt = parseFloat(amount) || 0;
    const dv = parseFloat(discVal) || 0;
    const p = parseFloat(paid) || 0;
    
    let totalAfterDisc = amt;
    if (discType === 'Percent') totalAfterDisc = amt - (amt * (dv / 100));
    else totalAfterDisc = amt - dv;

    return Math.max(0, totalAfterDisc - p);
  };

  useEffect(() => {
    const due = calculateDue(formData.amount, formData.discount_type, formData.discount_value, formData.paid_amount);
    setFormData(f => ({ ...f, due_amount: due.toString() }));
  }, [formData.amount, formData.discount_type, formData.discount_value, formData.paid_amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || !gym) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('member_services')
        .insert([{
          gym_id: gym.id,
          member_id: memberId,
          service_id: formData.service_id,
          purchase_date: formData.purchase_date,
          start_date: formData.start_date,
          amount: parseFloat(formData.amount),
          discount_type: formData.discount_type,
          discount_value: parseFloat(formData.discount_value),
          paid_amount: parseFloat(formData.paid_amount),
          due_amount: parseFloat(formData.due_amount),
          status: formData.status
        }]);

      if (error) throw error;
      toast.success('Service assigned');
      navigate(`/members/${memberId}`);
    } catch (error) {
      toast.error('Assignment failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/members/${memberId}`)} className="p-3 border-4 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Quick Add Service</h1>
          <p className="text-xs font-black uppercase tracking-widest opacity-40">Assign special service to {member?.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-8 text-[#141414]">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest">Select Extra Service</label>
            <select 
              required
              value={formData.service_id}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-black outline-none"
            >
              <option value="">CHOOSE SERVICE</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name} (₹{s.amount})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest">Start Date</label>
                <input 
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(f => ({ ...f, start_date: e.target.value }))}
                  className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-bold outline-none"
                />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest">Purchase Date</label>
                <input 
                  type="date"
                  value={formData.purchase_date}
                  onChange={(e) => setFormData(f => ({ ...f, purchase_date: e.target.value }))}
                  className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-bold outline-none"
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-6 border-t-2 border-[#141414] pt-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest">Original Amount (₹)</label>
              <input 
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(f => ({ ...f, amount: e.target.value }))}
                className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-black text-2xl outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest">Discount Type</label>
              <div className="flex gap-2">
                {['Amount', 'Percent'].map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFormData(f => ({ ...f, discount_type: t }))}
                    className={`flex-1 py-4 font-black uppercase tracking-widest text-[8px] border-4 border-[#141414] ${formData.discount_type === t ? 'bg-[#141414] text-white' : 'bg-white'}`}
                  >{t}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest">Discount Value</label>
               <input 
                type="number"
                value={formData.discount_value}
                onChange={(e) => setFormData(f => ({ ...f, discount_value: e.target.value }))}
                className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-black text-2xl outline-none"
              />
            </div>
             <div className="space-y-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-green-600">Paid Amount (₹)</label>
               <input 
                type="number"
                value={formData.paid_amount}
                onChange={(e) => setFormData(f => ({ ...f, paid_amount: e.target.value }))}
                className="w-full bg-green-50 border-4 border-[#141414] p-4 font-black text-2xl text-green-700 outline-none"
              />
            </div>
          </div>

          <div className="p-6 bg-[#f5f5f5] border-4 border-[#141414] flex items-center justify-between">
            <span className="font-black uppercase tracking-widest text-xs">Final Due Balance</span>
            <span className="text-3xl font-black tracking-tighter">₹{formData.due_amount}</span>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-[#141414] text-white border-4 border-[#141414] font-black uppercase tracking-[0.3em] text-sm hover:bg-white hover:text-[#141414] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <>Activate Service Offering</>}
        </button>
      </form>
    </div>
  );
}
