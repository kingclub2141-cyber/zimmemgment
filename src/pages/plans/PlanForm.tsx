import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  Package,
  DollarSign,
  Clock,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

interface PlanFormProps {
  mode: 'add' | 'edit';
}

export default function PlanForm({ mode }: PlanFormProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { gym } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(mode === 'edit');

  const [formData, setFormData] = useState({
    plan_name: '',
    plan_type: 'Membership',
    amount: '',
    duration_type: 'Months',
    duration_value: '1',
    is_active: true
  });

  useEffect(() => {
    if (mode === 'edit' && id) {
      fetchPlanDetails();
    }
  }, [id, mode]);

  async function fetchPlanDetails() {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      if (data) {
        setFormData({
          plan_name: data.plan_name || '',
          plan_type: data.plan_type || 'Membership',
          amount: data.amount?.toString() || '',
          duration_type: data.duration_type || 'Months',
          duration_value: data.duration_value?.toString() || '1',
          is_active: data.is_active ?? true
        });
      }
    } catch (error: any) {
      toast.error(error.message);
      navigate('/plans');
    } finally {
      setFetching(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      duration_value: parseInt(formData.duration_value),
      gym_id: gym?.id
    };

    try {
      if (mode === 'add') {
        const { error } = await supabase
          .from('plans')
          .insert([payload]);
        
        if (error) throw error;
        toast.success('Plan created successfully!');
      } else {
        const { error } = await supabase
          .from('plans')
          .update(payload)
          .eq('id', id);
        
        if (error) throw error;
        toast.success('Plan updated successfully!');
      }
      navigate('/plans');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-[#141414]" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link 
          to="/plans"
          className="p-2 border-2 border-[#141414] hover:bg-white transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] active:translate-x-0.5 active:translate-y-0.5"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">
            {mode === 'add' ? 'Create New Plan' : 'Edit Plan'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white border-2 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Plan Name</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-[#141414] opacity-30" size={16} />
                <input
                  required
                  name="plan_name"
                  value={formData.plan_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-[#f5f5f5] border-2 border-[#141414] text-sm font-bold focus:bg-white transition-all outline-none"
                  placeholder="e.g. Premium Monthly"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Plan Type</label>
                <select
                  name="plan_type"
                  value={formData.plan_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#f5f5f5] border-2 border-[#141414] text-sm font-bold focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="Membership">Membership</option>
                  <option value="Personal Training">Personal Training</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#141414] opacity-30 font-bold">₹</span>
                  <input
                    required
                    name="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-[#f5f5f5] border-2 border-[#141414] text-sm font-bold focus:bg-white transition-all outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Duration Value</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#141414] opacity-30" size={16} />
                  <input
                    required
                    name="duration_value"
                    type="number"
                    value={formData.duration_value}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-[#f5f5f5] border-2 border-[#141414] text-sm font-bold focus:bg-white transition-all outline-none"
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Duration Type</label>
                <select
                  name="duration_type"
                  value={formData.duration_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#f5f5f5] border-2 border-[#141414] text-sm font-bold focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="Days">Days</option>
                  <option value="Weeks">Weeks</option>
                  <option value="Months">Months</option>
                  <option value="Years">Years</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#141414]"></div>
              </label>
              <span className="text-xs font-black uppercase tracking-widest">Plan is Active</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-3 px-12 py-4 bg-[#141414] text-white text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-[6px_6px_0px_0px_rgba(20,20,20,0.3)] active:shadow-none active:translate-x-[6px] active:translate-y-[6px] disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {mode === 'add' ? 'Create Plan' : 'Update Plan'}
          </button>
        </div>
      </form>
    </div>
  );
}
