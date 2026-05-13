import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  CheckCircle2,
  XCircle,
  Package,
  LayoutGrid,
  CreditCard,
  CheckSquare,
  Settings,
  MoreVertical
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

interface Plan {
  id: string;
  plan_name: string;
  plan_type: string;
  amount: number;
  duration_type: string;
  duration_value: number;
  is_active: boolean;
}

export default function PlanList() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { gym } = useAuth();

  useEffect(() => {
    if (gym?.id) {
      fetchPlans();
    }
  }, [gym?.id]);

  async function fetchPlans() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('gym_id', gym.id)
        .ilike('plan_name', `%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      const { error } = await supabase.from('plans').delete().eq('id', id);
      if (error) throw error;
      toast.success('Plan deleted successfully');
      fetchPlans();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Plans</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/plans/add"
            className="flex items-center gap-2 px-6 py-2 bg-[#E13D4B] text-white text-sm font-bold rounded-lg hover:bg-[#c93542] transition-all shadow-lg shadow-rose-100"
          >
            <Plus size={18} />
            Add
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-xl shadow-sm border border-gray-100 animate-pulse"></div>
          ))
        ) : plans.length > 0 ? (
          plans.map((plan) => (
            <div 
              key={plan.id} 
              className={cn(
                "bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all",
                !plan.is_active && "opacity-60"
              )}
            >
              {/* Background Gear Icon */}
              <Settings size={120} className="absolute -right-8 -bottom-8 text-gray-50 opacity-10 rotate-12" />

              {/* Top Actions */}
              <div className="absolute top-4 right-4 flex items-center gap-1">
                <button 
                  onClick={() => handleDelete(plan.id)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-rose-50 rounded-lg text-[#E13D4B]">
                    <Package size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Plan Name:</span>
                    <h3 className="text-sm font-bold text-gray-700">{plan.plan_name}</h3>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-rose-50 rounded-lg text-[#E13D4B]">
                    <LayoutGrid size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Category:</span>
                    <h3 className="text-sm font-bold text-gray-600">{plan.plan_type || 'Membership'}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-rose-50 rounded-lg text-[#E13D4B]">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Amount:</span>
                      <h3 className="text-sm font-bold text-gray-800">₹ {plan.amount}</h3>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-rose-50 rounded-lg text-[#E13D4B]">
                      <CheckSquare size={18} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        {plan.duration_type.charAt(0).toUpperCase() + plan.duration_type.slice(1)}:
                      </span>
                      <h3 className="text-sm font-bold text-gray-800">{plan.duration_value}</h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Edit */}
              <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                <Link to={`/plans/${plan.id}/edit`} className="text-[11px] font-bold text-gray-400 hover:text-[#E13D4B] transition-colors flex items-center gap-1">
                  <Edit2 size={12} />
                  Edit Plan
                </Link>
                <div className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                  plan.is_active ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                )}>
                  {plan.is_active ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border border-gray-100 bg-white rounded-xl">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No plans created yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
