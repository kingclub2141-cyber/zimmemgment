import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Bell, 
  Save, 
  Loader2, 
  Zap, 
  ShieldCheck, 
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Database,
  Mail,
  MessageSquare,
  Globe,
  BellRing
} from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationSettings() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    in_app: true,
    sms: false,
    email: false,
    push: false,
    triggers: {
      new_enrollment: true,
      payment_received: true,
      low_stock: true,
      expiring_members: true
    }
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      toast.success('Notification preferences updated');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTrigger = (key: string) => {
    setSettings({
      ...settings,
      triggers: {
        ...settings.triggers,
        [key]: !((settings.triggers as any)[key])
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-8 border-[#141414] pb-12">
        <div>
           <h1 className="text-4xl font-black uppercase tracking-tighter text-indigo-600">Event Dissemination</h1>
           <p className="text-sm font-black uppercase tracking-[0.4em] opacity-40">Global alert & trigger management</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
         {/* Channels */}
         <div className="lg:col-span-12 bg-white border-8 border-[#141414] p-12 shadow-[20px_20px_0px_0px_rgba(20,20,20,1)] grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
               { id: 'in_app', label: 'In-App Core', icon: <BellRing size={20}/> },
               { id: 'sms', label: 'SMS Dispatch', icon: <Smartphone size={20}/> },
               { id: 'email', label: 'Mail Server', icon: <Mail size={20}/> },
               { id: 'push', label: 'Web Push', icon: <Zap size={20}/> }
            ].map(channel => (
               <button 
                  key={channel.id}
                  type="button"
                  onClick={() => setSettings({ ...settings, [channel.id]: !(settings as any)[channel.id] })}
                  className={`p-6 border-4 flex flex-col items-center gap-4 transition-all ${
                     (settings as any)[channel.id] ? 'bg-[#141414] text-white border-[#141414]' : 'bg-white text-[#141414] border-[#141414]/10 hover:border-[#141414]'
                  }`}
               >
                  {channel.icon}
                  <span className="text-[10px] font-black uppercase tracking-widest">{channel.label}</span>
                  <div className={`w-3 h-3 rounded-full ${ (settings as any)[channel.id] ? 'bg-green-500' : 'bg-gray-300' }`} />
               </button>
            ))}
         </div>

         {/* Event Triggers */}
         <div className="lg:col-span-8 bg-white border-8 border-[#141414] p-12 shadow-[20px_20px_0px_0px_rgba(20,20,20,1)] space-y-8">
            <h3 className="text-xl font-black uppercase tracking-tight border-b-2 border-[#141414] pb-6">Protocol Triggers</h3>
            <div className="space-y-4">
               {Object.entries(settings.triggers).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center p-6 border-2 border-[#141414]/10 hover:border-[#141414] transition-all group">
                     <span className="font-black uppercase text-xs tracking-tight">{key.replace('_', ' ')}</span>
                     <button 
                        type="button"
                        onClick={() => toggleTrigger(key)}
                        className={`w-14 h-8 p-1 flex items-center transition-all ${val ? 'bg-[#141414] justify-end' : 'bg-gray-200 justify-start'}`}
                     >
                        <div className="w-6 h-6 bg-white" />
                     </button>
                  </div>
               ))}
            </div>
         </div>

         {/* Info Block */}
         <div className="lg:col-span-4 space-y-10">
            <div className="bg-[#141414] text-white p-10 border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,0.1)] space-y-8">
               <AlertCircle size={32} className="opacity-20" />
               <h3 className="text-lg font-black uppercase tracking-tighter italic">Frequency Capping</h3>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 leading-relaxed">
                  Triggers are processed in real-time. Excessive alert configurations may increase operational costs for SMS/Mail channels.
               </p>
               <button 
                  disabled={isSaving}
                  className="w-full py-6 bg-white text-[#141414] font-black uppercase tracking-[0.30em] text-xs hover:invert transition-all"
               >
                  {isSaving ? <Loader2 className="animate-spin" /> : 'SYNCHRONIZE PROTOCOL'}
               </button>
            </div>
         </div>
      </form>
    </div>
  );
}
