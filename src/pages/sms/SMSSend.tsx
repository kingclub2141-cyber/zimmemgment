import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Send, 
  User, 
  MessageSquare,
  Search,
  Loader2,
  CheckCircle2,
  Clock,
  ChevronDown,
  AlertCircle,
  Eye,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function SMSSend() {
  const { gym, staff } = useAuth();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (gym) fetchData();
  }, [gym]);

  const fetchData = async () => {
    const [memRes, tempRes] = await Promise.all([
      supabase.from('members').select('*').eq('gym_id', gym.id).order('name'),
      supabase.from('sms_templates').select('*').eq('gym_id', gym.id).eq('is_active', true)
    ]);
    setMembers(memRes.data || []);
    setTemplates(tempRes.data || []);
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplate(template);
    if (template && selectedMember) {
      setMessage(replaceVariables(template.message_body, selectedMember));
    } else if (template) {
      setMessage(template.message_body);
    }
  };

  const replaceVariables = (text: string, member: any) => {
    let result = text;
    const vars: any = {
      '{name}': member.name,
      '{member_id}': member.member_id,
      '{phone}': member.phone,
      '{gym_name}': gym.name,
      '{expiry_date}': member.expiry_date ? format(new Date(member.expiry_date), 'dd/MM/yyyy') : 'N/A',
      '{due_amount}': '0', // In real app, fetch from calculations
    };

    Object.keys(vars).forEach(key => {
      result = result.replaceAll(key, vars[key]);
    });
    return result;
  };

  const handleSend = async () => {
    if (!selectedMember) return toast.error('Please select a recipient');
    if (!message.trim()) return toast.error('Message body cannot be empty');

    try {
      setIsSending(true);
      
      // 1. Log to history
      const { error } = await supabase.from('sms_history').insert([{
        gym_id: gym.id,
        member_id: selectedMember.id,
        phone: selectedMember.phone,
        message: message,
        status: 'Sent',
        sent_by: staff?.id,
        provider: 'Demo' // Hardcoded for demo
      }]);

      if (error) throw error;
      
      toast.success('Message sent successfully!');
      setMessage('');
      setSelectedMember(null);
      setSelectedTemplate(null);
      setSearch('');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSending(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.phone.includes(search)
  ).slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500 pb-28">
      <div className="flex justify-between items-center bg-[#141414] text-white p-12 shadow-[12px_12px_0px_0px_rgba(20,20,20,0.1)]">
         <div className="space-y-2">
            <h1 className="text-4xl font-black uppercase tracking-tighter">Direct Connect</h1>
            <p className="text-sm font-black uppercase tracking-[0.3em] opacity-40">Send instant updates to members</p>
         </div>
         <div className="p-4 border-2 border-white/20">
            <MessageSquare size={32} />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         {/* Left Side: Composer */}
         <div className="lg:col-span-12 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               {/* Step 1: Member Selection */}
               <div className="bg-white border-4 border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] space-y-6">
                  <div className="flex items-center gap-3 border-b-2 border-[#141414] pb-4">
                     <span className="w-8 h-8 rounded-full bg-[#141414] text-white flex items-center justify-center font-black">1</span>
                     <h2 className="text-xl font-black uppercase tracking-tight">Select Member</h2>
                  </div>

                  <div className="relative">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={18} />
                     <input 
                      type="text" 
                      placeholder="Search by name/phone..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-10 pr-4 py-3 font-bold uppercase text-sm outline-none"
                     />
                  </div>

                  {search && !selectedMember && (
                    <div className="border-2 border-[#141414] divide-y-2 divide-[#141414] overflow-hidden">
                       {filteredMembers.map(m => (
                         <button 
                          key={m.id}
                          onClick={() => {
                            setSelectedMember(m);
                            setSearch('');
                          }}
                          className="w-full p-4 text-left hover:bg-gray-50 flex justify-between items-center group transition-all"
                         >
                            <div>
                               <p className="font-black uppercase text-sm">{m.name}</p>
                               <p className="text-[10px] font-bold opacity-40">{m.phone}</p>
                            </div>
                            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                         </button>
                       ))}
                    </div>
                  )}

                  {selectedMember && (
                    <div className="bg-green-50 border-2 border-green-600 p-6 flex justify-between items-center">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-600 text-white flex items-center justify-center font-black">
                             {selectedMember.name.substring(0,2).toUpperCase()}
                          </div>
                          <div>
                             <p className="font-black uppercase tracking-tight">{selectedMember.name}</p>
                             <p className="text-[10px] font-bold opacity-40 uppercase">{selectedMember.phone}</p>
                          </div>
                       </div>
                       <button onClick={() => setSelectedMember(null)} className="text-[9px] font-black uppercase underline hover:text-red-600">Change</button>
                    </div>
                  )}
               </div>

               {/* Step 2: Template Selection */}
               <div className="bg-white border-4 border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] space-y-6">
                  <div className="flex items-center gap-3 border-b-2 border-[#141414] pb-4">
                     <span className="w-8 h-8 rounded-full bg-[#141414] text-white flex items-center justify-center font-black">2</span>
                     <h2 className="text-xl font-black uppercase tracking-tight">Select Template</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                     <select 
                      onChange={e => handleTemplateSelect(e.target.value)}
                      className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-4 font-black uppercase text-xs appearance-none cursor-pointer outline-none"
                     >
                        <option value="">Start from Scratch</option>
                        {templates.map(t => (
                          <option key={t.id} value={t.id}>{t.category} - {t.template_name}</option>
                        ))}
                     </select>
                  </div>

                  <div className="bg-[#141414]/5 border-2 border-dashed border-[#141414]/10 p-6 space-y-3">
                     <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Dynamic Hints</p>
                     <div className="flex flex-wrap gap-2">
                        {['{name}', '{member_id}', '{plan}', '{expiry_date}', '{due_amount}'].map(tag => (
                          <span key={tag} className="text-[10px] font-black bg-white border border-[#141414] px-2 py-0.5">{tag}</span>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* Step 3: Message Body */}
            <div className="bg-white border-4 border-[#141414] p-10 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-8">
               <div className="flex justify-between items-center border-b-2 border-[#141414] pb-6">
                  <div className="flex items-center gap-4">
                     <span className="w-10 h-10 rounded-full bg-[#141414] text-white flex items-center justify-center font-black text-xl">3</span>
                     <h2 className="text-3xl font-black uppercase tracking-tighter">Draft Message</h2>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black uppercase opacity-40">Length: </span>
                     <span className={`text-xl font-black ${message.length > 160 ? 'text-red-600 underline decoration-wavy' : ''}`}>{message.length}</span>
                     <span className="text-xs font-bold opacity-40">/ 160</span>
                  </div>
               </div>

               <textarea 
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Type your message here or select a blueprint above..."
                className="w-full min-h-[240px] bg-white border-4 border-[#141414] p-8 font-bold text-lg outline-none focus:bg-gray-50 transition-colors resize-none"
               />

               <div className="flex flex-col md:flex-row gap-6 pt-4">
                  <div className="flex-1 p-6 bg-indigo-50 border-2 border-indigo-200 flex gap-4">
                     <Eye className="text-indigo-600 shrink-0" size={24} />
                     <div>
                        <p className="text-[10px] font-black uppercase text-indigo-900 tracking-widest mb-1">Live Preview</p>
                        <p className="text-sm font-medium italic opacity-60">"{(selectedMember ? replaceVariables(message, selectedMember) : message) || 'Message preview will appear here...'}"</p>
                     </div>
                  </div>
                  <button 
                   disabled={isSending || !selectedMember || !message}
                   onClick={handleSend}
                   className="md:w-64 py-8 bg-[#141414] text-white font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-gray-800 transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,0.2)] disabled:opacity-50 disabled:grayscale translate-y-0 active:translate-y-2 active:shadow-none"
                  >
                     {isSending ? <Loader2 className="animate-spin" /> : <><Send size={24} /> DISPATCH</>}
                  </button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
