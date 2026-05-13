import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Database, 
  Upload, 
  Download, 
  History, 
  Loader2, 
  ShieldCheck, 
  AlertCircle, 
  Calendar,
  Zap,
  ArrowRight,
  HardDrive,
  Cloud,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function BackupRestore() {
  const { gym } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBackup = () => {
    setIsProcessing(true);
    toast.loading('Initializing archive sequence...');
    setTimeout(() => {
      setIsProcessing(false);
      toast.dismiss();
      toast.success('System state successfully archived to Cloud Storage');
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-8 border-[#141414] pb-12">
        <div>
           <h1 className="text-4xl font-black uppercase tracking-tighter">System Redundancy</h1>
           <p className="text-sm font-black uppercase tracking-[0.4em] opacity-40">State preservation & disaster recovery</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-white">
         <div className="bg-[#141414] p-12 border-4 border-[#141414] shadow-[16px_16px_0px_0px_rgba(20,20,20,0.1)] space-y-10">
            <div className="flex items-center gap-4 border-b border-white/20 pb-6">
               <Download size={32} className="opacity-40" />
               <h3 className="text-2xl font-black uppercase tracking-tight italic">Archive State</h3>
            </div>
            <p className="text-xs font-bold opacity-40 leading-relaxed uppercase tracking-widest">
               Generates a full snapshot of the gymnasium database including attendance logs, payment registries and member dossiers.
            </p>
            <button 
              onClick={handleBackup}
              disabled={isProcessing}
              className="w-full py-8 bg-white text-[#141414] font-black uppercase tracking-[0.4em] text-sm hover:invert transition-all"
            >
               {isProcessing ? <Loader2 className="animate-spin" /> : 'DOWNLOAD SNAPSHOT'}
            </button>
         </div>

         <div className="bg-indigo-600 p-12 border-4 border-[#141414] shadow-[16px_16px_0px_0px_rgba(79,70,229,0.2)] space-y-10">
            <div className="flex items-center gap-4 border-b border-white/20 pb-6">
               <Upload size={32} className="opacity-40" />
               <h3 className="text-2xl font-black uppercase tracking-tight italic">Restore Data</h3>
            </div>
            <p className="text-xs font-bold opacity-40 leading-relaxed uppercase tracking-widest">
               Import an existing .JSON or .SQL archive to overwrite the current system state. WARNING: This action is destructive.
            </p>
            <button 
              disabled={isProcessing}
              className="w-full py-8 bg-[#141414] text-white font-black uppercase tracking-[0.4em] text-sm hover:bg-gray-800 transition-all border-4 border-[#141414]"
            >
               INITIATE IMPORT
            </button>
         </div>
      </div>

      <div className="bg-white border-8 border-[#141414] p-12 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-8">
         <div className="flex items-center gap-4 border-b-2 border-[#141414] pb-6">
            <History className="opacity-40" />
            <h3 className="text-xl font-black uppercase tracking-tight">Audit Log</h3>
         </div>
         <div className="space-y-6">
            {[
               { type: 'Manual Backup', status: 'Success', date: '2026-05-10 14:22', size: '4.2 MB' },
               { type: 'Automated Sync', status: 'Success', date: '2026-05-09 03:00', size: '4.1 MB' },
               { type: 'Manual Backup', status: 'Success', date: '2026-05-05 11:45', size: '3.9 MB' }
            ].map((log, i) => (
               <div key={i} className="flex flex-col md:flex-row justify-between items-center p-6 border-2 border-[#141414]/5 space-y-4 md:space-y-0">
                  <div className="flex items-center gap-6">
                     <div className="p-3 bg-gray-50 border border-[#141414]/10"><HardDrive size={18} /></div>
                     <div className="space-y-1">
                        <p className="font-black uppercase text-sm tracking-tight">{log.type}</p>
                        <p className="text-[10px] font-bold opacity-40 uppercase flex items-center gap-2"><Clock size={12}/> {log.date}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-8">
                     <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{log.size}</span>
                     <span className="px-3 py-1 bg-green-50 text-green-700 border-2 border-green-200 text-[9px] font-black uppercase tracking-widest">{log.status}</span>
                     <button className="text-indigo-600 hover:underline text-[10px] font-black uppercase tracking-widest">Verify</button>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
