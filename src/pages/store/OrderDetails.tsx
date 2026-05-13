import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  Printer, 
  Loader2,
  Package,
  User,
  CreditCard,
  MapPin
} from 'lucide-react';
import { format } from 'date-fns';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (id && gym) fetchOrder();
  }, [id, gym]);

  const fetchOrder = async () => {
    try {
      const [{ data: orderData }, { data: itemsData }] = await Promise.all([
        supabase.from('orders').select('*').eq('id', id).single(),
        supabase.from('order_items').select('*, products(name, sku)').eq('order_id', id)
      ]);
      setOrder(orderData);
      setItems(itemsData || []);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin" size={40} /></div>;
  if (!order) return <div className="p-20 text-center">Order not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/orders')} className="p-3 border-4 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-[#141414]">Transaction Details</h1>
            <p className="text-xs font-black uppercase tracking-widest opacity-40">Tax Invoice #{order.id.split('-')[0]}</p>
          </div>
        </div>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 px-8 py-4 bg-[#141414] text-white border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
        >
          <Printer size={16} /> Print Receipt
        </button>
      </div>

      <div className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] print-shadow-none print-border-thin">
        {/* Invoice Header */}
        <div className="flex flex-col md:flex-row justify-between gap-8 pb-12 border-b-4 border-[#141414]">
          <div className="space-y-4">
            <h2 className="text-4xl font-black uppercase tracking-tighter text-[#141414]">{gym?.name}</h2>
            <div className="space-y-1 text-xs font-bold uppercase opacity-60">
              <p className="flex items-center gap-2"><MapPin size={12} /> {gym?.address || 'Gym Location Address'}</p>
              <p>Email: {gym?.email || 'gym@example.com'}</p>
              <p>Phone: {gym?.phone || '+91 98765 43210'}</p>
            </div>
          </div>
          <div className="md:text-right space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Invoice #</p>
            <p className="text-2xl font-black uppercase tracking-tighter">INV-{order.id.split('-')[0]}</p>
            <div className="pt-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Date Dispatched</p>
              <p className="font-black uppercase text-sm">{format(new Date(order.created_at), 'MMMM dd, yyyy')}</p>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12">
          <div className="space-y-4">
             <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-b-2 border-[#141414] pb-2">
               <User size={14} /> Billed To
             </h3>
             <div>
               <p className="text-xl font-black uppercase tracking-tight">{order.customer_name}</p>
               <p className="text-xs font-bold opacity-60">PH: {order.customer_phone}</p>
             </div>
          </div>
          <div className="md:text-right space-y-4">
             <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center justify-end gap-2 border-b-2 border-[#141414] pb-2">
               <CreditCard size={14} /> Payment Info
             </h3>
             <div className="space-y-1">
               <p className="font-black uppercase text-sm">{order.payment_mode}</p>
               <p className="text-[10px] font-black uppercase px-2 py-0.5 bg-green-500 text-white inline-block">Transaction {order.status}</p>
             </div>
          </div>
        </div>

        {/* Item Table */}
        <div className="py-8">
           <table className="w-full border-collapse">
             <thead>
               <tr className="bg-[#f5f5f5] text-[10px] font-black uppercase tracking-widest border-y-2 border-[#141414]">
                 <th className="px-4 py-4 text-left">Description</th>
                 <th className="px-4 py-4 text-center">Qty</th>
                 <th className="px-4 py-4 text-right">Unit Price</th>
                 <th className="px-4 py-4 text-right">Tax</th>
                 <th className="px-4 py-4 text-right">Total</th>
               </tr>
             </thead>
             <tbody className="divide-y-2 divide-[#f5f5f5]">
               {items.map((item, i) => (
                 <tr key={i} className="text-sm font-bold">
                   <td className="px-4 py-6">
                     <p className="font-black uppercase tracking-tight">{item.products?.name}</p>
                     <p className="text-[10px] opacity-40 font-mono">SKU: {item.products?.sku}</p>
                   </td>
                   <td className="px-4 py-6 text-center">{item.quantity}</td>
                   <td className="px-4 py-6 text-right">₹{item.price.toLocaleString()}</td>
                   <td className="px-4 py-6 text-right">₹{(item.tax || 0).toLocaleString()}</td>
                   <td className="px-4 py-6 text-right font-black">₹{item.total.toLocaleString()}</td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end pt-8 border-t-4 border-[#141414]">
           <div className="w-full md:w-64 space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase opacity-60">
                <span>Subtotal</span>
                <span>₹{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase opacity-60">
                <span>GST / SGST</span>
                <span>₹{order.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-3xl font-black tracking-tighter pt-4 border-t-2 border-dashed border-[#141414]">
                <span>TOTAL</span>
                <span>₹{order.total.toLocaleString()}</span>
              </div>
           </div>
        </div>

        {/* Terms */}
        <div className="mt-20 pt-8 border-t-2 border-[#f5f5f5] text-[10px] font-bold uppercase opacity-40 leading-relaxed italic">
          <p>Notes: Goods once sold will not be taken back. This is a computer generated invoice and does not require a physical signature. Thank you for shopping with {gym?.name}!</p>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .main-content { padding: 0 !important; }
          .print-shadow-none { box-shadow: none !important; }
          .print-border-thin { border-width: 2px !important; }
        }
      `}</style>
    </div>
  );
}
