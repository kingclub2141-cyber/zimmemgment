import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  Eye, 
  Printer, 
  Loader2,
  Calendar,
  Filter,
  Package
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function OrderList() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (gym) fetchOrders();
  }, [gym]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('gym_id', gym.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.customer_name.toLowerCase().includes(search.toLowerCase()) || 
    o.customer_phone.includes(search) ||
    o.id.includes(search)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Order History</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Store Sales & Invoices</p>
        </div>
      </div>

      <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
          <input 
            type="text" 
            placeholder="Search Order ID, Name or Phone..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-12 pr-4 py-3 font-bold outline-none" 
          />
        </div>
        <button className="flex items-center justify-center gap-2 bg-[#f5f5f5] border-2 border-[#141414] font-black uppercase text-[10px] tracking-widest hover:bg-[#141414] hover:text-white transition-all">
          <Filter size={14} /> Filter
        </button>
      </div>

      <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#141414] text-white font-black uppercase tracking-widest text-[10px]">
              <th className="px-6 py-4">Receipt</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Method</th>
              <th className="px-6 py-4 text-right">Amount</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-[#141414]">
            {loading ? (
              <tr><td colSpan={6} className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
            ) : filteredOrders.length === 0 ? (
              <tr><td colSpan={6} className="p-20 text-center opacity-20 font-black uppercase">No orders recorded</td></tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#f5f5f5] transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-mono text-xs font-bold uppercase">#{order.id.split('-')[0]}</p>
                    <p className="text-[10px] font-bold opacity-40">{format(new Date(order.created_at), 'MMM dd, hh:mm a')}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-black uppercase tracking-tight text-sm">{order.customer_name}</p>
                    <p className="text-[10px] font-bold opacity-40">{order.customer_phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black uppercase px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200">
                      {order.payment_mode}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-black text-lg">₹{order.total.toLocaleString()}</p>
                  </td>
                   <td className="px-6 py-4 text-center">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-green-500 text-white">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Link to={`/orders/${order.id}`} className="p-2 border-2 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none">
                        <Eye size={14} />
                      </Link>
                      <button className="p-2 border-2 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none">
                        <Printer size={14} />
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
  );
}
