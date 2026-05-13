import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, Loader2, User, Smartphone, Mail, Clock, Zap, UserPlus, LogOut, 
  Trash2, Edit2, CheckCircle2, Printer, History, Target, MessageSquare, AlertCircle, Star 
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';

export default function VisitorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [visitor, setVisitor] = useState<any>(null);
  const [isCheckOutModalOpen, setIsCheckOutModalOpen] = useState(false);
  const [feedback, setFeedback] = useState({ rating: 5, comments: '', interested: 'Yes' });
  const [visitHistory, setVisitHistory] = useState<any[]>([]);
  const passRef = useRef<HTMLDivElement>(null);

  useEffect(() => { id && fetchVisitorData(); }, [id]);

  const fetchVisitorData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('visitors').select('*, staff:staff_assigned (name)').eq('id', id).single();
      if (error) throw error;
      setVisitor(data);
      const { data: history } = await supabase.from('visitors').select('*').eq('phone', data.phone).neq('id', id).order('created_at', { ascending: false });
      setVisitHistory(history || []);
    } catch (error: any) { toast.error(error.message); } finally { setLoading(false); }
  };

  const handleCheckOut = async () => {
    try {
      await supabase.from('visitors').update({ time_out: new Date().toISOString(), status: 'Completed', notes: (visitor.notes || '') + '\nFEEDBACK: ' + feedback.comments }).eq('id', id);
      await supabase.from('visitor_feedback').insert([{ visitor_id: id, rating: feedback.rating, feedback: feedback.comments, interested: feedback.interested === 'Yes' }]);
      toast.success('Visitor protocol completed');
      setIsCheckOutModalOpen(false); fetchVisitorData();
    } catch (error: any) { toast.error(error.message); }
  };

  const convertToLead = async () => {
    try {
      const { data: lead } = await supabase.from('leads').insert([{ gym_id: gym.id, name: visitor.name, phone: visitor.phone, email: visitor.email, source: 'Walk-in', status: 'New' }]).select().single();
      await supabase.from('visitors').update({ status: 'Converted to Lead', converted_to_lead_id: lead.id }).eq('id', id);
      toast.success('Promoted to Lead'); navigate(`/leads/${lead.id}`);
    } catch (error: any) { toast.error(error.message); }
  };

  const downloadPass = async () => {
    if (!passRef.current) return;
    const canvas = await html2canvas(passRef.current);
    const link = document.createElement('a');
    link.download = `Pass_${visitor.name}.png`;
    link.href = canvas.toDataURL(); link.click();
  };

  if (loading) return <div className="min-h-[400px] flex items-center justify-center"><Loader2 className="animate-spin opacity-20" size={48} /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in pb-28">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b-8 border-[#141414] pb-12">
        <div className="flex items-center gap-8">
          <button onClick={() => navigate('/visitors')} className="p-4 bg-white border-4 border-[#141414] hover:invert transition-all shadow-[6px_6px_0px_0px_rgba(20,20,20,1)]"><ArrowLeft size={24}/></button>
          <div className="space-y-1">
            <h1 className="text-5xl font-black uppercase tracking-tighter">{visitor.name}</h1>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 italic">ID: {visitor.id.substring(0,8)}</span>
          </div>
        </div>
        <div className="flex gap-4">
          {!visitor.time_out && <button onClick={() => setIsCheckOutModalOpen(true)} className="bg-[#141414] text-white px-8 py-5 border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:invert transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,0.1)]">Check Out</button>}
          <button onClick={downloadPass} className="p-5 border-4 border-[#141414] bg-white hover:bg-gray-50 shadow-[6px_6px_0px_0px_rgba(20,20,20,1)]"><Printer size={20}/></button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          <div className="bg-white border-8 border-[#141414] p-12 shadow-[24px_24px_0px_0px_rgba(20,20,20,1)] grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-10">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-40 border-b-2 border-[#141414] pb-4">Info Interface</h3>
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-[#141414] text-white flex items-center justify-center font-black text-xl italic">#</div>
                <div><p className="text-[10px] font-black uppercase opacity-40">Phone</p><p className="font-black font-mono text-lg">{visitor.phone}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase opacity-40">In</span>
                  <p className="font-black text-lg italic">{format(new Date(visitor.created_at), 'HH:mm')}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase opacity-40">Out</span>
                  <p className="font-black text-lg italic">{visitor.time_out ? format(new Date(visitor.time_out), 'HH:mm') : 'Active'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-10">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-40 border-b-2 border-[#141414] pb-4">Dynamics</h3>
              <div className="bg-[#141414] text-white p-6 italic">
                <p className="text-[8px] font-black uppercase text-white/40 mb-1">Purpose</p>
                <h4 className="text-2xl font-black uppercase italic tracking-tighter">{visitor.purpose}</h4>
              </div>
              <div className="p-6 border-4 border-[#141414] border-dashed">
                 <p className="text-[8px] font-black uppercase opacity-40 mb-1">Liaison</p>
                 <p className="font-black uppercase tracking-widest text-sm">{visitor.staff?.name || 'Reception'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border-8 border-[#141414] p-12 shadow-[24px_24px_0px_0px_rgba(20,20,20,1)] space-y-8">
            <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-4"><History opacity={0.4}/> History</h2>
            {visitHistory.length === 0 ? <p className="opacity-20 uppercase text-[10px] font-black tracking-widest text-center py-10">Initial Entry</p> : visitHistory.map((h, i) => (
              <div key={i} className="flex justify-between p-6 border-2 border-[#141414]/5 hover:bg-gray-50 uppercase text-[10px] items-center">
                <span className="font-black italic">{format(new Date(h.created_at), 'dd MMM yyyy')}</span>
                <span className="font-black opacity-40">{h.purpose}</span>
                <span className="font-black">{h.status}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-4 space-y-12">
          <div className="bg-[#141414] text-white p-12 shadow-[16px_16px_0px_0px_rgba(20,20,20,0.1)] border-4 border-[#141414] space-y-10">
             <h3 className="text-2xl font-black uppercase italic tracking-tighter border-b border-white/10 pb-4">Promote</h3>
             <button onClick={convertToLead} className="w-full py-6 bg-white text-[#141414] font-black uppercase tracking-[0.4em] text-[10px] hover:invert transition-all flex items-center justify-center gap-4 active:shadow-none translate-y-0 active:translate-y-1">Convert to Lead</button>
             <button onClick={() => navigate('/members/add', { state: { prefill: visitor } })} className="w-full py-6 bg-indigo-500 text-white font-black uppercase tracking-[0.4em] text-[10px] hover:bg-indigo-600 transition-all flex items-center justify-center gap-4 shadow-[8px_8px_0px_0px_rgba(99,102,241,0.2)]">Forge Member</button>
          </div>
          <div ref={passRef} className="bg-white border-8 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-8">
             <div className="flex justify-between items-center"><div className="bg-[#141414] text-white px-4 py-2 font-black italic text-sm">ELITE_PASS</div><span className="text-[8px] font-black uppercase opacity-40 italic">#VISITOR</span></div>
             <div className="py-6 border-y-2 border-[#141414]/10 space-y-4">
                <div><p className="text-[8px] font-black uppercase opacity-40 italic mb-1">Subject</p><p className="text-2xl font-black uppercase tracking-tighter leading-tight">{visitor.name}</p></div>
                <div className="text-[8px] font-black uppercase opacity-40 italic">Valid: {format(new Date(), 'dd MMM yyyy')}</div>
             </div>
             <div className="flex justify-center"><div className="w-24 h-24 border-2 border-[#141414] flex items-center justify-center p-2 opacity-10"><Target size={60}/></div></div>
          </div>
        </div>
      </div>

      {isCheckOutModalOpen && (
        <div className="fixed inset-0 bg-[#E4E3E0]/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white border-8 border-[#141414] w-full max-w-lg p-12 shadow-[40px_40px_0px_0px_rgba(20,20,20,0.1)] space-y-10">
            <h3 className="text-3xl font-black uppercase tracking-tighter italic border-b-4 border-[#141414] pb-6">Exit protocol</h3>
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Intelligence Rating</label>
                <div className="flex gap-4">
                  {[1,2,3,4,5].map(s => <button key={s} onClick={() => setFeedback({...feedback, rating: s})} className={`w-12 h-12 border-4 ${feedback.rating >= s ? 'bg-[#141414] text-white border-[#141414]' : 'bg-white border-[#141414]/10'}`}><Star size={20} fill={feedback.rating >= s ? 'currentColor' : 'none'}/></button>)}
                </div>
              </div>
              <textarea value={feedback.comments} onChange={e => setFeedback({...feedback, comments: e.target.value})} className="w-full bg-[#f5f5f5] border-3 border-[#141414] p-5 font-black text-xs h-32 outline-none" placeholder="Feedback..."/>
              <button onClick={handleCheckOut} className="w-full py-6 bg-[#141414] text-white font-black uppercase tracking-widest text-[10px] hover:invert flex items-center justify-center gap-3">Execute Exit <LogOut size={16}/></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
