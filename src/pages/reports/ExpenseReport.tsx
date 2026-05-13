import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Receipt, 
  Download, 
  Search, 
  Loader2, 
  TrendingDown, 
  PieChart as PieIcon,
  Calendar,
  Filter,
  ArrowRight,
  TrendingUp,
  Wallet,
  AlertCircle
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function ExpenseReport() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({
    from: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    to: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  useEffect(() => {
    if (gym) fetchExpenses();
  }, [gym, dateRange]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*, staff(name)')
        .eq('gym_id', gym.id)
        .gte('expense_date', dateRange.from)
        .lte('expense_date', dateRange.to)
        .order('expense_date', { ascending: false });
      
      if (error) throw error;
      setExpenses(data || []);
    } finally {
      setLoading(false);
    }
  };

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const categoryStats = React.useMemo(() => {
    const stats: any = {};
    expenses.forEach(e => {
      stats[e.category] = (stats[e.category] || 0) + e.amount;
    });
    return Object.keys(stats).map(k => ({ name: k, value: stats[k] })).sort((a,b) => b.value - a.value);
  }, [expenses]);

  const COLORS = ['#141414', '#DC2626', '#4F46E5', '#10B981', '#F59E0B', '#7C3AED'];

  const exportToExcel = () => {
    const exportData = expenses.map(e => ({
      Date: format(new Date(e.expense_date), 'dd/MM/yyyy'),
      Category: e.category,
      Description: e.description,
      Amount: e.amount,
      'Created By': e.staff?.name || 'N/A'
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");
    XLSX.writeFile(wb, `Expense_Report_${dateRange.from}_to_${dateRange.to}.xlsx`);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black uppercase tracking-tighter">Overhead Registry</h1>
           <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Expense tracking & category analysis</p>
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
             onClick={exportToExcel}
             className="p-4 bg-[#141414] text-white border-4 border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:bg-white hover:text-[#141414] transition-all"
           >
              <Download size={20} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'TOTAL BURN', val: `₹${totalExpense.toLocaleString()}`, icon: <TrendingDown />, color: 'bg-red-600' },
          { label: 'LINE ITEMS', val: expenses.length, icon: <Receipt />, color: 'bg-[#141414]' },
          { label: 'PEAK CATEGORY', val: categoryStats[0]?.name || 'N/A', icon: <AlertCircle />, color: 'bg-amber-600' },
          { label: 'AVG DAILY COST', val: `₹${Math.round(totalExpense / 30).toLocaleString()}`, icon: <PieIcon />, color: 'bg-indigo-600' }
        ].map(stat => (
          <div key={stat.label} className="bg-white border-4 border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] flex items-center justify-between">
             <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{stat.label}</p>
                <p className="text-3xl font-black italic">{stat.val}</p>
             </div>
             <div className={`w-12 h-12 ${stat.color} text-white flex items-center justify-center`}>
                {stat.icon}
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <div className="bg-white border-4 border-[#141414] p-10 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
            <h3 className="text-xl font-black uppercase tracking-tight mb-8">Category Allocation</h3>
            <div className="h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={categoryStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                     >
                        {categoryStats.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip 
                        contentStyle={{ border: '4px solid #141414', borderRadius: 0, fontWeight: 900, textTransform: 'uppercase' }}
                     />
                  </PieChart>
               </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-6 mt-8">
               {categoryStats.map((s, i) => (
                 <div key={s.name} className="flex flex-col border-l-4 border-gray-100 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                       <div className="w-2 h-2" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                       <span className="text-[9px] font-black uppercase opacity-40">{s.name}</span>
                    </div>
                    <p className="text-sm font-black italic">₹{s.value.toLocaleString()}</p>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-white border-4 border-[#141414] p-10 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
            <h3 className="text-xl font-black uppercase tracking-tight mb-8">Asset Valuation</h3>
            <div className="h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryStats}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#14141410" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase' }} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900 }} />
                     <Tooltip contentStyle={{ border: '4px solid #141414', borderRadius: 0, fontWeight: 900 }} />
                     <Bar dataKey="value" fill="#141414" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      <div className="bg-white border-4 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
        <table className="w-full text-left">
           <thead>
              <tr className="bg-[#141414] text-white text-[10px] font-black uppercase tracking-widest border-b-4 border-[#141414]">
                 <th className="px-6 py-5">Record Date</th>
                 <th className="px-6 py-5">Classification</th>
                 <th className="px-6 py-5">Descriptor</th>
                 <th className="px-6 py-5 text-right">Value</th>
              </tr>
           </thead>
           <tbody className="divide-y-2 divide-[#141414] font-mono text-[11px]">
              {loading ? (
                <tr><td colSpan={4} className="p-20 text-center"><Loader2 className="animate-spin mx-auto opacity-20" size={40} /></td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={4} className="p-20 text-center opacity-20 font-black uppercase text-sm font-sans">Zero overheads detected for this cycle</td></tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-red-50 transition-colors">
                     <td className="px-6 py-4 font-sans font-black">{format(new Date(e.expense_date), 'dd MMM yyyy')}</td>
                     <td className="px-6 py-4">
                        <span className="px-2 py-0.5 border border-[#141414] bg-white uppercase text-[8px] font-black">
                           {e.category}
                        </span>
                     </td>
                     <td className="px-6 py-4 font-sans opacity-60 italic leading-relaxed">{e.description}</td>
                     <td className="px-6 py-4 text-right font-sans font-black text-sm">₹{e.amount.toLocaleString()}</td>
                  </tr>
                ))
              )}
           </tbody>
        </table>
      </div>
    </div>
  );
}
