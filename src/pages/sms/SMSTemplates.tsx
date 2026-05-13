import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Loader2, 
  MessageSquare,
  ChevronRight,
  Send,
  X,
  Eye,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

export default function SMSTemplates() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (gym) fetchTemplates();
  }, [gym]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sms_templates')
        .select('*')
        .eq('gym_id', gym.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTemplates(data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym) return;

    try {
      setIsSaving(true);
      const payload = {
        gym_id: gym.id,
        template_name: currentTemplate.template_name,
        category: currentTemplate.category,
        message_body: currentTemplate.message_body,
        variables: extractVariables(currentTemplate.message_body),
        is_active: currentTemplate.is_active ?? true
      };

      if (currentTemplate.id) {
        const { error } = await supabase.from('sms_templates').update(payload).eq('id', currentTemplate.id);
        if (error) throw error;
        toast.success('Template updated');
      } else {
        const { error } = await supabase.from('sms_templates').insert([payload]);
        if (error) throw error;
        toast.success('Template created');
      }

      setIsModalOpen(false);
      fetchTemplates();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const extractVariables = (text: string) => {
    const matches = text.match(/\{[^{}]+\}/g);
    return matches ? Array.from(new Set(matches)) : [];
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      const { error } = await supabase.from('sms_templates').delete().eq('id', id);
      if (error) throw error;
      toast.success('Template deleted');
      fetchTemplates();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const categories = ['Welcome', 'Renewal', 'Payment', 'Promotion', 'Diet', 'Birthday', 'Attendance', 'Custom'];

  const filteredTemplates = templates.filter(t => 
    t.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">SMS Blueprints</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Manage your messaging templates</p>
        </div>
        <button 
          onClick={() => {
            setCurrentTemplate({ template_name: '', category: 'Custom', message_body: '', is_active: true });
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-3 bg-[#141414] text-white px-8 py-4 border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]"
        >
          <Plus size={18} /> New Blueprint
        </button>
      </div>

      <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
          <input 
            type="text" 
            placeholder="Search blueprints by name or category..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-12 pr-4 py-3 font-bold outline-none uppercase" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto opacity-20" size={40} /></div>
        ) : filteredTemplates.length === 0 ? (
          <div className="col-span-full py-20 text-center border-4 border-dashed border-[#141414]/10 bg-white">
            <p className="font-black uppercase tracking-widest opacity-20">No blueprints defined yet</p>
          </div>
        ) : filteredTemplates.map(t => (
          <div key={t.id} className="bg-white border-4 border-[#141414] flex flex-col shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all group">
            <div className="p-6 flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <div className="px-3 py-1 bg-[#141414] text-white text-[9px] font-black uppercase tracking-widest">{t.category}</div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setCurrentTemplate(t); setIsModalOpen(true); }} className="p-2 bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100"><Edit2 size={14}/></button>
                  <button onClick={() => handleDelete(t.id)} className="p-2 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"><Trash2 size={14}/></button>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight line-clamp-1">{t.template_name}</h3>
                <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">
                  {t.variables?.length || 0} Dynamic Variables
                </p>
              </div>
              <div className="bg-[#f5f5f5] p-4 text-xs font-medium border-2 border-[#141414]/5 rounded relative min-h-[80px]">
                 <p className="line-clamp-4 leading-relaxed">{t.message_body}</p>
                 <div className="absolute right-2 bottom-2 bg-white/80 p-1 rounded-sm"><MessageSquare size={12} className="opacity-20" /></div>
              </div>
            </div>
            <div className="p-4 bg-[#141414] font-black uppercase tracking-widest text-[9px] flex justify-between items-center text-white/40">
               <span>ID: {t.id.slice(0,8)}</span>
               <div className="flex gap-2">
                 {t.variables?.map((v: string) => (
                   <span key={v} className="text-white/20 border border-white/10 px-1.5">{v}</span>
                 ))}
               </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
           <div className="bg-white border-8 border-[#141414] w-full max-w-2xl shadow-[24px_24px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
              <div className="bg-[#141414] p-8 text-white flex justify-between items-center">
                 <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Configure Blueprint</h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Define messaging structure</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform"><X size={32} /></button>
              </div>
              
              <form onSubmit={handleSave} className="p-10 space-y-8">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Reference Name</label>
                       <input 
                         required
                         type="text" 
                         value={currentTemplate.template_name}
                         onChange={e => setCurrentTemplate({ ...currentTemplate, template_name: e.target.value })}
                         className="w-full bg-[#f5f5f5] border-3 border-[#141414] p-4 font-bold outline-none focus:bg-white transition-colors"
                         placeholder="e.g. Welcome Message"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Category</label>
                       <select 
                         value={currentTemplate.category}
                         onChange={e => setCurrentTemplate({ ...currentTemplate, category: e.target.value })}
                         className="w-full bg-[#f5f5f5] border-3 border-[#141414] p-4 font-bold outline-none appearance-none cursor-pointer"
                       >
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <div className="flex justify-between items-end">
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Message Structure</label>
                       <span className={`text-[10px] font-black ${currentTemplate.message_body.length > 160 ? 'text-amber-600' : 'opacity-40'}`}>
                          {currentTemplate.message_body.length} / 160 Characters
                       </span>
                    </div>
                    <textarea 
                      required
                      value={currentTemplate.message_body}
                      onChange={e => setCurrentTemplate({ ...currentTemplate, message_body: e.target.value })}
                      className="w-full bg-[#f5f5f5] border-3 border-[#141414] p-4 font-bold outline-none min-h-[160px] focus:bg-white transition-colors h-40 resize-none"
                      placeholder="Hi {name}, welcome to {gym_name}!"
                    />
                 </div>

                 <div className="bg-amber-50 border-2 border-amber-200 p-4 flex gap-4">
                    <Info className="text-amber-600 shrink-0" size={20} />
                    <div className="space-y-1">
                       <p className="text-[10px] font-black uppercase text-amber-900 tracking-wider">Dynamic Variables</p>
                       <p className="text-[9px] font-medium text-amber-700 leading-relaxed uppercase">
                         Use brackets for dynamic data: <span className="font-bold">{'{name}'}</span>, <span className="font-bold">{'{member_id}'}</span>, <span className="font-bold">{'{plan}'}</span>, <span className="font-bold">{'{expiry_date}'}</span>, <span className="font-bold">{'{due_amount}'}</span>, <span className="font-bold">{'{gym_name}'}</span>
                       </p>
                    </div>
                 </div>

                 <button 
                  disabled={isSaving}
                  className="w-full py-6 bg-[#141414] text-white font-black uppercase tracking-[0.4em] text-sm flex items-center justify-center gap-3 hover:bg-gray-800 transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,0.2)] active:shadow-none translate-y-0 active:translate-y-2"
                 >
                    {isSaving ? <Loader2 className="animate-spin" /> : <><Plus size={20}/> Deploy Blueprint</>}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
