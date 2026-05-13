import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Package, 
  Download, 
  Search, 
  Loader2, 
  AlertTriangle, 
  TrendingUp, 
  ShoppingCart,
  Filter,
  ArrowRight,
  TrendingDown,
  Tag,
  Warehouse
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function StockReport() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (gym) fetchStock();
  }, [gym]);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('gym_id', gym.id)
        .order('name');
      
      if (error) throw error;
      setProducts(data || []);
    } finally {
      setLoading(false);
    }
  };

  const inventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const lowStockCount = products.filter(p => p.stock <= 5).length;

  const exportToExcel = () => {
    const exportData = products.map(p => ({
      Name: p.name,
      Category: p.categories?.name || 'N/A',
      Price: p.price,
      Stock: p.stock,
      'Valuation (Price * Stock)': p.price * p.stock,
      Description: p.description || ''
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, `Stock_Inventory_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'low' && p.stock <= 5) ||
                         (statusFilter === 'out' && p.stock === 0);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Inventory Audit</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Asset valuation & supply chain monitoring</p>
        </div>
        <button 
          onClick={exportToExcel}
          className="flex items-center justify-center gap-3 bg-[#141414] text-white px-8 py-4 border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]"
        >
          <Download size={18} /> Export Valuation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'TOTAL STOCK VALUE', val: `₹${inventoryValue.toLocaleString()}`, icon: <Warehouse />, color: 'bg-indigo-600' },
          { label: 'SKU COUNT', val: products.length, icon: <Tag />, color: 'bg-[#141414]' },
          { label: 'LOW STOCK ALERTS', val: lowStockCount, icon: <AlertTriangle />, color: 'bg-red-600' },
          { label: 'AVERAGE PRICE', val: `₹${Math.round(products.reduce((acc, p) => acc + p.price, 0)/(products.length || 1))}`, icon: <ShoppingCart />, color: 'bg-green-600' }
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         <div className="lg:col-span-3 bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
            <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
               <input 
                 type="text" 
                 placeholder="Search by SKU name..." 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-12 pr-4 py-3 font-bold outline-none uppercase" 
               />
            </div>
         </div>
         <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] flex gap-4">
            {['all', 'low', 'out'].map(s => (
              <button 
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`flex-1 font-black uppercase text-[10px] tracking-widest border-2 transition-all ${
                  statusFilter === s ? 'bg-[#141414] text-white border-[#141414]' : 'bg-white border-[#141414]/10 hover:border-[#141414]'
                }`}
              >
                 {s}
              </button>
            ))}
         </div>
      </div>

      <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
        <table className="w-full text-left">
           <thead>
              <tr className="bg-[#141414] text-white text-[10px] font-black uppercase tracking-widest border-b-4 border-[#141414]">
                 <th className="px-6 py-5">Product Asset</th>
                 <th className="px-6 py-5">Classification</th>
                 <th className="px-6 py-5 text-center">In-Stock units</th>
                 <th className="px-6 py-5 text-right">Unit Price</th>
                 <th className="px-6 py-5 text-right">Asset Valuation</th>
              </tr>
           </thead>
           <tbody className="divide-y-2 divide-[#141414] font-mono text-[11px]">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="animate-spin mx-auto opacity-20" size={40} /></td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center opacity-20 font-black uppercase text-sm font-sans">Zero inventory detected</td></tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${p.stock <= 5 ? 'bg-red-50/30' : ''}`}>
                     <td className="px-6 py-4">
                        <div className="font-sans">
                           <p className="font-black uppercase tracking-tight text-xs">{p.name}</p>
                           <p className="text-[9px] font-bold opacity-40 uppercase">UID: {p.id.substring(0,8)}</p>
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        <span className="px-2 py-0.5 border border-[#141414] bg-white uppercase text-[8px] font-black">
                           {p.categories?.name || 'Unlabeled'}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                           <span className={`text-xl font-black ${p.stock <= 5 ? 'text-red-600' : ''}`}>{p.stock}</span>
                           {p.stock <= 5 && <span className="text-[7px] font-black bg-red-600 text-white px-1 leading-none">CRITICAL</span>}
                        </div>
                     </td>
                     <td className="px-6 py-4 text-right font-sans opacity-40">₹{p.price.toLocaleString()}</td>
                     <td className="px-6 py-4 text-right font-sans font-black text-sm">₹{(p.price * p.stock).toLocaleString()}</td>
                  </tr>
                ))
              )}
           </tbody>
        </table>
      </div>
    </div>
  );
}
