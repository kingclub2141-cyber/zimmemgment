import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  Calendar, 
  Tag, 
  Share2,
  Clock,
  Plus,
  MessageSquare,
  Loader2,
  UserPlus,
  Trash2,
  Edit3,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { gym, staff } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [lead, setLead] = useState<any>(null);
  const [followups, setFollowups] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);

  useEffect(() => {
    if (id && gym) fetchLead();
  }, [id, gym]);

  const fetchLead = async () => {
    try {
      const [{ data: leadData }, { data: followupData }] = await Promise.all([
        supabase.from('leads').select('*, lead_sources(name), lead_categories(name, color)').eq('id', id).single(),
        supabase.from('lead_followups').select('*, staff(name)').eq('lead_id', id).order('created_at', { ascending: false })
      ]);
      setLead(leadData);
      setFollowups(followupData || []);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus, converted_at: newStatus === 'Converted' ? new Date().toISOString() : null })
        .eq('id', id);
      if (error) throw error;
      toast.success(`Status updated to ${newStatus}`);
      fetchLead();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin" size={40} /></div>;
  if (!lead) return <div className="p-20 text-center uppercase font-black opacity-20">Lead not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/leads')} className="p-3 border-4 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">{lead.name}</h1>
            <p className="text-xs font-black uppercase tracking-widest opacity-40">Prospect Tracking</p>
          </div>
        </div>
        <div className="flex gap-2">
           {lead.status !== 'Converted' && (
             <Link 
              to={`/members/add?lead_id=${lead.id}`}
              className="px-6 py-4 bg-green-500 text-white border-4 border-[#141414] font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-green-600 transition-all shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
             >
               Convert to Member
             </Link>
           )}
           <button 
            onClick={() => setIsFollowUpModalOpen(true)}
            className="px-6 py-4 bg-[#141414] text-white border-4 border-[#141414] font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-[#141414] transition-all shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
           >
             Log Follow-up
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-8">
           <div className="bg-white border-4 border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] space-y-6">
              <div className="w-20 h-20 bg-[#f5f5f5] border-4 border-[#141414] flex items-center justify-center mx-auto">
                 <Tag size={32} style={{ color: lead.lead_categories?.color }} />
              </div>
              <div className="text-center">
                 <h2 className="text-xl font-black uppercase tracking-tight">{lead.name}</h2>
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">{lead.lead_categories?.name}</p>
              </div>
              <div className="space-y-4 pt-6 border-t-2 border-[#f0f0f0]">
                 <div className="flex items-center gap-3 text-xs font-bold opacity-60"><Phone size={14} /> {lead.phone}</div>
                 <div className="flex items-center gap-3 text-xs font-bold opacity-60"><Mail size={14} /> {lead.email || 'No email provided'}</div>
              </div>
           </div>

           <div className="bg-[#141414] text-white border-4 border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">System Details</h3>
              <div className="space-y-4">
                 <div>
                    <label className="text-[8px] uppercase opacity-40 block mb-1">Source</label>
                    <p className="text-xs font-black uppercase tracking-widest text-blue-400">{lead.lead_sources?.name}</p>
                 </div>
                 <div>
                    <label className="text-[8px] uppercase opacity-40 block mb-1">Status</label>
                    <select 
                      value={lead.status}
                      onChange={e => handleStatusChange(e.target.value)}
                      className="bg-[#141414] text-white border-2 border-white/20 p-2 w-full text-[10px] font-black uppercase outline-none"
                    >
                      <option value="Pending">PENDING</option>
                      <option value="Converted">CONVERTED</option>
                      <option value="Lost">LOST</option>
                    </select>
                 </div>
              </div>
           </div>
        </div>

        <div className="md:col-span-2 space-y-8">
           <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
              <div className="flex border-b-4 border-[#141414]">
                 {['overview', 'followups'].map(tab => (
                   <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all ${
                      activeTab === tab ? 'bg-[#141414] text-white' : 'hover:bg-gray-50'
                    }`}
                   >
                     {tab}
                   </button>
                 ))}
              </div>

              <div className="p-8">
                 {activeTab === 'overview' && (
                   <div className="space-y-8">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                           <MessageSquare size={14} /> Admin Notes
                        </h4>
                        <div className="bg-[#f5f5f5] p-6 border-b-4 border-[#141414] italic text-sm font-bold leading-relaxed">
                           {lead.notes || 'No notes added for this prospect yet.'}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">Areas of interest</h4>
                        <div className="flex flex-wrap gap-2">
                           {lead.interested_in?.map((i: string) => (
                             <span key={i} className="px-3 py-1 bg-white border border-[#141414] text-[9px] font-black uppercase tracking-widest">
                               {i}
                             </span>
                           ))}
                           {(!lead.interested_in || lead.interested_in.length === 0) && (
                             <span className="text-[9px] opacity-20 font-black italic uppercase">Undecided</span>
                           )}
                        </div>
                      </div>

                      <div className="pt-8 border-t-2 border-[#f0f0f0] flex justify-between items-center">
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 text-blue-700 border border-blue-200">
                               <Clock size={20} />
                            </div>
                            <div>
                               <p className="text-[10px] font-black uppercase opacity-40">Last Contact</p>
                               <p className="font-black uppercase text-sm">
                                  {followups.length > 0 ? format(new Date(followups[0].created_at), 'MMMM dd, yyyy') : 'Never Contacted'}
                               </p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-black uppercase opacity-40">Next Step</p>
                            <p className={`font-black uppercase text-sm ${lead.next_followup_date ? 'text-green-600' : 'text-red-500'}`}>
                               {lead.next_followup_date ? format(new Date(lead.next_followup_date), 'MMM dd, yyyy') : 'NO FOLLOW UP SET'}
                            </p>
                         </div>
                      </div>
                   </div>
                 )}

                 {activeTab === 'followups' && (
                   <div className="space-y-6">
                      {followups.length === 0 ? (
                        <div className="text-center py-12 opacity-20 font-black uppercase tracking-[0.2em] text-xs">No follow-up history</div>
                      ) : (
                        <div className="space-y-4">
                           {followups.map((fu, idx) => (
                             <div key={fu.id} className="relative pl-8 pb-8 border-l-4 border-[#f0f0f0] last:pb-0">
                                <div className="absolute -left-[14px] top-0 w-6 h-6 rounded-full bg-[#141414] border-4 border-white flex items-center justify-center">
                                   <div className="w-1 h-1 bg-white rounded-full"></div>
                                </div>
                                <div className="bg-white border-2 border-[#141414] p-6 shadow-[6px_6px_0px_0px_rgba(20,20,20,1)]">
                                   <div className="flex justify-between items-start mb-4">
                                      <div>
                                         <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200">
                                           {fu.followup_type}
                                         </span>
                                         <p className="text-[10px] font-black uppercase opacity-40 mt-1">{format(new Date(fu.followup_date), 'PPPP')}</p>
                                      </div>
                                      <p className="text-[8px] font-black uppercase tracking-widest opacity-40">by {fu.staff?.name || 'Admin'}</p>
                                   </div>
                                   <p className="text-sm font-bold leading-relaxed">{fu.notes}</p>
                                   {fu.next_followup_date && (
                                     <div className="mt-4 pt-4 border-t-2 border-dashed border-[#f0f0f0] flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-green-600">
                                        <ArrowLeft size={12} className="rotate-[135deg]" /> Next Contact: {format(new Date(fu.next_followup_date), 'MMM dd')}
                                     </div>
                                   )}
                                </div>
                             </div>
                           ))}
                        </div>
                      )}
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>

      {isFollowUpModalOpen && (
        <LeadFollowUpModal 
          isOpen={isFollowUpModalOpen} 
          onClose={() => setIsFollowUpModalOpen(false)}
          leadId={id!}
          onSuccess={fetchLead}
        />
      )}
    </div>
  );
}

function LeadFollowUpModal({ isOpen, onClose, leadId, onSuccess }: any) {
  const { gym, staff } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    followup_date: format(new Date(), 'yyyy-MM-dd'),
    followup_type: 'Call',
    notes: '',
    next_followup_date: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error: fuError } = await supabase.from('lead_followups').insert([{
        lead_id: leadId,
        created_by: staff?.id,
        ...formData
      }]);
      if (fuError) throw fuError;

      if (formData.next_followup_date) {
        await supabase.from('leads').update({ next_followup_date: formData.next_followup_date }).eq('id', leadId);
      }

      toast.success('Follow-up logged');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white border-8 border-[#141414] max-w-md w-full shadow-[20px_20px_0px_0px_rgba(20,20,20,1)]">
        <div className="bg-[#141414] p-6 text-white flex justify-between items-center">
          <h2 className="text-xl font-black uppercase tracking-tighter">Record Follow-up</h2>
          <button onClick={onClose}><MessageSquare size={24}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest">Date</label>
                <input required type="date" value={formData.followup_date} onChange={e => setFormData(f => ({ ...f, followup_date: e.target.value }))} className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-3 text-xs font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest">Method</label>
                <select value={formData.followup_type} onChange={e => setFormData(f => ({ ...f, followup_type: e.target.value }))} className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-3 text-xs font-black uppercase">
                  <option value="Call">Phone Call</option>
                  <option value="Visit">Gym Visit</option>
                  <option value="Message">WhatsApp/SMS</option>
                  <option value="Email">Email</option>
                </select>
              </div>
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest">Follow-up Notes</label>
             <textarea required rows={4} value={formData.notes} onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))} className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-4 text-sm font-bold resize-none" placeholder="What was the outcome?" />
           </div>
           <div className="space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest">Set Next Check-in Date</label>
             <input type="date" value={formData.next_followup_date} onChange={e => setFormData(f => ({ ...f, next_followup_date: e.target.value }))} className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-3 text-xs font-bold" />
           </div>
           <button type="submit" disabled={loading} className="w-full py-4 bg-[#141414] text-white font-black uppercase border-4 border-[#141414] hover:bg-white hover:text-[#141414] transition-all">
             {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Log History Point'}
           </button>
        </form>
      </div>
    </div>
  );
}
