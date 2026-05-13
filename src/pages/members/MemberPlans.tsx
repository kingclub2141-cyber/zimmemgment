import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  ArrowLeft, 
  Plus, 
  CreditCard, 
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  DollarSign
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import AssignPlanModal from '../../components/modals/AssignPlanModal';

export default function MemberPlans() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  async function fetchData() {
    setLoading(true);
    try {
      const [
        { data: memberData, error: memberError },
        { data: plansData, error: plansError }
      ] = await Promise.all([
        supabase.from('members').select('id, name, member_id').eq('id', id).single(),
        supabase.from('member_plans').select('*, plans(*)').eq('member_id', id).order('purchase_date', { ascending: false })
      ]);

      if (memberError) throw memberError;
      if (plansError) throw plansError;

      setMember(memberData);
      setPlans(plansData || []);
    } catch (error: any) {
      toast.error(error.message);
      navigate('/members');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#141414] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            to={`/members/${id}`}
            className="p-2 border-2 border-[#141414] hover:bg-white transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] active:translate-x-0.5 active:translate-y-0.5"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">{member.name}'s Plans</h1>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
              Manage subscriptions and payment status
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-[#141414] text-white text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,0.3)] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
        >
          <Plus size={16} strokeWidth={3} />
          Assign New Plan
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {plans.length > 0 ? plans.map((p) => (
          <div key={p.id} className="bg-white border-2 border-[#141414] shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] flex flex-col md:flex-row divide-y-2 md:divide-y-0 md:divide-x-2 divide-[#141414]">
            <div className="p-6 md:w-1/3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={cn(
                    "px-2 py-0.5 border text-[10px] font-black uppercase tracking-widest",
                    p.status === 'Active' ? "bg-green-100 text-green-700 border-green-200" : "bg-red-50 opacity-50"
                  )}>
                    {p.status}
                  </span>
                  <button className="p-1 hover:bg-[#f5f5f5] rounded">
                    <MoreVertical size={16} />
                  </button>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight">{p.plans?.plan_name}</h3>
                <p className="text-[10px] font-black uppercase opacity-40 italic tracking-widest">
                  Assigned on {format(parseISO(p.purchase_date), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="p-2 bg-blue-50 border border-[#141414]">
                  <Clock size={16} className="text-blue-600" />
                </div>
                <div>
                   <p className="text-[10px] font-bold opacity-40 uppercase">Validity</p>
                   <p className="text-xs font-black uppercase">
                    Exp: {format(parseISO(p.expiry_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 md:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-6 bg-[#fafafa]">
              <div className="space-y-1">
                <p className="text-[10px] font-bold opacity-40 uppercase">Plan Amount</p>
                <div className="flex items-center gap-1">
                  <DollarSign size={14} className="opacity-40" />
                  <p className="text-sm font-black">{p.amount}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold opacity-40 uppercase">Discount</p>
                <p className="text-sm font-bold text-blue-600">
                  {p.discount_type === 'Percent' ? `${p.discount}%` : `$${p.discount}`}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold opacity-40 uppercase">Paid So Far</p>
                <p className="text-sm font-black text-green-600">${p.paid_amount}</p>
              </div>
              <div className={cn("p-3 border-2 border-[#141414] bg-white shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]", p.due_amount > 0 ? "bg-red-50/30" : "bg-green-50/30")}>
                <p className="text-[10px] font-bold opacity-40 uppercase">Balance Due</p>
                <p className={cn("text-lg font-black", p.due_amount > 0 ? "text-red-600" : "text-green-600")}>
                  ${p.due_amount}
                </p>
              </div>
              
              <div className="col-span-full pt-4 flex gap-3">
                 <button className="flex-1 px-4 py-2 bg-[#141414] text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 shadow-[2px_2px_0px_0px_rgba(20,20,20,0.5)]">
                   Add Payment
                 </button>
                 <button className="px-4 py-2 bg-white border-2 border-[#141414] text-[10px] font-black uppercase tracking-widest hover:bg-[#f5f5f5] shadow-[2px_2px_0px_0px_rgba(20,20,20,1)]">
                   View Receipt
                 </button>
              </div>
            </div>
          </div>
        )) : null}

        {plans.length === 0 && (
          <div className="py-20 text-center border-4 border-[#141414] border-dashed bg-white">
            <AlertCircle size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-sm font-black uppercase tracking-widest opacity-40">No plans assigned yet</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-4 text-xs font-black uppercase underline underline-offset-4 decoration-2"
            >
              Assign the first plan now
            </button>
          </div>
        )}
      </div>

      <AssignPlanModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        memberId={id}
        onSuccess={fetchData}
      />
    </div>
  );
}
