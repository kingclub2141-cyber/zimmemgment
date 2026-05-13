import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  Loader2, 
  Wallet, 
  Tag, 
  Zap, 
  AlertCircle,
  Smartphone,
  ChevronRight,
  Receipt
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdditionalCharges() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [charges, setCharges] = useState<any[]>([]);

  useEffect(() => {
    if (gym) fetchCharges();
  }, [gym]);

  const fetchCharges = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('additional_fees').select('*').eq('gym_id', gym.id);
      if (error) throw error;
      setCharges(data || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-8 border-[#141414] pb-12">
        <div>
           <h1 className="text-4xl font-black uppercase tracking-tighter">Global Fee Matrices</h1>
           <p className="text-sm font-black uppercase tracking-[0.4em] opacity-40">Registration, locker & auxiliary charges</p>
        </div>
        <button className="bg-[#141414] text-white px-8 py-4 border-4 border-[#141414] font-black uppercase tracking-widest text-xs flex items-center gap-3">
           <Plus size={18} /> Append Fee
        </button>
      </div>

      <div className="space-y-6">
         {loading ? (
            <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto opacity-20" size={40} /></div>
         ) : charges.length === 0 ? (
            <div className="py-20 text-center border-4 border-dashed border-[#141414]/10 bg-white">
               <Receipt size={48} className="mx-auto mb-4 opacity-10" />
               <p className="font-black uppercase tracking-widest opacity-20">No auxiliary fees defined in the matrix</p>
            </div>
         ) : charges.map((charge) => (
           <div key={charge.id} className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] flex items-center justify-between group">
              <div className="flex items-center gap-8">
                 <div className="w-16 h-16 bg-[#141414] text-white flex items-center justify-center border-4 border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,0.1)]">
                    <Tag size={24} />
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-1">{charge.fee_name}</h3>
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-gray-100 italic">Code: {charge.fee_code || 'GEN-01'}</span>
                       <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Applied once per cycle</span>
                    </div>
                 </div>
              </div>
              <div className="flex items-center gap-8">
                 <div className="text-right">
                    <p className="text-[9px] font-black uppercase opacity-40">Preset Value</p>
                    <p className="text-3xl font-black italic">₹{charge.amount.toLocaleString()}</p>
                 </div>
                 <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 border-2 border-[#141414]/10 hover:border-[#141414] transition-all"><Edit2 size={16}/></button>
                    <button className="p-2 border-2 border-red-100 text-red-600 hover:bg-red-50 transition-all"><Trash2 size={16}/></button>
                 </div>
              </div>
           </div>
         ))}
      </div>

      <div className="bg-blue-900 text-white p-10 border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(30,58,138,0.2)] flex items-start gap-8">
         <AlertCircle size={40} className="opacity-20 shrink-0" />
         <div className="space-y-4">
            <h4 className="text-xl font-black uppercase italic tracking-tight">Automated Application</h4>
            <p className="text-xs font-medium uppercase opacity-60 leading-relaxed tracking-wider">
               Additional charges marked as "Mandatory" will be pre-filled in all enrollment invoices. Registration fees are automatically applied to first-time members only.
            </p>
         </div>
      </div>
    </div>
  );
}
