import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

export default function ServiceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { gym } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    status: 'Active'
  });

  const serviceOptions = [
    'Personal Training',
    'Locker Facility',
    'Boxing Classes',
    'CrossFit Zone',
    'Yoga & Meditation',
    'Zumba Sessions',
    'Spa & Sauna',
    'Physiotherapy',
    'Dietitian Consultation',
    'Other'
  ];

  useEffect(() => {
    if (id && gym) fetchService();
  }, [id, gym]);

  const fetchService = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setFormData({
        name: data.name,
        amount: data.amount.toString(),
        status: data.status
      });
    } catch (error) {
      toast.error('Service not found');
      navigate('/services');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym) return;

    try {
      setLoading(true);
      const serviceData = {
        gym_id: gym.id,
        name: formData.name,
        amount: parseFloat(formData.amount),
        status: formData.status
      };

      if (id) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', id);
        if (error) throw error;
        toast.success('Service updated');
      } else {
        const { error } = await supabase
          .from('services')
          .insert([serviceData]);
        if (error) throw error;
        toast.success('Service created');
      }

      navigate('/services');
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/services')}
          className="p-3 border-4 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">
            {id ? 'Modify Service' : 'New Service Offering'}
          </h1>
          <p className="text-xs font-black uppercase tracking-widest opacity-40">Define pricing for gym extras</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest">Service Name</label>
            <div className="flex gap-4">
              <select 
                value={formData.name}
                onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                className="flex-1 bg-[#f5f5f5] border-4 border-[#141414] p-4 font-bold outline-none cursor-pointer"
              >
                <option value="">Select Service</option>
                {serviceOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            {formData.name === 'Other' && (
              <input 
                type="text"
                placeholder="Specify custom service name..."
                className="w-full mt-2 bg-[#f5f5f5] border-4 border-[#141414] p-4 font-bold outline-none"
                onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest">Pricing (₹)</label>
            <input 
              required
              type="number"
              min="0"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData(f => ({ ...f, amount: e.target.value }))}
              className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-black text-3xl outline-none focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest">Operational Status</label>
            <div className="flex gap-4">
              {['Active', 'Inactive'].map((stat) => (
                <button
                  key={stat}
                  type="button"
                  onClick={() => setFormData(f => ({ ...f, status: stat }))}
                  className={`flex-1 py-4 font-black uppercase tracking-widest text-[10px] border-4 border-[#141414] transition-all ${
                    formData.status === stat 
                      ? 'bg-[#141414] text-white shadow-[4px_4px_0px_0px_rgba(20,20,20,0.1)]' 
                      : 'bg-white text-[#141414] hover:bg-[#f5f5f5]'
                  }`}
                >
                  {stat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-[#141414] text-white border-4 border-[#141414] font-black uppercase tracking-[0.3em] text-sm hover:bg-white hover:text-[#141414] transition-all flex items-center justify-center gap-3 shadow-[8px_8px_0px_0px_rgba(20,20,20,0.1)] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <Save size={20} />
              {id ? 'Update Service' : 'Launch Service'}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
