import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  Trash2, 
  Loader2,
  Utensils,
  ArrowLeft,
  Save,
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Printer
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function MemberDietPlans() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { gym, staff } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<any>(null);
  const [memberPlans, setMemberPlans] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [otherMembers, setOtherMembers] = useState<any[]>([]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [formData, setFormData] = useState({
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    notes: '',
    meals: [] as any[]
  });

  useEffect(() => {
    if (memberId && gym) fetchData();
  }, [memberId, gym]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [memberRes, plansRes, templatesRes] = await Promise.all([
        supabase.from('members').select('*').eq('id', memberId).single(),
        supabase.from('member_diet_plans').select('*').eq('member_id', memberId).order('created_at', { ascending: false }),
        supabase.from('diet_templates').select('*').eq('gym_id', gym.id)
      ]);

      if (memberRes.error) throw memberRes.error;
      setMember(memberRes.data);
      setMemberPlans(plansRes.data || []);
      setTemplates(templatesRes.data || []);

      // Fetch other members for "Copy" feature
      const { data: otherMembersData } = await supabase
        .from('members')
        .select('id, name')
        .neq('id', memberId)
        .eq('gym_id', gym.id)
        .order('name');
      setOtherMembers(otherMembersData || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        meals: template.meals || []
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase.from('member_diet_plans').insert([{
        member_id: memberId,
        gym_id: gym.id,
        created_by: staff?.id,
        ...formData,
        status: 'Active'
      }]);

      if (error) throw error;
      toast.success('Diet plan assigned to member');
      setShowAddForm(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = async (id: string) => {
    if (!confirm('Cancel this diet plan?')) return;
    try {
      const { error } = await supabase.from('member_diet_plans').delete().eq('id', id);
      if (error) throw error;
      toast.success('Plan removed');
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const copyDietFromMember = async (sourceMemberId: string) => {
    try {
      setLoading(true);
      const { data: sourcePlan, error } = await supabase
        .from('member_diet_plans')
        .select('*')
        .eq('member_id', sourceMemberId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          toast.error('Source member has no diet plans to copy');
          return;
        }
        throw error;
      }

      setFormData(prev => ({
        ...prev,
        meals: sourcePlan.meals || [],
        notes: `Copied from ${otherMembers.find(m => m.id === sourceMemberId)?.name}. ${sourcePlan.notes || ''}`
      }));
      setShowCopyModal(false);
      setShowAddForm(true);
      toast.success('Diet plan loaded from member. Review and activate.');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !member) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/members/${memberId}`)} className="p-3 border-4 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Diet Management</h1>
            <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Client: {member?.name}</p>
          </div>
        </div>
        {!showAddForm && (
          <div className="flex gap-4">
            <button 
              onClick={() => setShowCopyModal(true)}
              className="flex items-center justify-center gap-3 bg-white text-[#141414] px-8 py-4 border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-[#141414] hover:text-white transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]"
            >
              Copy Diet
            </button>
            <button 
              onClick={() => setShowAddForm(true)}
              className="flex items-center justify-center gap-3 bg-[#141414] text-white px-8 py-4 border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]"
            >
              <Plus size={18} /> Prescribe New Plan
            </button>
          </div>
        )}
      </div>

      {showCopyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#141414]/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border-8 border-[#141414] p-8 shadow-[16px_16px_0px_0px_rgba(20,20,20,0.5)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black uppercase tracking-tighter">Clone Nutrition Plan</h2>
              <button 
                onClick={() => setShowCopyModal(false)}
                className="p-1 hover:rotate-90 transition-transform"
              >
                <XCircle size={24} />
              </button>
            </div>
            <p className="text-[10px] font-black uppercase opacity-40 mb-6">Select a member to copy their most recent active diet regimen.</p>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {otherMembers.map(m => (
                <button 
                  key={m.id}
                  onClick={() => copyDietFromMember(m.id)}
                  className="w-full p-4 text-left border-2 border-[#141414]/10 hover:border-[#141414] hover:bg-gray-50 flex items-center justify-between group transition-all"
                >
                  <span className="text-sm font-black uppercase">{m.name}</span>
                  <ArrowLeft size={16} className="opacity-0 group-hover:opacity-100 rotate-180 transition-opacity" />
                </button>
              ))}
              {otherMembers.length === 0 && <p className="text-center py-10 opacity-20 font-black uppercase italic">No other members discovered</p>}
            </div>
            <button 
              onClick={() => setShowCopyModal(false)}
              className="w-full mt-8 py-4 bg-[#141414] text-white font-black uppercase tracking-widest text-[10px]"
            >
              Close Interface
            </button>
          </div>
        </div>
      )}

      {showAddForm ? (
        <div className="space-y-8 animate-in slide-in-from-bottom-8">
           <div className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
              <div className="flex justify-between items-center mb-8 border-b-4 border-[#141414] pb-4">
                 <h2 className="text-xl font-black uppercase tracking-tighter">Nutrition Prescription</h2>
                 <button onClick={() => setShowAddForm(false)} className="text-[10px] font-black uppercase border-2 border-[#141414] px-4 py-2 hover:bg-gray-100 italic">Cancel</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest">Base Template</label>
                          <select 
                            value={selectedTemplate}
                            onChange={e => handleTemplateSelect(e.target.value)}
                            className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-black uppercase outline-none"
                          >
                             <option value="">CUSTOM PLAN (NO TEMPLATE)</option>
                             {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                          </select>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest">Start Date</label>
                            <input required type="date" value={formData.start_date} onChange={e => setFormData(f => ({ ...f, start_date: e.target.value }))} className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-black outline-none" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest">End Date</label>
                            <input required type="date" value={formData.end_date} onChange={e => setFormData(f => ({ ...f, end_date: e.target.value }))} className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-black outline-none" />
                          </div>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest">Prescriber Notes</label>
                       <textarea 
                        rows={6}
                        value={formData.notes}
                        onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
                        className="w-full h-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-bold outline-none resize-none"
                        placeholder="Specific hydration notes, supplements, or exclusions..."
                       />
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                       <Utensils size={18} /> Meal Structure
                    </h3>
                    <div className="space-y-4">
                       {formData.meals.map((meal, index) => (
                         <div key={index} className="bg-[#f5f5f5] border-2 border-[#141414] p-6 flex gap-8 items-start group">
                            <div className="min-w-[100px] space-y-2">
                               <label className="text-[8px] font-black uppercase opacity-40">Timing</label>
                               <input 
                                type="text"
                                value={meal.time}
                                onChange={e => {
                                  const newMeals = [...formData.meals];
                                  newMeals[index].time = e.target.value;
                                  setFormData(f => ({ ...f, meals: newMeals }));
                                }}
                                className="bg-white border-2 border-[#141414] p-2 w-full text-[10px] font-black uppercase"
                               />
                            </div>
                            <div className="flex-1 space-y-4">
                               <input 
                                type="text"
                                value={meal.name}
                                onChange={e => {
                                  const newMeals = [...formData.meals];
                                  newMeals[index].name = e.target.value;
                                  setFormData(f => ({ ...f, meals: newMeals }));
                                }}
                                className="bg-transparent text-lg font-black uppercase outline-none w-full"
                               />
                               <textarea 
                                value={meal.items}
                                onChange={e => {
                                  const newMeals = [...formData.meals];
                                  newMeals[index].items = e.target.value;
                                  setFormData(f => ({ ...f, meals: newMeals }));
                                }}
                                rows={2}
                                className="w-full bg-white border-2 border-[#141414] p-3 text-sm font-bold outline-none"
                               />
                            </div>
                            <button 
                              type="button" 
                              onClick={() => setFormData(f => ({ ...f, meals: f.meals.filter((_, i) => i !== index) }))}
                              className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                               <Trash2 size={20} />
                            </button>
                         </div>
                       ))}
                       <button 
                        type="button" 
                        onClick={() => setFormData(f => ({ ...f, meals: [...f.meals, { name: 'Add Meal Name', time: '00:00 AM', items: '' }] }))}
                        className="w-full py-4 border-2 border-dashed border-[#141414] font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 flex items-center justify-center gap-2"
                       >
                          <Plus size={16} /> Add Meal Slot
                       </button>
                    </div>
                 </div>

                 <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 bg-[#141414] text-white border-4 border-[#141414] font-black uppercase tracking-[0.4em] text-sm hover:bg-white hover:text-[#141414] transition-all shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]"
                 >
                   {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Activate Member Diet Plan</>}
                 </button>
              </form>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-1 space-y-8">
              <div className="bg-white border-4 border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-6 border-b-2 border-[#f0f0f0] pb-2">Active Regimen</h3>
                 {memberPlans.some(p => p.status === 'Active') ? (
                   <div className="space-y-6">
                      <div className="flex items-center gap-4 text-green-600">
                         <CheckCircle2 size={32} />
                         <div>
                            <p className="text-xl font-black uppercase tracking-tight">On Track</p>
                            <p className="text-[10px] font-bold opacity-40 uppercase">Phase currently active</p>
                         </div>
                      </div>
                      <div className="space-y-4 pt-6 border-t-2 border-[#f0f0f0]">
                         <div className="flex items-center justify-between text-xs font-bold">
                            <span className="opacity-40">Start Date</span>
                            <span>{format(new Date(memberPlans.find(p => p.status === 'Active').start_date), 'MMMM dd')}</span>
                         </div>
                         <div className="flex items-center justify-between text-xs font-bold">
                            <span className="opacity-40">Duration</span>
                            <span>30 Days Cycle</span>
                         </div>
                      </div>
                      <button className="w-full py-3 bg-[#141414] text-white border-2 border-[#141414] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                         <Printer size={16} /> Generate Handout
                      </button>
                   </div>
                 ) : (
                   <div className="text-center py-12 opacity-20">
                      <Utensils size={48} className="mx-auto mb-4" />
                      <p className="text-[10px] font-black uppercase italic">No active diet plan</p>
                   </div>
                 )}
              </div>
           </div>

           <div className="lg:col-span-2 space-y-8">
              <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
                 <div className="bg-[#141414] text-white p-6 font-black uppercase tracking-widest text-xs flex items-center gap-2">
                    <History size={16} /> Prescription History
                 </div>
                 <div className="divide-y-2 divide-[#141414]">
                    {memberPlans.length === 0 ? (
                      <div className="p-20 text-center opacity-20 font-black uppercase italic">History is empty</div>
                    ) : (
                      memberPlans.map((p) => (
                        <div key={p.id} className="p-8 hover:bg-[#f5f5f5] transition-all group">
                           <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-4">
                                 <div className={`p-2 border-2 border-[#141414] ${p.status === 'Active' ? 'bg-green-100' : 'opacity-40'}`}>
                                    <FileText size={24} />
                                 </div>
                                 <div>
                                    <p className="text-sm font-black uppercase tracking-tight">Prescription Cycle</p>
                                    <p className="text-[10px] font-bold opacity-40">{format(new Date(p.created_at), 'MMMM dd, yyyy')}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3">
                                 <span className={`text-[8px] font-black uppercase px-2 py-0.5 border ${
                                   p.status === 'Active' ? 'bg-green-500 text-white border-[#141414]' : 'bg-gray-100 opacity-40 border-gray-300'
                                 }`}>
                                   {p.status}
                                 </span>
                                 <button onClick={() => deletePlan(p.id)} className="p-2 border-2 border-[#141414] text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 size={16} />
                                 </button>
                              </div>
                           </div>
                           <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
                              {p.meals?.slice(0, 5).map((m: any, idx: number) => (
                                <div key={idx} className="p-3 bg-white border border-[#141414] text-center space-y-1">
                                   <p className="text-[8px] font-black uppercase opacity-40">{m.time}</p>
                                   <p className="text-[10px] font-black uppercase truncate">{m.name}</p>
                                </div>
                              ))}
                           </div>
                        </div>
                      ))
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
