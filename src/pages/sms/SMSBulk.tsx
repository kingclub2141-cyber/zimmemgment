import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  Filter, 
  Send, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  FileText,
  Calendar,
  Zap,
  Info,
  Clock,
  X
} from 'lucide-react';
import { format, addDays, isValid } from 'date-fns';
import { toast } from 'sonner';
import { safeFormat } from '../../lib/utils';

export default function SMSBulk() {
  const { gym, staff } = useAuth();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [targetMembers, setTargetMembers] = useState<any[]>([]);
  
  const [filterType, setFilterType] = useState('active');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (gym) fetchTemplates();
  }, [gym]);

  useEffect(() => {
    if (gym) fetchTargetMembers();
  }, [gym, filterType]);

  const fetchTemplates = async () => {
    const { data } = await supabase.from('sms_templates').select('*').eq('gym_id', gym.id).eq('is_active', true);
    setTemplates(data || []);
  };

  const fetchTargetMembers = async () => {
    setLoading(true);
    let query = supabase.from('members').select('*').eq('gym_id', gym.id);
    
    const today = new Date().toISOString();
    
    if (filterType === 'active') {
      query = query.eq('status', 'Active');
    } else if (filterType === 'expiring_7') {
      const sevenDays = addDays(new Date(), 7).toISOString();
      query = query.gte('expiry_date', today).lte('expiry_date', sevenDays);
    } else if (filterType === 'expired') {
      query = query.lt('expiry_date', today);
    } else if (filterType === 'due') {
      // In a real app, query based on payments/due logic
      // For now, demo purpose simple query
      query = query.eq('status', 'Active'); 
    }

    const { data } = await query;
    setTargetMembers(data || []);
    setLoading(false);
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplate(template);
    if (template) setMessage(template.message_body);
  };

  const handleBulkSend = async () => {
    if (targetMembers.length === 0) return toast.error('No recipients found');
    if (!message.trim()) return toast.error('Message cannot be empty');

    try {
      setIsSending(true);
      const startTime = Date.now();
      
      // Simulating bulk send logic
      // In production, use a batch insert or server function
      const historyItems = targetMembers.map(m => ({
        gym_id: gym.id,
        member_id: m.id,
        phone: m.phone,
        message: message.replace('{name}', m.name),
        status: 'Sent',
        sent_by: staff?.id,
        provider: 'Bulk Service',
        is_bulk: true
      }));

      const { error } = await supabase.from('sms_history').insert(historyItems);
      if (error) throw error;

      toast.success(`Broadcasting initiated for ${targetMembers.length} members`);
      setMessage('');
      setSelectedTemplate(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-28">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black uppercase tracking-tighter">Campaign Broadcaster</h1>
           <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Reach hundreds of members instantly</p>
        </div>
        <div className="bg-[#141414] text-white px-8 py-5 border-4 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,0.1)] flex items-center gap-6">
           <div className="text-right">
              <p className="text-[10px] font-black uppercase opacity-40">Target Audience</p>
              <p className="text-2xl font-black">{targetMembers.length} RECIPIENTS</p>
           </div>
           <div className="w-12 h-12 bg-white text-[#141414] flex items-center justify-center">
              <Users size={24} />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
         {/* Filter Sidebar */}
         <div className="xl:col-span-1 space-y-6">
            <div className="bg-white border-4 border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
               <h3 className="text-xs font-black uppercase tracking-widest border-b-2 border-[#141414] pb-4 mb-6 flex items-center gap-2">
                  <Filter size={14} /> Filter Segment
               </h3>
               <div className="space-y-2">
                  {[
                    { id: 'active', label: 'All Active Members', icon: <Zap size={14}/> },
                    { id: 'expiring_7', label: 'Expiring in 7 Days', icon: <Clock size={14}/> },
                    { id: 'expired', label: 'Expired Members', icon: <AlertCircle size={14}/> },
                    { id: 'due', label: 'With Dues Outstanding', icon: <Calendar size={14}/> }
                  ].map(filter => (
                    <button 
                      key={filter.id}
                      onClick={() => setFilterType(filter.id)}
                      className={`w-full p-4 text-left border-2 font-black uppercase text-[10px] tracking-widest flex items-center gap-3 transition-all ${
                        filterType === filter.id ? 'bg-[#141414] text-white border-[#141414]' : 'bg-white border-[#141414]/10 hover:border-[#141414]'
                      }`}
                    >
                       {filter.icon}
                       {filter.label}
                    </button>
                  ))}
               </div>
            </div>

            <div className="bg-indigo-600 text-white p-8 border-4 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
               <Info size={24} className="mb-4 opacity-40" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2">Cost Estimate</p>
               <p className="text-2xl font-black mb-1">₹{(targetMembers.length * 0.2).toFixed(2)}</p>
               <p className="text-[8px] font-bold opacity-60 uppercase">Calculated @ ₹0.20 per SMS</p>
            </div>
         </div>

         {/* Composer Area */}
         <div className="xl:col-span-3 space-y-10">
            <div className="bg-white border-4 border-[#141414] p-10 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] flex flex-col gap-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Load Blueprint</label>
                     <select 
                       onChange={e => handleTemplateSelect(e.target.value)}
                       className="w-full bg-[#f5f5f5] border-3 border-[#141414] p-5 font-black uppercase text-xs appearance-none outline-none"
                     >
                        <option value="">Manual Entry / Custom</option>
                        {templates.map(t => (
                          <option key={t.id} value={t.id}>{t.category}: {t.template_name}</option>
                        ))}
                     </select>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-end">
                     <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Message Content</label>
                     <div className="flex gap-4">
                        {['{name}', '{plan}', '{expiry_date}'].map(tag => (
                          <span key={tag} className="text-[9px] font-black border border-[#141414] px-1 bg-white opacity-40">{tag}</span>
                        ))}
                     </div>
                  </div>
                  <textarea 
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Broadcast message text..."
                    className="w-full h-48 bg-[#f5f5f5] border-3 border-[#141414] p-8 font-bold text-xl outline-none focus:bg-white transition-all resize-none"
                  />
               </div>

               <div className="bg-[#141414] text-white p-10 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="space-y-1 text-center md:text-left">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Final Confirmation</p>
                     <h4 className="text-2xl font-black uppercase italic">Ready to Push to {targetMembers.length} Devices?</h4>
                  </div>
                  <button 
                    disabled={isSending || targetMembers.length === 0 || !message}
                    onClick={handleBulkSend}
                    className="w-full md:w-auto px-12 py-6 bg-white text-[#141414] font-black uppercase tracking-[0.4em] text-sm flex items-center justify-center gap-4 hover:invert transition-all shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] disabled:opacity-50"
                  >
                     {isSending ? <Loader2 className="animate-spin" /> : <><Zap size={24} /> LAUNCH CAMPAIGN</>}
                  </button>
               </div>
            </div>

            {/* Recipients Table Preview */}
            <div className="bg-white border-4 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
               <div className="p-6 border-b-4 border-[#141414] flex justify-between items-center">
                  <h3 className="font-black uppercase tracking-widest text-xs">Recipient Preview List</h3>
                  <span className="text-[9px] font-black border border-[#141414] px-2 py-0.5 uppercase">{filterType.replace('_', ' ')}</span>
               </div>
               <div className="max-h-96 overflow-y-auto">
                  <table className="w-full border-collapse">
                     <thead className="bg-[#f5f5f5] sticky top-0">
                        <tr className="text-[10px] font-black uppercase tracking-widest text-left border-b-2 border-[#141414]">
                           <th className="p-4">Name</th>
                           <th className="p-4">Phone</th>
                           <th className="p-4">Status</th>
                           <th className="p-4">Plan Expiry</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-[#141414]/10 text-[11px] font-bold">
                        {loading ? (
                          <tr><td colSpan={4} className="p-10 text-center"><Loader2 className="animate-spin mx-auto opacity-20" /></td></tr>
                        ) : targetMembers.map(m => (
                          <tr key={m.id} className="hover:bg-gray-50">
                             <td className="p-4 uppercase">{m.name}</td>
                             <td className="p-4 font-mono">{m.phone}</td>
                             <td className="p-4 uppercase">{m.status}</td>
                             <td className="p-4 opacity-60 italic">{safeFormat(m.expiry_date, 'dd MMM yyyy')}</td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
