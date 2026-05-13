import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Save, 
  Loader2, 
  Receipt, 
  ShieldCheck, 
  Eye, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileDigit,
  Hash,
  Scale
} from 'lucide-react';
import { toast } from 'sonner';

export default function InvoiceSettings() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({
    invoice_prefix: 'ELITE-',
    next_invoice_number: 1001,
    gst_enabled: true,
    gst_percentage: 18,
    invoice_footer: 'Thank you for choosing Elite Gym. This is a computer generated invoice.',
    terms_conditions: '1. Fees are non-refundable.\n2. Membership is non-transferable.'
  });

  useEffect(() => {
    if (gym) fetchConfig();
  }, [gym]);

  const fetchConfig = async () => {
    setLoading(true);
    // In a real app, fetch from settings table
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      // Simulate save
      toast.success('Billing configuration synchronized');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-8 border-[#141414] pb-12">
        <div>
           <h1 className="text-4xl font-black uppercase tracking-tighter">Billing Protocol</h1>
           <p className="text-sm font-black uppercase tracking-[0.4em] opacity-40">Financial documentation formatting</p>
        </div>
        <div className="flex items-center gap-4">
           <button className="bg-[#141414] text-white px-8 py-4 border-4 border-[#141414] font-black uppercase tracking-widest text-xs flex items-center gap-3">
              <Eye size={18} /> Preview Blueprint
           </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-10">
           {/* Section 1: Numbering */}
           <div className="bg-white border-8 border-[#141414] p-12 shadow-[20px_20px_0px_0px_rgba(20,20,20,1)] space-y-10">
              <div className="flex items-center gap-3 border-b-2 border-[#141414] pb-6">
                 <FileDigit className="opacity-40" />
                 <h2 className="text-xl font-black uppercase tracking-tight">Sequence Control</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Invoice Prefix</label>
                    <div className="relative">
                       <Hash className="absolute left-5 top-1/2 -translate-y-1/2 opacity-20" size={18} />
                       <input 
                         type="text" 
                         value={config.invoice_prefix}
                         onChange={e => setConfig({ ...config, invoice_prefix: e.target.value })}
                         className="w-full bg-[#f5f5f5] border-3 border-[#141414] pl-14 pr-5 py-5 font-black uppercase text-xs outline-none"
                       />
                    </div>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Counter Initialization</label>
                    <input 
                      type="number" 
                      value={config.next_invoice_number}
                      onChange={e => setConfig({ ...config, next_invoice_number: Number(e.target.value) })}
                      className="w-full bg-[#f5f5f5] border-3 border-[#141414] p-5 font-black uppercase text-xs outline-none"
                    />
                 </div>
              </div>
           </div>

           {/* Section 2: Taxation */}
           <div className="bg-indigo-600 text-white border-8 border-[#141414] p-12 shadow-[20px_20px_0px_0px_rgba(20,20,20,1)] space-y-10">
              <div className="flex justify-between items-center border-b-2 border-white/20 pb-6">
                 <div className="flex items-center gap-3">
                    <Scale className="opacity-40" />
                    <h2 className="text-xl font-black uppercase tracking-tight">Fiscal Engine</h2>
                 </div>
                 <button 
                  type="button"
                  onClick={() => setConfig({ ...config, gst_enabled: !config.gst_enabled })}
                  className={`w-14 h-8 p-1 flex items-center transition-all ${config.gst_enabled ? 'bg-green-500 justify-end' : 'bg-gray-400 justify-start'}`}
                 >
                    <div className="w-6 h-6 bg-white" />
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">GST Ratio (%)</label>
                    <input 
                      type="number" 
                      value={config.gst_percentage}
                      onChange={e => setConfig({ ...config, gst_percentage: Number(e.target.value) })}
                      className="w-full bg-white/10 border-2 border-white/20 p-5 font-black text-xs outline-none focus:bg-white/20"
                    />
                 </div>
                 <div className="flex items-end pb-2">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40 italic">
                       Calculated @ CGST {(config.gst_percentage/2).toFixed(1)}% + SGST {(config.gst_percentage/2).toFixed(1)}%
                    </p>
                 </div>
              </div>
           </div>

           {/* Section 3: Legal & Footer */}
           <div className="bg-white border-8 border-[#141414] p-12 shadow-[20px_20px_0px_0px_rgba(20,20,20,1)] space-y-10">
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Standard Footer Notation</label>
                 <input 
                   type="text" 
                   value={config.invoice_footer}
                   onChange={e => setConfig({ ...config, invoice_footer: e.target.value })}
                   className="w-full bg-[#f5f5f5] border-3 border-[#141414] p-5 font-black text-xs outline-none"
                 />
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Contractual Terms (T&C)</label>
                 <textarea 
                   value={config.terms_conditions}
                   onChange={e => setConfig({ ...config, terms_conditions: e.target.value })}
                   className="w-full bg-[#f5f5f5] border-3 border-[#141414] p-5 font-black text-xs outline-none min-h-[120px] resize-none"
                 />
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
           <div className="bg-[#141414] text-white p-10 border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,0.1)] space-y-8">
              <Receipt size={32} className="opacity-20" />
              <h3 className="text-xl font-black uppercase tracking-tighter italic">Operational Commitment</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 leading-relaxed">
                 Invoice numbering is sequential and validated by fiscal regulations. Changing the next number may result in audit gaps.
              </p>
              <button 
                type="submit"
                disabled={isSaving}
                className="w-full py-8 bg-white text-[#141414] font-black uppercase tracking-[0.4em] text-xs hover:invert transition-all"
              >
                 {isSaving ? <Loader2 className="animate-spin" /> : 'SYNCHRONIZE PROTOCOL'}
              </button>
           </div>
        </div>
      </form>
    </div>
  );
}
