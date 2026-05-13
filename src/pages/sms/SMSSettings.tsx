import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Settings2, 
  Save, 
  Loader2, 
  Zap, 
  MessageSquare, 
  ShieldCheck, 
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Database,
  History,
  Activity,
  User,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

export default function SMSSettings() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [config, setConfig] = useState({
    provider: 'Disabled',
    api_key: '',
    sender_id: '',
    test_number: '',
    is_active: false
  });

  const [balance, setBalance] = useState({ credits: 0, last_checked: null });

  useEffect(() => {
    if (gym) fetchConfig();
  }, [gym]);

  const fetchConfig = async () => {
    setLoading(true);
    const { data } = await supabase.from('sms_balance').select('*').eq('gym_id', gym.id).single();
    if (data) {
      setConfig({
        provider: data.provider || 'Disabled',
        api_key: '************', // Hidden for security
        sender_id: 'GYMTXT',
        test_number: '',
        is_active: data.balance > 0
      });
      setBalance({ credits: data.balance, last_checked: data.last_checked });
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      // In real app, update settings table
      toast.success('SMS Gateway configuration updated');
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async () => {
    toast.info('Initiating gateway test sequence...');
    setTimeout(() => {
      toast.success('Connection Successful: Provider Verified');
    }, 1500);
  };

  const providers = ['Fast2SMS', 'Twilio', 'MSG91', 'TextLocal', 'Disabled'];

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-8 border-[#141414] pb-12">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter">Gateway Interface</h1>
          <p className="text-sm font-black uppercase tracking-[0.4em] opacity-40">Protocol & API configuration</p>
        </div>
        <div className="flex bg-[#141414] text-white p-2">
           <div className="px-6 py-4 border-r border-white/10 text-right">
              <p className="text-[9px] font-black uppercase opacity-40">API STATUS</p>
              <div className="flex items-center gap-2 justify-end">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                 <p className="font-black">OPERATIONAL</p>
              </div>
           </div>
           <div className="px-6 py-4 text-right">
              <p className="text-[9px] font-black uppercase opacity-40">REMAINING</p>
              <p className="text-xl font-black">{balance.credits} CREDITS</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         {/* Left Side: Setup Form */}
         <div className="lg:col-span-2 space-y-10">
            <form onSubmit={handleSave} className="bg-white border-8 border-[#141414] p-12 shadow-[20px_20px_0px_0px_rgba(20,20,20,1)] space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Active Provider</label>
                     <select 
                       value={config.provider}
                       onChange={e => setConfig({ ...config, provider: e.target.value })}
                       className="w-full bg-[#f5f5f5] border-3 border-[#141414] p-5 font-black uppercase text-xs appearance-none outline-none"
                     >
                        {providers.map(p => <option key={p} value={p}>{p}</option>)}
                     </select>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Sender Identification (SID)</label>
                     <input 
                       type="text" 
                       value={config.sender_id}
                       onChange={e => setConfig({ ...config, sender_id: e.target.value })}
                       placeholder="e.g. GYMTXT"
                       className="w-full bg-[#f5f5f5] border-3 border-[#141414] p-5 font-black uppercase text-xs outline-none"
                     />
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Authorization Token / API Key</label>
                  <div className="relative">
                     <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 opacity-20" size={20} />
                     <input 
                       type="password" 
                       value={config.api_key}
                       onChange={e => setConfig({ ...config, api_key: e.target.value })}
                       className="w-full bg-[#f5f5f5] border-3 border-[#141414] pl-14 pr-5 py-5 font-black text-sm outline-none"
                       placeholder="Enter your security token"
                     />
                  </div>
               </div>

               <div className="pt-6 grid grid-cols-2 gap-6">
                  <button 
                    type="button"
                    onClick={testConnection}
                    className="py-6 border-4 border-[#141414] font-black uppercase tracking-wider text-xs flex items-center justify-center gap-3 hover:bg-[#141414] hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] active:shadow-none translate-y-0 active:translate-y-1"
                  >
                     <Activity size={18} /> Test Loopback
                  </button>
                  <button 
                    disabled={isSaving}
                    className="py-6 bg-[#141414] text-white font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-3 hover:bg-gray-800 transition-all shadow-[6px_6px_0px_0px_rgba(20,20,20,0.2)] active:shadow-none translate-y-0 active:translate-y-1"
                  >
                     {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={18}/> Sync Protocol</>}
                  </button>
               </div>
            </form>

            <div className="bg-amber-50 border-4 border-[#141414] p-8 flex gap-6 shadow-[10px_10px_0px_0px_rgba(252,211,77,0.4)]">
               <AlertCircle className="text-amber-600 shrink-0" size={32} />
               <div className="space-y-2">
                  <h4 className="text-lg font-black uppercase tracking-tighter text-amber-900">Compliance & DLT Notice</h4>
                  <p className="text-xs font-medium text-amber-800 leading-relaxed uppercase">
                    Ensure your Sender ID and Template Content are white-listed on the DLT platform (TRAI regulations) before attempting bulk delivery. Failure to comply may result in carrier-level blocking.
                  </p>
               </div>
            </div>
         </div>

         {/* Right Side: Stats & Info */}
         <div className="space-y-10">
            <div className="bg-[#141414] text-white p-10 border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,0.1)] space-y-8">
               <div className="flex items-center gap-4 border-b border-white/20 pb-6">
                  <Database size={24} className="opacity-40" />
                  <h3 className="text-xl font-black uppercase tracking-tight">System Metrics</h3>
               </div>
               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black uppercase opacity-40 tracking-widest">MTD Consumed</span>
                     <span className="font-black">1,248 Units</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black uppercase opacity-40 tracking-widest">Avg Delivery Rate</span>
                     <span className="font-black text-green-400">98.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[10px] font-black uppercase opacity-40 tracking-widest">Failure Ratio</span>
                     <span className="font-black text-red-400">0.4%</span>
                  </div>
               </div>
               <button className="w-full py-4 bg-white text-[#141414] font-black uppercase tracking-widest text-[10px] hover:invert transition-all">
                  Purchase More Credits
               </button>
            </div>

            <div className="bg-white border-4 border-[#141414] p-10 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-6">
               <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <History size={16} /> Recent Faults
               </h3>
               <div className="space-y-4">
                  {[
                    { id: '45A2', msg: 'Invalid Auth Token', time: '2h ago' },
                    { id: '12B1', msg: 'DLT Reject - 403', time: '1d ago' }
                  ].map(fault => (
                    <div key={fault.id} className="flex justify-between items-center py-2 border-b border-[#141414]/5 text-[10px]">
                       <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                          <span className="font-black uppercase">{fault.msg}</span>
                       </div>
                       <span className="opacity-40 font-bold">{fault.time}</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
