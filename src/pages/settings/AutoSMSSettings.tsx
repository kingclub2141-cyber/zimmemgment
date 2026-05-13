import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Zap, 
  Clock, 
  Calendar, 
  Save, 
  Loader2, 
  MessageSquare, 
  ShieldCheck, 
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Settings2,
  ToggleLeft as Toggle,
  BellRing,
  Timer,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

export default function AutoSMSSettings() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  
  const [settings, setSettings] = useState({
    is_enabled: false,
    before_expiry_days: [15, 7, 1],
    after_expiry_days: [1, 5],
    send_time: '10:00:00',
    template_before_expiry: '',
    template_after_expiry: ''
  });

  useEffect(() => {
    if (gym) fetchData();
  }, [gym]);

  const fetchData = async () => {
    setLoading(true);
    const [settRes, tempRes] = await Promise.all([
      supabase.from('auto_sms_settings').select('*').eq('gym_id', gym.id).single(),
      supabase.from('sms_templates').select('*').eq('gym_id', gym.id).eq('is_active', true)
    ]);
    
    if (settRes.data) setSettings(settRes.data);
    setTemplates(tempRes.data || []);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const { error } = await supabase.from('auto_sms_settings').upsert({
        gym_id: gym.id,
        ...settings,
        updated_at: new Date().toISOString()
      }, { onConflict: 'gym_id' });
      
      if (error) throw error;
      toast.success('Automation protocol synchronized');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDay = (day: number, type: 'before' | 'after') => {
    const key = type === 'before' ? 'before_expiry_days' : 'after_expiry_days';
    const current = [...(settings[key] as number[])];
    if (current.includes(day)) {
      setSettings({ ...settings, [key]: current.filter(d => d !== day) });
    } else {
      setSettings({ ...settings, [key]: [...current, day].sort((a,b) => b-a) });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-8 border-[#141414] pb-12">
        <div className="flex items-center gap-6">
           <div className="p-4 bg-[#141414] text-white shadow-[6px_6px_0px_0px_rgba(20,20,20,0.2)]">
              <Zap size={32} />
           </div>
           <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter">Event Automations</h1>
              <p className="text-sm font-black uppercase tracking-[0.4em] opacity-40">Scheduled messaging protocols</p>
           </div>
        </div>
        <div className="flex items-center gap-4 bg-white border-4 border-[#141414] p-4">
           <span className="text-[10px] font-black uppercase tracking-widest">Master Switch</span>
           <button 
             onClick={() => setSettings({ ...settings, is_enabled: !settings.is_enabled })}
             className={`w-14 h-8 transition-all p-1 flex items-center ${settings.is_enabled ? 'bg-green-600 justify-end' : 'bg-gray-200 justify-start'}`}
           >
              <div className="w-6 h-6 bg-white shadow-sm border border-[#141414]/10" />
           </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-12">
         {/* Phase 1: Reminders Before Expiry */}
         <div className="bg-white border-4 border-[#141414] p-10 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-8">
            <div className="flex items-center gap-3 border-b-2 border-[#141414] pb-6">
               <BellRing className="opacity-40" />
               <h2 className="text-xl font-black uppercase tracking-tight">Pre-Expiry Sequence</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Trigger Days (Before Expiry)</label>
                  <div className="flex flex-wrap gap-3">
                     {[30, 15, 10, 7, 5, 3, 1].map(day => (
                       <button 
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day, 'before')}
                        className={`w-12 h-12 flex items-center justify-center font-black border-2 transition-all ${
                          settings.before_expiry_days.includes(day) ? 'bg-[#141414] text-white border-[#141414]' : 'bg-white border-[#141414]/10 hover:border-[#141414]'
                        }`}
                       >
                          {day}
                       </button>
                     ))}
                  </div>
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Reminder Template</label>
                  <select 
                    value={settings.template_before_expiry}
                    onChange={e => setSettings({ ...settings, template_before_expiry: e.target.value })}
                    className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-4 font-black uppercase text-xs appearance-none outline-none"
                  >
                     <option value="">Select Blueprint</option>
                     {templates.filter(t => t.category === 'Renewal' || t.category === 'Custom').map(t => (
                       <option key={t.id} value={t.id}>{t.template_name}</option>
                     ))}
                  </select>
               </div>
            </div>
         </div>

         {/* Phase 2: Reminders After Expiry */}
         <div className="bg-white border-4 border-[#141414] p-10 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-8">
            <div className="flex items-center gap-3 border-b-2 border-[#141414] pb-6">
               <AlertCircle className="opacity-40" />
               <h2 className="text-xl font-black uppercase tracking-tight">Post-Expiry Sequence</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-6">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Trigger Days (After Expiry)</label>
                  <div className="flex flex-wrap gap-3">
                     {[1, 3, 5, 10, 15].map(day => (
                       <button 
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day, 'after')}
                        className={`w-12 h-12 flex items-center justify-center font-black border-2 transition-all ${
                          settings.after_expiry_days.includes(day) ? 'bg-red-600 text-white border-red-700' : 'bg-white border-[#141414]/10 hover:border-[#141414]'
                        }`}
                       >
                          {day}
                       </button>
                     ))}
                  </div>
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Critical Blueprint</label>
                  <select 
                    value={settings.template_after_expiry}
                    onChange={e => setSettings({ ...settings, template_after_expiry: e.target.value })}
                    className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-4 font-black uppercase text-xs appearance-none outline-none"
                  >
                     <option value="">Select Blueprint</option>
                     {templates.filter(t => t.category === 'Renewal' || t.category === 'Custom').map(t => (
                       <option key={t.id} value={t.id}>{t.template_name}</option>
                     ))}
                  </select>
               </div>
            </div>
         </div>

         {/* Logic Constraints */}
         <div className="bg-[#141414] text-white p-10 shadow-[12px_12px_0px_0px_rgba(20,20,20,0.1)] flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-6">
               <Timer size={40} className="opacity-20" />
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Batch Dispatch Time</p>
                  <input 
                    type="time" 
                    value={settings.send_time}
                    onChange={e => setSettings({ ...settings, send_time: e.target.value })}
                    className="bg-transparent text-4xl font-black outline-none border-b-2 border-white/20 focus:border-white transition-colors"
                  />
               </div>
            </div>
            
            <button 
              disabled={isSaving}
              className="w-full md:w-auto px-16 py-8 bg-white text-[#141414] font-black uppercase tracking-[0.4em] text-sm hover:invert transition-all shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]"
            >
               {isSaving ? <Loader2 className="animate-spin" /> : 'COMMIT AUTOMATIONS'}
            </button>
         </div>
      </form>

      <div className="bg-amber-50 border-4 border-[#141414] p-8 flex gap-6 italic">
         <Info className="text-amber-600 shrink-0" />
         <p className="text-[10px] font-bold text-amber-900 leading-relaxed uppercase">
           Reminder: Automated notifications will only target members with "Active" or "Expired" status. Blocked or Deleted accounts are strictly excluded from the automation stack.
         </p>
      </div>
    </div>
  );
}
