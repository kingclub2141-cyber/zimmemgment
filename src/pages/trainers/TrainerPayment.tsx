import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  Calendar as CalendarIcon,
  CreditCard,
  History
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function TrainerPayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { gym } = useAuth();
  const [loading, setLoading] = useState(false);
  const [trainer, setTrainer] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    amount: '',
    payment_date: format(new Date(), 'yyyy-MM-dd'),
    payment_mode: 'Cash',
    month_year: format(new Date(), 'yyyy-MM-01'),
    description: ''
  });

  useEffect(() => {
    if (id && gym) {
      fetchTrainer();
      fetchHistory();
    }
  }, [id, gym]);

  const fetchTrainer = async () => {
    const { data } = await supabase.from('trainers').select('*').eq('id', id).single();
    if (data) setTrainer(data);
  };

  const fetchHistory = async () => {
    const { data } = await supabase
      .from('trainer_payments')
      .select('*')
      .eq('trainer_id', id)
      .order('payment_date', { ascending: false });
    setHistory(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainer) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('trainer_payments')
        .insert([{
          trainer_id: id,
          gym_id: gym.id,
          amount: parseFloat(formData.amount),
          payment_date: formData.payment_date,
          payment_mode: formData.payment_mode,
          month_year: formData.month_year,
          description: formData.description
        }]);

      if (error) throw error;
      toast.success('Payment recorded successfully');
      setFormData({
        amount: '',
        payment_date: format(new Date(), 'yyyy-MM-dd'),
        payment_mode: 'Cash',
        month_year: format(new Date(), 'yyyy-MM-01'),
        description: ''
      });
      fetchHistory();
    } catch (error) {
      toast.error('Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  if (!trainer) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/trainers/${id}`)} className="p-3 border-4 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Trainer Remuneration</h1>
          <p className="text-xs font-black uppercase tracking-widest opacity-40">Salary record for {trainer.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
          <h2 className="font-black uppercase tracking-widest text-xs mb-8 pb-4 border-b-2 border-[#141414] flex items-center gap-2">
            <CreditCard size={16} /> Record Payment
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase">Payment Date</label>
                <input 
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => setFormData(f => ({ ...f, payment_date: e.target.value }))}
                  className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-3 font-bold outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase">Salary Month</label>
                <input 
                  type="month"
                  value={formData.month_year.substring(0, 7)}
                  onChange={(e) => setFormData(f => ({ ...f, month_year: `${e.target.value}-01` }))}
                  className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-3 font-bold outline-none"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase">Amount (₹)</label>
              <input 
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(f => ({ ...f, amount: e.target.value }))}
                className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-4 font-black text-2xl outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase">Payment Mode</label>
              <select 
                value={formData.payment_mode}
                onChange={(e) => setFormData(f => ({ ...f, payment_mode: e.target.value }))}
                className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-3 font-bold outline-none"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI / GPay</option>
                <option value="Online">Online Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase">Notes</label>
              <textarea 
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
                className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-3 font-bold outline-none resize-none"
              ></textarea>
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#141414] text-white font-black uppercase tracking-widest text-[10px] border-4 border-[#141414] hover:bg-white hover:text-[#141414] transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Process Payment'}
            </button>
          </form>
        </div>

        <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] flex flex-col">
          <div className="p-6 border-b-2 border-[#141414]">
            <h2 className="font-black uppercase tracking-widest text-xs flex items-center gap-2">
              <History size={16} /> Disbursal History
            </h2>
          </div>
          <div className="overflow-y-auto max-h-[500px] flex-1 divide-y-2 divide-[#141414]">
            {history.length === 0 ? (
              <div className="p-12 text-center opacity-20 font-black uppercase tracking-widest text-xs">No payment history</div>
            ) : (
              history.map((pay) => (
                <div key={pay.id} className="p-4 flex items-center justify-between hover:bg-[#f5f5f5] transition-colors">
                  <div>
                    <p className="font-black text-sm">{format(new Date(pay.payment_date), 'MMM dd, yyyy')}</p>
                    <p className="text-[10px] font-bold uppercase opacity-40">For {format(new Date(pay.month_year), 'MMM yyyy')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg">₹{pay.amount.toLocaleString()}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{pay.payment_mode}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
