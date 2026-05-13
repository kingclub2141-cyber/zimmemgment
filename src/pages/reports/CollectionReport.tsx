import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Wallet, 
  Calendar, 
  Download, 
  Loader2, 
  TrendingUp, 
  PieChart as PieIcon,
  Search,
  ArrowUpRight,
  Receipt,
  CreditCard,
  Smartphone,
  Banknote,
  Filter
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { format, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function CollectionReport() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({
    from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    to: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  useEffect(() => {
    if (gym) fetchCollectionData();
  }, [gym, dateRange]);

  const fetchCollectionData = async () => {
    try {
      setLoading(true);
      const { data: payments, error } = await supabase
        .from('payments')
        .select('*, members(name)')
        .eq('gym_id', gym.id)
        .gte('payment_date', dateRange.from)
        .lte('payment_date', dateRange.to)
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      setData(payments || []);
    } finally {
      setLoading(false);
    }
  };

  const totalCollection = data.reduce((acc, curr) => acc + curr.amount, 0);
  
  const modeData = [
    { name: 'Cash', value: data.filter(p => p.payment_mode === 'Cash').reduce((acc, p) => acc + p.amount, 0) },
    { name: 'Online', value: data.filter(p => p.payment_mode === 'Online').reduce((acc, p) => acc + p.amount, 0) },
    { name: 'UPI', value: data.filter(p => p.payment_mode === 'UPI').reduce((acc, p) => acc + p.amount, 0) },
    { name: 'Card', value: data.filter(p => p.payment_mode === 'Card').reduce((acc, p) => acc + p.amount, 0) },
  ].filter(d => d.value > 0);

  const COLORS = ['#141414', '#4F46E5', '#10B981', '#F59E0B'];

  const exportToExcel = () => {
    const exportData = data.map(p => ({
      Date: format(new Date(p.payment_date), 'dd/MM/yyyy'),
      'Receipt No': p.receipt_number,
      Member: p.members?.name || 'N/A',
      Amount: p.amount,
      'Payment Mode': p.payment_mode
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Collection");
    XLSX.writeFile(wb, `Collection_Report_${dateRange.from}_to_${dateRange.to}.xlsx`);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Collection Intel</h1>
          <p className="text-sm font-black uppercase tracking-[0.4em] opacity-40">Financial inflow analysis</p>
        </div>
        <div className="flex gap-4">
           <div className="flex bg-white border-4 border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
              <input 
                type="date" 
                value={dateRange.from}
                onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
                className="px-4 py-2 font-black uppercase text-[10px] outline-none"
              />
              <div className="flex items-center px-2 bg-[#141414] text-white">
                 <ArrowUpRight size={14} />
              </div>
              <input 
                type="date" 
                value={dateRange.to}
                onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
                className="px-4 py-2 font-black uppercase text-[10px] outline-none"
              />
           </div>
           <button 
             onClick={exportToExcel}
             className="p-4 bg-[#141414] text-white border-4 border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:bg-white hover:text-[#141414] transition-all"
           >
              <Download size={20} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'GROSS COLLECTION', val: `₹${totalCollection.toLocaleString()}`, icon: <Wallet />, color: 'bg-indigo-600' },
          { label: 'TOTAL INVOICES', val: data.length, icon: <Receipt />, color: 'bg-[#141414]' },
          { label: 'AVG TICKET', val: `₹${data.length ? Math.round(totalCollection/data.length).toLocaleString() : 0}`, icon: <TrendingUp />, color: 'bg-orange-600' },
          { label: 'UPI RATIO', val: `${data.length ? Math.round((data.filter(p => p.payment_mode === 'UPI').length / data.length) * 100) : 0}%`, icon: <Smartphone />, color: 'bg-green-600' }
        ].map(stat => (
          <div key={stat.label} className="bg-white border-4 border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] flex items-center justify-between">
             <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{stat.label}</p>
                <p className="text-3xl font-black">{stat.val}</p>
             </div>
             <div className={`w-12 h-12 ${stat.color} text-white flex items-center justify-center`}>
                {stat.icon}
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 bg-white border-4 border-[#141414] p-10 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
            <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
               <TrendingUp size={24} /> Mode Breakdown
            </h3>
            <div className="h-[400px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={modeData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#14141420" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
                     <Tooltip 
                        cursor={{ fill: '#14141405' }}
                        contentStyle={{ border: '4px solid #141414', borderRadius: 0, fontWeight: 900, textTransform: 'uppercase' }}
                     />
                     <Bar dataKey="value" fill="#141414" radius={[4, 4, 0, 0]} barSize={60} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-white border-4 border-[#141414] p-10 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] flex flex-col items-center justify-center">
            <h3 className="text-xl font-black uppercase tracking-tight mb-10 text-center">Settlement Matrix</h3>
            <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={modeData}
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                     >
                        {modeData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip contentStyle={{ border: '4px solid #141414', borderRadius: 0, fontWeight: 900 }} />
                  </PieChart>
               </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full mt-6">
               {modeData.map((d, i) => (
                 <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[10px] font-black uppercase opacity-60">{d.name}</span>
                 </div>
               ))}
            </div>
         </div>
      </div>

      <div className="bg-white border-4 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
         <div className="p-6 border-b-4 border-[#141414] flex justify-between items-center bg-[#f5f5f5]">
            <h3 className="font-black uppercase tracking-widest text-xs flex items-center gap-3">
               <Filter size={16} /> Transaction Log
            </h3>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-[#141414] text-white text-[10px] font-black uppercase tracking-widest">
                     <th className="px-6 py-5">Date</th>
                     <th className="px-6 py-5">Receipt</th>
                     <th className="px-6 py-5">Member</th>
                     <th className="px-6 py-5">Settlement</th>
                     <th className="px-6 py-5 text-right">Value</th>
                  </tr>
               </thead>
               <tbody className="divide-y-2 divide-[#141414] font-mono text-[11px]">
                  {loading ? (
                    <tr><td colSpan={5} className="p-10 text-center"><Loader2 className="animate-spin mx-auto opacity-20" size={32} /></td></tr>
                  ) : data.length === 0 ? (
                    <tr><td colSpan={5} className="p-20 text-center opacity-20 font-black uppercase font-sans">No data within selected range</td></tr>
                  ) : (
                    data.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                         <td className="px-6 py-4 font-sans font-black">{format(new Date(p.payment_date), 'dd MMM yyyy')}</td>
                         <td className="px-6 py-4 opacity-60 uppercase">{p.receipt_number}</td>
                         <td className="px-6 py-4 font-sans font-black uppercase">{p.members?.name}</td>
                         <td className="px-6 py-4">
                            <span className="px-2 py-0.5 border border-[#141414] bg-white uppercase text-[9px] font-black">
                               {p.payment_mode}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right font-sans font-black text-sm">₹{p.amount.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
