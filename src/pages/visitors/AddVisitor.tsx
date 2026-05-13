import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  UserPlus, 
  Save, 
  Loader2, 
  ArrowLeft,
  Smartphone,
  Mail,
  User,
  MessageSquare,
  Users,
  Target,
  Printer,
  Zap,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function AddVisitor() {
  const { gym } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    purpose: 'Inquiry',
    staff_assigned: '',
    visitor_type: 'Individual',
    group_size: 1,
    notes: '',
    expected_duration: 30
  });

  useEffect(() => {
    if (gym) fetchStaff();
  }, [gym]);

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('id, name')
        .eq('gym_id', gym.id);
      if (error) throw error;
      setStaff(data || []);
    } catch (error: any) {
      toast.error('Failed to load staff registry');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return toast.error('Core identity fields required');

    try {
      setIsSaving(true);
      const { data, error } = await supabase
        .from('visitors')
        .insert([{
          ...formData,
          gym_id: gym.id,
          status: 'Waiting',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Visitor token generated & logged');
      navigate(`/visitors/${data.id}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-500 pb-20">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-8 border-[#141414] pb-12">
        <div className="flex items-center gap-8">
           <button 
             onClick={() => navigate('/visitors')}
             className="p-4 bg-white border-4 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] active:shadow-none"
           >
              <ArrowLeft size={24} />
           </button>
           <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter">Register Entrance</h1>
              <p className="text-sm font-black uppercase tracking-[0.4em] opacity-40">Visitor identification protocol</p>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Core Profile */}
        <div className="lg:col-span-8 space-y-10">
           <div className="bg-white border-8 border-[#141414] p-12 shadow-[24px_24px_0px_0px_rgba(20,20,20,1)] space-y-12">
              <div className="flex items-center gap-4 border-b-2 border-[#141414] pb-6">
                 <User className="opacity-20" size={32} />
                 <h2 className="text-2xl font-black uppercase tracking-tight">Identity Matrix</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Full Name String</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. MARCUS AURELIUS"
                      className="w-full bg-[#f5f5f5] border-3 border-[#141414] p-5 font-black uppercase text-xs outline-none focus:bg-white transition-colors"
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Terminal Phone Interface</label>
                    <div className="relative">
                       <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 opacity-20" size={18} />
                       <input 
                         required
                         type="tel" 
                         value={formData.phone}
                         onChange={e => setFormData({ ...formData, phone: e.target.value })}
                         placeholder="91XXXXXXXX"
                         className="w-full bg-[#f5f5f5] border-3 border-[#141414] pl-14 pr-5 py-5 font-black uppercase text-xs outline-none focus:bg-white transition-colors"
                       />
                    </div>
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Email Domain Alignment (Optional)</label>
                 <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 opacity-20" size={18} />
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="visitor@protocol.com"
                      className="w-full bg-[#f5f5f5] border-3 border-[#141414] pl-14 pr-5 py-5 font-black text-xs outline-none focus:bg-white transition-colors"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t-2 border-[#141414]/5 pt-10">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Categorization</label>
                    <div className="flex bg-[#f5f5f5] border-3 border-[#141414] p-2">
                       {['Individual', 'Group'].map(t => (
                         <button 
                           key={t}
                           type="button"
                           onClick={() => setFormData({...formData, visitor_type: t})}
                           className={`flex-1 py-3 text-[10px] font-black uppercase transition-all ${formData.visitor_type === t ? 'bg-[#141414] text-white' : 'hover:bg-gray-200'}`}
                         >
                            {t}
                         </button>
                       ))}
                    </div>
                 </div>
                 {formData.visitor_type === 'Group' && (
                   <div className="space-y-3 animate-in fade-in slide-in-from-left-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Cohort Size</label>
                      <input 
                        type="number" 
                        value={formData.group_size}
                        onChange={e => setFormData({ ...formData, group_size: Number(e.target.value) })}
                        className="w-full bg-[#f5f5f5] border-3 border-[#141414] p-4 font-black text-xs outline-none"
                      />
                   </div>
                 )}
              </div>
           </div>

           <div className="bg-[#141414] text-white p-12 shadow-[24px_24px_0px_0px_rgba(20,20,20,0.1)] space-y-10">
              <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                 <Zap className="opacity-40" />
                 <h2 className="text-xl font-black uppercase tracking-tight italic">Mission Parameters</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 text-white/40">Engagement Purpose</label>
                    <select 
                      value={formData.purpose}
                      onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                      className="w-full bg-white/10 border-2 border-white/20 p-5 font-black uppercase text-xs outline-none focus:bg-white/20"
                    >
                       <option className="bg-[#141414]">Inquiry</option>
                       <option className="bg-[#141414]">Trial</option>
                       <option className="bg-[#141414]">Payment</option>
                       <option className="bg-[#141414]">Meeting</option>
                       <option className="bg-[#141414]">Delivery</option>
                       <option className="bg-[#141414]">Other</option>
                    </select>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 text-white/40">Executive Link</label>
                    <select 
                      value={formData.staff_assigned}
                      onChange={e => setFormData({ ...formData, staff_assigned: e.target.value })}
                      className="w-full bg-white/10 border-2 border-white/20 p-5 font-black uppercase text-xs outline-none focus:bg-white/20"
                    >
                       <option value="" className="bg-[#141414]">Front Terminal</option>
                       {staff.map(s => <option key={s.id} value={s.id} className="bg-[#141414]">{s.name}</option>)}
                    </select>
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 text-white/40">Instructional Notes</label>
                 <textarea 
                   value={formData.notes}
                   onChange={e => setFormData({ ...formData, notes: e.target.value })}
                   placeholder="Log specific requirements or context..."
                   className="w-full bg-white/10 border-2 border-white/20 p-5 font-black uppercase text-xs outline-none focus:bg-white/20 min-h-[140px] resize-none"
                 />
              </div>
           </div>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-4 space-y-10">
           <div className="bg-white border-8 border-[#141414] p-10 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-10">
              <div className="flex items-center gap-4 text-orange-600">
                 <Info size={24} />
                 <h3 className="text-xs font-black uppercase tracking-widest text-[#141414]">System Awareness</h3>
              </div>
              <p className="text-[10px] font-black uppercase leading-relaxed tracking-widest italic border-l-4 border-[#141414] pl-4">
                 Entry protocol generates a temporary QR token valid for 24 hours. Check-in time is authenticated via server timestamp.
              </p>
              
              <div className="space-y-4 pt-4 border-t-2 border-[#141414]/5">
                 <button 
                   type="submit"
                   disabled={isSaving}
                   className="w-full py-8 bg-[#141414] text-white font-black uppercase tracking-[0.4em] text-sm hover:bg-black transition-all flex items-center justify-center gap-4 shadow-[10px_10px_0px_0px_rgba(20,20,20,0.1)] active:shadow-none translate-y-0 active:translate-y-1"
                 >
                    {isSaving ? <Loader2 className="animate-spin" /> : <><Target size={20}/> COMMIT ENTRY</>}
                 </button>
                 <button 
                   type="button"
                   className="w-full py-6 border-4 border-[#141414] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-4 hover:bg-gray-50 transition-all shadow-[6px_6px_0px_0px_rgba(20,20,20,0.05)]"
                 >
                    <Printer size={16} /> PRINT PASS
                 </button>
              </div>
           </div>

           <div className="bg-indigo-600 text-white p-10 shadow-[12px_12px_0px_0px_rgba(79,70,229,0.2)] border-4 border-[#141414] space-y-6">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] italic border-b border-white/10 pb-3">Quick Actions</h4>
              <button 
                type="button"
                className="w-full p-4 border-2 border-white/20 text-left font-black uppercase inline-flex items-center justify-between text-[9px] tracking-widest hover:bg-white/10"
              >
                 Send Welcome SMS <Zap size={14} className="text-amber-300" />
              </button>
              <button 
                 type="button"
                 className="w-full p-4 border-2 border-white/20 text-left font-black uppercase inline-flex items-center justify-between text-[9px] tracking-widest hover:bg-white/10"
              >
                 Schedule Follow-up <Target size={14} />
              </button>
           </div>
        </div>
      </form>
    </div>
  );
}
