import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Settings2, 
  Save, 
  Loader2, 
  Zap, 
  Globe, 
  Clock, 
  CircleDollarSign,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Database,
  Languages,
  Layout
} from 'lucide-react';
import { toast } from 'sonner';

export default function GeneralSettings() {
  const { gym } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    language: 'English (US)',
    timezone: 'UTC +5:30 (IST)',
    currency: 'INR (₹)',
    date_format: 'DD/MM/YYYY',
    theme: 'Brutalist Light',
    maintenance_mode: false
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      toast.success('Core environment variables re-indexed');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-8 border-[#141414] pb-12">
        <div>
           <h1 className="text-4xl font-black uppercase tracking-tighter">System Neutrals</h1>
           <p className="text-sm font-black uppercase tracking-[0.4em] opacity-40">Environment & localization parameters</p>
        </div>
        <div className="flex bg-[#141414] text-white p-2">
           <div className="px-6 py-4 border-r border-white/10 text-right">
              <p className="text-[9px] font-black uppercase opacity-40">VERSION</p>
              <p className="font-black">v1.2.4-STABLE</p>
           </div>
           <div className="px-6 py-4 text-right">
              <p className="text-[9px] font-black uppercase opacity-40">ENVIRONMENT</p>
              <p className="font-black text-green-400">PRODUCTION</p>
           </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-12">
         {/* Localization */}
         <div className="bg-white border-8 border-[#141414] p-10 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-8">
            <div className="flex items-center gap-3 border-b-2 border-[#141414] pb-6">
               <Languages className="opacity-40" />
               <h2 className="text-xl font-black uppercase tracking-tight">Localization</h2>
            </div>
            
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase opacity-40 tracking-widest">Interface Locale</label>
                  <select className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-4 font-black uppercase text-[10px] outline-none appearance-none cursor-pointer">
                     <option>English (US)</option>
                     <option>Hindi (HI)</option>
                     <option>Spanish (ES)</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase opacity-40 tracking-widest">Temporal Zone</label>
                  <div className="relative">
                     <Clock className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={16} />
                     <select className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-10 pr-4 py-4 font-black uppercase text-[10px] outline-none appearance-none cursor-pointer">
                        <option>UTC +5:30 (IST)</option>
                        <option>UTC 0:00 (GMT)</option>
                     </select>
                  </div>
               </div>
            </div>
         </div>

         {/* Visuals & Currency */}
         <div className="bg-white border-8 border-[#141414] p-10 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-8">
            <div className="flex items-center gap-3 border-b-2 border-[#141414] pb-6">
               <CircleDollarSign className="opacity-40" />
               <h2 className="text-xl font-black uppercase tracking-tight">Financials</h2>
            </div>
            
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase opacity-40 tracking-widest">Symbol Interface</label>
                  <select className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-4 font-black uppercase text-[10px] outline-none appearance-none cursor-pointer">
                     <option>INR (₹)</option>
                     <option>USD ($)</option>
                     <option>EUR (€)</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase opacity-40 tracking-widest">Visual Syntax</label>
                  <div className="relative">
                     <Layout className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={16} />
                     <select className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-10 pr-4 py-4 font-black uppercase text-[10px] outline-none appearance-none cursor-pointer">
                        <option>Brutalist Monochrome</option>
                        <option>Modern High Contrast</option>
                     </select>
                  </div>
               </div>
            </div>
         </div>

         <div className="md:col-span-2 bg-[#141414] text-white p-12 shadow-[12px_12px_0px_0px_rgba(20,20,20,0.1)] flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-start gap-8">
               <ShieldCheck size={48} className="opacity-20 shrink-0" />
               <div className="space-y-2">
                  <h4 className="text-xl font-black uppercase italic tracking-tight">Critical Deployment</h4>
                  <p className="text-xs font-medium uppercase opacity-40 leading-relaxed tracking-wider max-w-lg">
                     These parameters affect the global state of the application. Changing localization or currency formatting will recreate all financial visuals and temporal logs.
                  </p>
               </div>
            </div>
            
            <button 
              disabled={isSaving}
              className="w-full md:w-auto px-16 py-8 bg-white text-[#141414] font-black uppercase tracking-[0.4em] text-sm hover:invert transition-all flex items-center justify-center gap-4 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]"
            >
               {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={20}/> COMMIT ENV</>}
            </button>
         </div>

         {/* Maintenance Switch */}
         <div className="md:col-span-2 bg-red-50 border-4 border-red-600 p-8 flex justify-between items-center group">
            <div className="flex items-center gap-6">
               <Zap className="text-red-600 animate-pulse" size={32} />
               <div>
                  <h4 className="text-lg font-black uppercase text-red-900 tracking-tighter">Maintenance Lockdown</h4>
                  <p className="text-[10px] font-bold text-red-800 uppercase italic">Instantly disconnect all active staff sessions except owners.</p>
               </div>
            </div>
            <button className="px-8 py-3 bg-red-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-all">
               ACTIVATE LOCK
            </button>
         </div>
      </form>
    </div>
  );
}
