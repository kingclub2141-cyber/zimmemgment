import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ShieldCheck, 
  Download, 
  Search, 
  Loader2, 
  Receipt, 
  TrendingUp, 
  Calendar,
  Filter,
  ArrowRight,
  TrendingDown,
  FileText,
  Briefcase
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function GSTReport() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({
    from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    to: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  useEffect(() => {
    if (gym) fetchGSTData();
  }, [gym, dateRange]);

  const fetchGSTData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select('*, members(name, gst_number)')
        .eq('gym_id', gym.id)
        .gte('payment_date', dateRange.from)
        .lte('payment_date', dateRange.to)
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      setPayments(data || []);
    } finally {
      setLoading(false);
    }
  };

  const gstStats = React.useMemo(() => {
    let taxable = 0;
    let cgst = 0;
    let sgst = 0;
    
    payments.forEach(p => {
      // Assuming 18% GST (9% CGST + 9% SGST)
      // Amount in DB is gross (inclusive)
      const taxableValue = p.amount / 1.18;
      taxable += taxableValue;
      cgst += taxableValue * 0.09;
      sgst += taxableValue * 0.09;
    });

    return { taxable, cgst, sgst, totalGst: cgst + sgst, gross: taxable + cgst + sgst };
  }, [payments]);

  const exportGSTR1 = () => {
    const exportData = payments.map(p => ({
      'Invoice Date': format(new Date(p.payment_date), 'dd/MM/yyyy'),
      'Invoice No': p.receipt_number,
      'Customer Name': p.members?.name || 'N/A',
      'Customer GSTIN': p.members?.gst_number || 'N/A',
      'Place of Supply': gym.state || 'Local',
      'Total Value': p.amount.toFixed(2),
      'Taxable Value': (p.amount / 1.18).toFixed(2),
      'IGST Rate': '0',
      'IGST Amount': '0',
      'CGST Rate': '9',
      'CGST Amount': ((p.amount / 1.18) * 0.09).toFixed(2),
      'SGST Rate': '9',
      'SGST Amount': ((p.amount / 1.18) * 0.09).toFixed(2),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "GSTR1_B2C_B2B");
    XLSX.writeFile(wb, `GSTR1_Report_${dateRange.from}_to_${dateRange.to}.xlsx`);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Tax Compliance Radar</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">GST Filing assistance & audit logs</p>
        </div>
        <div className="flex gap-4">
           <div className="flex bg-white border-4 border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
              <input 
                type="date" 
                value={dateRange.from}
                onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
                className="px-4 py-2 font-black uppercase text-[10px] outline-none"
              />
              <div className="flex items-center px-4 bg-[#141414] text-white">
                 <ArrowRight size={14} />
              </div>
              <input 
                type="date" 
                value={dateRange.to}
                onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
                className="px-4 py-2 font-black uppercase text-[10px] outline-none"
              />
           </div>
           <button 
             onClick={exportGSTR1}
             className="px-8 py-4 bg-[#141414] text-white border-4 border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:bg-white hover:text-[#141414] transition-all font-black uppercase tracking-widest text-xs flex items-center gap-3"
           >
              <Download size={18} /> Export GSTR-1
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'TAXABLE TURNOVER', val: `₹${gstStats.taxable.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: <Briefcase />, color: 'bg-indigo-600' },
          { label: 'OUTPUT CGST (9%)', val: `₹${gstStats.cgst.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: <ShieldCheck />, color: 'bg-[#141414]' },
          { label: 'OUTPUT SGST (9%)', val: `₹${gstStats.sgst.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: <ShieldCheck />, color: 'bg-[#141414]' },
          { label: 'NET TAX LIABILITY', val: `₹${gstStats.totalGst.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: <TrendingUp />, color: 'bg-green-600' }
        ].map(stat => (
          <div key={stat.label} className="bg-white border-4 border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] flex items-center justify-between">
             <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{stat.label}</p>
                <p className="text-2xl font-black italic">{stat.val}</p>
             </div>
             <div className={`w-10 h-10 ${stat.color} text-white flex items-center justify-center`}>
                {stat.icon}
             </div>
          </div>
        ))}
      </div>

      <div className="bg-white border-4 border-[#141414] p-10 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-6">
         <div className="flex items-center gap-3 border-b-2 border-[#141414] pb-6 mb-8">
            <FileText className="opacity-40" />
            <h2 className="text-2xl font-black uppercase tracking-tight">Filing Summary</h2>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-[11px] font-black uppercase tracking-widest">
            <div className="space-y-4">
               {[
                 { label: 'B2B Sales Count', val: payments.filter(p => p.members?.gst_number).length },
                 { label: 'B2C Sales Count', val: payments.filter(p => !p.members?.gst_number).length },
                 { label: 'Exempted Sales', val: 0 }
               ].map(row => (
                 <div key={row.label} className="flex justify-between border-b pb-2">
                    <span className="opacity-40">{row.label}</span>
                    <span>{row.val}</span>
                 </div>
               ))}
            </div>
            <div className="space-y-4">
               {[
                 { label: 'Average Tax/Invoice', val: `₹${(gstStats.totalGst / (payments.length || 1)).toFixed(2)}` },
                 { label: 'Max Invoice Value', val: `₹${Math.max(...payments.map(p => p.amount), 0).toLocaleString()}` },
                 { label: 'Tax Ratio/Turnover', val: '18.00%' }
               ].map(row => (
                 <div key={row.label} className="flex justify-between border-b pb-2">
                    <span className="opacity-40">{row.label}</span>
                    <span>{row.val}</span>
                 </div>
               ))}
            </div>
            <div className="bg-[#141414] text-white p-6 space-y-4 flex flex-col justify-center">
               <div className="flex justify-between text-lg">
                  <span className="opacity-40">NET REVENUE</span>
                  <span>₹{Math.round(gstStats.taxable).toLocaleString()}</span>
               </div>
               <div className="flex justify-between text-lg border-t border-white/20 pt-4">
                  <span className="opacity-40">NET TAX</span>
                  <span>₹{Math.round(gstStats.totalGst).toLocaleString()}</span>
               </div>
            </div>
         </div>
      </div>

      <div className="bg-white border-4 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
        <table className="w-full text-left">
           <thead>
              <tr className="bg-[#141414] text-white text-[10px] font-black uppercase tracking-widest border-b-4 border-[#141414]">
                 <th className="px-6 py-5">Invoice Reference</th>
                 <th className="px-6 py-5">Counter Party</th>
                 <th className="px-6 py-5 text-right">Taxable Amount</th>
                 <th className="px-6 py-5 text-right">Calculated GST</th>
                 <th className="px-6 py-5 text-right">Gross Total</th>
              </tr>
           </thead>
           <tbody className="divide-y-2 divide-[#141414] font-mono text-[11px]">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="animate-spin mx-auto opacity-20" size={40} /></td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center opacity-20 font-black uppercase text-sm font-sans">No tax events found</td></tr>
              ) : (
                payments.map((p) => {
                  const taxable = p.amount / 1.18;
                  const tax = p.amount - taxable;
                  return (
                    <tr key={p.id} className="hover:bg-blue-50/20 transition-colors">
                       <td className="px-6 py-4">
                          <div className="font-sans">
                             <p className="font-black uppercase text-[10px]">{p.receipt_number}</p>
                             <p className="text-[10px] opacity-40 font-bold">{format(new Date(p.payment_date), 'dd/MM/yyyy')}</p>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="font-sans">
                             <p className="font-black uppercase text-xs">{p.members?.name}</p>
                             {p.members?.gst_number ? (
                               <p className="text-[8px] font-black bg-indigo-600 text-white px-1 w-fit">{p.members.gst_number}</p>
                             ) : (
                               <p className="text-[8px] opacity-40 font-bold">URD / B2C</p>
                             )}
                          </div>
                       </td>
                       <td className="px-6 py-4 text-right font-sans opacity-40">₹{taxable.toFixed(2)}</td>
                       <td className="px-6 py-4 text-right font-sans font-black text-indigo-600">₹{tax.toFixed(2)}</td>
                       <td className="px-6 py-4 text-right font-sans font-black text-sm">₹{p.amount.toLocaleString()}</td>
                    </tr>
                  );
                })
              )}
           </tbody>
        </table>
      </div>
    </div>
  );
}
