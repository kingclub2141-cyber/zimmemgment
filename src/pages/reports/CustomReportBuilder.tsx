import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Layers, 
  Download, 
  Search, 
  Loader2, 
  Table, 
  Plus, 
  Trash2, 
  Settings2,
  Database,
  ArrowRight,
  Filter,
  CheckCircle2,
  Smartphone,
  Calendar,
  Zap,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function CustomReportBuilder() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [targetTable, setTargetTable] = useState('members');
  const [columns, setColumns] = useState<string[]>(['name', 'phone', 'status']);
  const [limit, setLimit] = useState(50);

  const availableTables: any = {
    members: ['name', 'phone', 'gender', 'status', 'due_amount', 'expiry_date', 'created_at'],
    payments: ['amount', 'payment_mode', 'receipt_number', 'payment_date', 'created_at'],
    expenses: ['amount', 'category', 'description', 'expense_date', 'created_at'],
    attendance: ['check_in', 'check_out', 'created_at'],
    products: ['name', 'price', 'stock', 'created_at']
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      const query = supabase
        .from(targetTable)
        .select(columns.join(','))
        .eq('gym_id', gym.id)
        .limit(limit);
      
      const { data, error } = await query;
      if (error) throw error;
      setResults(data || []);
      toast.success(`Generated data with ${data?.length} records`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (results.length === 0) return toast.error('No data to export');
    const ws = XLSX.utils.json_to_sheet(results);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Custom_Report");
    XLSX.writeFile(wb, `Custom_${targetTable}_Report_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  const toggleColumn = (col: string) => {
    if (columns.includes(col)) {
      setColumns(columns.filter(c => c !== col));
    } else {
      setColumns([...columns, col]);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-28">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-8 border-[#141414] pb-12">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter">Query Forge</h1>
          <p className="text-sm font-black uppercase tracking-[0.4em] opacity-40">Multi-dimensional custom report engine</p>
        </div>
        <button 
          onClick={exportToExcel}
          disabled={results.length === 0}
          className="flex items-center justify-center gap-4 bg-[#141414] text-white px-10 py-6 border-4 border-[#141414] font-black uppercase tracking-widest text-sm hover:invert transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] disabled:opacity-50"
        >
          <Download size={24} /> Export Dataset
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Settings Sidebar */}
        <div className="space-y-10">
           <div className="bg-white border-8 border-[#141414] p-10 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-8">
              <div className="flex items-center gap-3 border-b-2 border-[#141414] pb-6">
                 <Database size={24} className="opacity-40" />
                 <h2 className="text-xl font-black uppercase tracking-tight">Source Definition</h2>
              </div>
              
              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Primary Entity</label>
                 <select 
                   value={targetTable}
                   onChange={e => {
                     setTargetTable(e.target.value);
                     setColumns(['name', 'phone'].filter(c => availableTables[e.target.value].includes(c)));
                   }}
                   className="w-full bg-[#f5f5f5] border-3 border-[#141414] p-5 font-black uppercase text-xs appearance-none outline-none"
                 >
                    {Object.keys(availableTables).map(t => <option key={t} value={t}>{t}</option>)}
                 </select>
              </div>

              <div className="space-y-6">
                 <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Attribute Selection</label>
                 <div className="grid grid-cols-1 gap-2">
                    {availableTables[targetTable].map((col: string) => (
                      <button 
                        key={col}
                        onClick={() => toggleColumn(col)}
                        className={`w-full p-4 text-left border-2 font-black uppercase text-[10px] tracking-widest flex items-center justify-between transition-all ${
                          columns.includes(col) ? 'bg-[#141414] text-white border-[#141414]' : 'bg-white border-[#141414]/10 hover:border-[#141414]'
                        }`}
                      >
                         {col}
                         {columns.includes(col) && <CheckCircle2 size={12} />}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Batch Limit</label>
                 <div className="flex bg-[#f5f5f5] border-3 border-[#141414] p-2">
                    {[50, 100, 500].map(v => (
                       <button 
                         key={v}
                         onClick={() => setLimit(v)}
                         className={`flex-1 py-2 font-black text-xs transition-all ${limit === v ? 'bg-[#141414] text-white' : 'hover:bg-gray-200'}`}
                       >
                          {v}
                       </button>
                    ))}
                 </div>
              </div>

              <button 
                onClick={generateReport}
                disabled={loading || columns.length === 0}
                className="w-full py-8 bg-indigo-600 text-white font-black uppercase tracking-[0.4em] text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-4 shadow-[8px_8px_0px_0px_rgba(79,70,229,0.2)]"
              >
                 {loading ? <Loader2 className="animate-spin" /> : <><Zap size={24}/> RUN QUERY</>}
              </button>
           </div>

           <div className="bg-amber-50 border-4 border-[#141414] p-8 flex gap-4">
              <Info className="text-amber-600 shrink-0" size={24} />
              <p className="text-[9px] font-bold text-amber-900 leading-relaxed uppercase">
                Custom reports use live data streams. Large queries (over 500 records) may experience slight latency during serialization.
              </p>
           </div>
        </div>

        {/* Results Stream */}
        <div className="lg:col-span-2 space-y-10">
           <div className="bg-white border-8 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] overflow-hidden flex flex-col min-h-[600px]">
              <div className="p-8 border-b-4 border-[#141414] flex justify-between items-center bg-[#f5f5f5]">
                 <h3 className="font-black uppercase tracking-[0.3em] text-xs">Generated Dataset Stream</h3>
                 <span className="text-[10px] font-black border-2 border-[#141414] px-4 py-1 uppercase">{results.length} ROWS</span>
              </div>
              <div className="flex-1 overflow-auto max-h-[700px]">
                 {results.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-[#141414] text-white text-[10px] font-black uppercase tracking-widest sticky top-0 z-10">
                             {columns.map(c => <th key={c} className="px-6 py-5 border-r border-white/10">{c}</th>)}
                          </tr>
                       </thead>
                       <tbody className="divide-y-2 divide-[#141414] font-mono text-[10px]">
                          {results.map((row, i) => (
                             <tr key={i} className="hover:bg-gray-50 uppercase">
                                {columns.map(col => (
                                   <td key={col} className="px-6 py-4 border-r border-[#141414]/5 truncate max-w-[200px]">
                                      {String(row[col] ?? 'N/A')}
                                   </td>
                                ))}
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 ) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-20 py-40 grayscale">
                       <Layers size={80} className="mb-6" />
                       <p className="font-black uppercase tracking-[0.5em] text-xl">System Idle: Pending User Query</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
