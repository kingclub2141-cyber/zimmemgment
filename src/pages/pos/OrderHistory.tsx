import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ShoppingBag, 
  Search, 
  Download, 
  Loader2,
  Calendar,
  User,
  ArrowRight,
  Eye,
  Printer,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function OrderHistory() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    if (gym) fetchOrders();
  }, [gym]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*, staff(name)')
        .eq('gym_id', gym.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = async (order: any) => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*, products(name)')
        .eq('order_id', order.id);
      
      if (error) throw error;
      setSelectedOrder({ ...order, items: data });
      setIsViewModalOpen(true);
    } catch (error: any) {
      toast.error('Failed to load item specifics');
    }
  };

  const exportOrders = () => {
    const data = filteredOrders.map(o => ({
      'Receipt No': o.receipt_number,
      'Customer': o.customer_name,
      'Phone': o.customer_phone,
      'Amount (₹)': o.total_amount,
      'Payment': o.payment_mode,
      'Cashier': o.staff?.name || 'System',
      'Date': format(new Date(o.created_at), 'yyyy-MM-dd HH:mm')
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Store Sales");
    XLSX.writeFile(wb, "Gym_Store_Sales.xlsx");
  };

  const filteredOrders = orders.filter(o => 
    o.customer_name.toLowerCase().includes(search.toLowerCase()) || 
    o.receipt_number.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_phone.includes(search)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-black uppercase tracking-tighter">Retail Transactions</h1>
           <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">History of all store sales</p>
        </div>
        <button 
          onClick={exportOrders}
          className="flex items-center justify-center gap-3 bg-[#141414] text-white px-8 py-4 border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]"
        >
          <Download size={18} /> Export Sheet
        </button>
      </div>

      <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
          <input 
            type="text" 
            placeholder="Search by Receipt, Name or Phone..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-12 pr-4 py-3 font-bold outline-none uppercase" 
          />
        </div>
      </div>

      <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#141414] text-white font-black uppercase tracking-widest text-[10px]">
                <th className="px-6 py-4">Transaction</th>
                <th className="px-6 py-4">Identity</th>
                <th className="px-6 py-4">Settlement</th>
                <th className="px-6 py-4">Total Value</th>
                <th className="px-6 py-4 text-center">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#141414] font-mono text-[11px]">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center opacity-20 font-black uppercase text-sm font-sans">No sales history yet</td></tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#f5f5f5] transition-colors group">
                    <td className="px-6 py-4">
                       <div className="space-y-1 font-sans">
                          <p className="font-black uppercase tracking-tight text-xs">{o.receipt_number}</p>
                          <p className="text-[9px] font-bold opacity-40 flex items-center gap-1">
                             <Calendar size={10} /> {format(new Date(o.created_at), 'MMM dd, HH:mm')}
                          </p>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="font-sans">
                          <p className="font-black uppercase tracking-tight text-xs">{o.customer_name}</p>
                          <p className="text-[9px] font-bold opacity-40">{o.customer_phone}</p>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-[9px] font-black uppercase px-2 py-0.5 border border-[#141414] bg-white">
                          {o.payment_mode}
                       </span>
                    </td>
                    <td className="px-6 py-4 font-black font-sans text-sm">
                       ₹{o.total_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex justify-center">
                          <button 
                            onClick={() => viewOrderDetails(o)}
                            className="p-3 border-2 border-[#141414] hover:bg-[#141414] hover:text-white shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none transition-all"
                          >
                             <Eye size={16} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isViewModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
           <div className="bg-white border-8 border-[#141414] max-w-lg w-full shadow-[20px_20px_0px_0px_rgba(20,20,20,1)]">
              <div className="bg-[#141414] p-6 text-white flex justify-between items-center">
                 <div>
                    <h2 className="text-xl font-black uppercase tracking-tighter">Receipt Detail</h2>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{selectedOrder.receipt_number}</p>
                 </div>
                 <button onClick={() => setIsViewModalOpen(false)} className="hover:rotate-90 transition-transform"><X size={24}/></button>
              </div>
              <div className="p-8 space-y-6">
                 <div className="grid grid-cols-2 gap-8 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
                    <div>
                       <p className="mb-1 border-b border-[#141414]/10 pb-1">Billed To</p>
                       <p className="text-[#141414]">{selectedOrder.customer_name}</p>
                       <p className="text-[#141414] font-sans text-[11px] font-bold">{selectedOrder.customer_phone}</p>
                    </div>
                    <div className="text-right">
                       <p className="mb-1 border-b border-[#141414]/10 pb-1">Payment Method</p>
                       <p className="text-[#141414]">{selectedOrder.payment_mode}</p>
                    </div>
                 </div>

                 <div className="border-4 border-[#141414]">
                    <div className="bg-gray-100 p-3 flex justify-between text-[8px] font-black uppercase tracking-widest border-b-2 border-[#141414]">
                       <span>Line Item</span>
                       <span>Qty x Price</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto divide-y-2 divide-[#f0f0f0]">
                       {selectedOrder.items?.map((item: any) => (
                         <div key={item.id} className="p-4 flex justify-between items-center text-xs font-bold">
                            <div>
                               <p className="uppercase font-black text-[10px]">{item.products?.name}</p>
                               <p className="opacity-40 font-mono text-[9px] tracking-tighter">SKU REF {item.id.slice(0,8)}</p>
                            </div>
                            <p className="font-black">
                               {item.quantity} x ₹{item.price_at_sale}
                            </p>
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="pt-4 border-t-2 border-dashed border-[#141414]/20 flex justify-between items-center">
                    <p className="text-xs font-black uppercase tracking-widest">Total Transaction Value</p>
                    <p className="text-2xl font-black">₹{selectedOrder.total_amount}</p>
                 </div>

                 <button className="w-full py-4 bg-[#141414] text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3">
                    <Printer size={16} /> Print Physical Receipt
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
