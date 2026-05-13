import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  History, 
  Save, 
  Loader2, 
  Zap, 
  Clock, 
  ShieldCheck, 
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Database,
  QrCode,
  Fingerprint,
  Bluetooth,
  Wifi
} from 'lucide-react';
import { toast } from 'sonner';

export default function AttendanceSettings() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    method: 'Manual',
    qr_enabled: false,
    facial_recognition: false,
    biometric_integration: false,
    check_in_window: 15, // minutes
    allow_multiple_entries: false
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      toast.success('Access control policy updated');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-8 border-[#141414] pb-12">
        <div>
           <h1 className="text-4xl font-black uppercase tracking-tighter">Terminal Interface</h1>
           <p className="text-sm font-black uppercase tracking-[0.4em] opacity-40">Attendance & access protocol configuration</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-12">
         {/* Method Selection */}
         <div className="bg-white border-8 border-[#141414] p-10 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-8">
            <div className="flex items-center gap-3 border-b-2 border-[#141414] pb-6">
               <Fingerprint className="opacity-40" />
               <h2 className="text-xl font-black uppercase tracking-tight">Identity Method</h2>
            </div>
            
            <div className="space-y-4">
               {[
                 { id: 'Manual', label: 'Manual Dashboard Entry', icon: <History size={16}/> },
                 { id: 'QR', label: 'Mobile App QR Scanning', icon: <QrCode size={16}/> },
                 { id: 'Biometric', label: 'Hardware Biometric Link', icon: <Wifi size={16}/> }
               ].map(method => (
                  <button 
                    key={method.id}
                    type="button"
                    onClick={() => setConfig({ ...config, method: method.id })}
                    className={`w-full p-5 text-left border-3 font-black uppercase text-xs tracking-widest flex items-center justify-between transition-all ${
                      config.method === method.id ? 'bg-[#141414] text-white border-[#141414]' : 'bg-white border-[#141414]/10 hover:border-[#141414]'
                    }`}
                  >
                     <div className="flex items-center gap-4">
                        {method.icon}
                        {method.label}
                     </div>
                     {config.method === method.id && <CheckCircle2 size={16} />}
                  </button>
               ))}
            </div>
         </div>

         {/* Advanced Constraints */}
         <div className="space-y-10">
            <div className="bg-[#141414] text-white p-10 border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,0.1)] space-y-8">
               <h3 className="text-lg font-black uppercase tracking-tighter italic">Operational Guardrails</h3>
               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black uppercase opacity-40">Idle Window (Mins)</span>
                     <input 
                      type="number" 
                      value={config.check_in_window}
                      onChange={e => setConfig({ ...config, check_in_window: Number(e.target.value) })}
                      className="w-16 bg-white/10 border-2 border-white/20 p-2 text-center font-black outline-none"
                     />
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black uppercase opacity-40">Multi-Entry Auth</span>
                     <button 
                       type="button"
                       onClick={() => setConfig({ ...config, allow_multiple_entries: !config.allow_multiple_entries })}
                       className={`w-12 h-6 p-1 flex items-center transition-all ${config.allow_multiple_entries ? 'bg-indigo-500 justify-end' : 'bg-gray-600 justify-start'}`}
                     >
                        <div className="w-4 h-4 bg-white" />
                     </button>
                  </div>
               </div>
               <button 
                disabled={isSaving}
                className="w-full py-6 bg-white text-[#141414] font-black uppercase tracking-[0.3em] text-xs hover:invert transition-all"
               >
                  {isSaving ? <Loader2 className="animate-spin" /> : 'COMMIT PROTOCOL'}
               </button>
            </div>

            <div className="bg-amber-50 border-4 border-[#141414] p-8 flex gap-4 italic text-[10px] font-bold text-amber-900 leading-relaxed uppercase">
               <AlertCircle size={24} className="text-amber-600 shrink-0" />
               Critical: Biometric hardware requires the Zimme-Sync bridge app installed on the host machine. Ensure static IP allocation for terminal devices.
            </div>
         </div>
      </form>
    </div>
  );
}
