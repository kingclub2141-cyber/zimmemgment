import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  Printer, 
  Mail, 
  Download, 
  Dumbbell,
  CheckCircle2,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { safeFormat } from '../../lib/utils';

export default function InvoiceView() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const { gym } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<any>(null);

  useEffect(() => {
    if (paymentId && gym) fetchPayment();
  }, [paymentId, gym]);

  const fetchPayment = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          members (
            name, 
            phone, 
            email, 
            member_id
          ),
          member_plans (
            plans (
              plan_name
            )
          )
        `)
        .eq('id', paymentId)
        .single();
      
      if (error) throw error;
      
      // Calculate GST
      const amount = data.amount || 0;
      const gstPercentage = 18; // Default 18%
      const baseAmount = amount / (1 + gstPercentage / 100);
      const gstAmount = amount - baseAmount;
      const cgst = gstAmount / 2;
      const sgst = gstAmount / 2;

      setPayment({
        ...data,
        baseAmount: baseAmount.toFixed(2),
        cgst: cgst.toFixed(2),
        sgst: sgst.toFixed(2),
        gstAmount: gstAmount.toFixed(2)
      });
    } catch (error: any) {
      toast.error('Invoice not found');
      navigate('/payments');
    } finally {
      setLoading(false);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in duration-500 pb-20 print:p-0 print:m-0">
      <div className="flex items-center justify-between mb-8 print:hidden">
        <button onClick={() => navigate(-1)} className="p-3 border-4 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
          <ArrowLeft size={20} />
        </button>
        <div className="flex gap-4">
           <button onClick={printInvoice} className="flex items-center gap-2 px-6 py-3 bg-[#141414] text-white border-4 border-[#141414] font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-[#141414] transition-all shadow-[6px_6px_0px_0px_rgba(20,20,20,1)]">
              <Printer size={18} /> Print Invoice
           </button>
        </div>
      </div>

      <div className="bg-white border-8 border-[#141414] p-12 shadow-[20px_20px_0px_0px_rgba(20,20,20,1)] print:shadow-none print:border-4">
         <div className="flex flex-col md:flex-row justify-between gap-8 mb-12 border-b-4 border-[#141414] pb-12">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#141414] text-white">
                     <Dumbbell size={32} />
                  </div>
                  <h1 className="text-4xl font-black uppercase tracking-tighter">{gym?.name}</h1>
               </div>
               <div className="text-xs font-bold opacity-60 space-y-1">
                  <p>{gym?.address || '123 Power Street, Iron City'}</p>
                  <p>{gym?.phone || '+91 9876543210'}</p>
                  <p>{gym?.email}</p>
               </div>
            </div>
            <div className="text-right space-y-2">
               <h2 className="text-6xl font-black text-[#141414]/10 uppercase italic">INVOICE</h2>
               <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-widest opacity-40">Invoice Number</p>
                  <p className="text-xl font-black uppercase tracking-tight">#{payment?.receipt_number}</p>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-12 mb-12">
            <div className="space-y-4">
               <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b-2 border-[#141414] pb-2">Billed To</h3>
               <div className="space-y-1">
                  <p className="text-2xl font-black uppercase tracking-tight">{payment?.members?.name}</p>
                  <p className="text-sm font-bold opacity-60 italic">Member ID: {payment?.members?.member_id}</p>
                  <p className="text-sm font-bold opacity-60">{payment?.members?.phone}</p>
               </div>
            </div>
            <div className="space-y-4 text-right">
               <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40 border-b-2 border-[#141414] pb-2">Record Date</h3>
               <div className="space-y-1">
                  <p className="text-xl font-black">{safeFormat(payment?.payment_date, 'MMMM dd, yyyy')}</p>
                  <p className="text-xs font-bold opacity-60 uppercase tracking-widest">Payment Mode: {payment?.payment_mode}</p>
               </div>
            </div>
         </div>

         <table className="w-full mb-12">
            <thead>
               <tr className="bg-[#141414] text-white text-[10px] font-black uppercase tracking-[0.2em]">
                  <th className="px-6 py-4 text-left">Description</th>
                  <th className="px-6 py-4 text-right">Qty</th>
                  <th className="px-6 py-4 text-right">Rate</th>
                  <th className="px-6 py-4 text-right">Amount</th>
               </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#141414]">
               <tr className="border-x-2 border-[#141414]">
                  <td className="px-6 py-8">
                     <p className="font-black uppercase tracking-tight text-lg">{payment?.member_plans?.plans?.plan_name || 'Membership Extension'}</p>
                     <p className="text-[10px] font-bold opacity-40 uppercase mt-1 italic">Professional Fitness Services</p>
                  </td>
                  <td className="px-6 py-8 text-right font-black">1</td>
                  <td className="px-6 py-8 text-right font-black">₹{payment?.amount}</td>
                  <td className="px-6 py-8 text-right font-black text-lg">₹{payment?.amount}</td>
               </tr>
            </tbody>
         </table>

          <div className="flex flex-col md:flex-row justify-between gap-12 pt-8 border-t-4 border-[#141414]">
            <div className="max-w-xs space-y-4">
               <div className="flex items-center gap-2 text-green-600 font-black uppercase text-[10px] tracking-widest">
                  <CheckCircle2 size={16} /> Fully Settled
               </div>
               <p className="text-[10px] font-bold opacity-40 leading-relaxed italic">
                  Thank you for your business. This invoice is computer-generated and does not require a physical signature.
               </p>
            </div>
            <div className="w-full md:w-80 space-y-4">
               <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest opacity-40">
                  <span>Taxable Value</span>
                  <span>₹{payment?.baseAmount}</span>
               </div>
               <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest opacity-40">
                  <span>CGST (9%)</span>
                  <span>₹{payment?.cgst}</span>
               </div>
               <div className="flex justify-between items-center text-sm font-bold uppercase tracking-widest opacity-40">
                  <span>SGST (9%)</span>
                  <span>₹{payment?.sgst}</span>
               </div>
               <div className="flex justify-between items-center py-4 border-t-4 border-[#141414]">
                  <span className="text-xl font-black uppercase tracking-tighter">Grand Total</span>
                  <span className="text-3xl font-black">₹{payment?.amount}</span>
               </div>
            </div>
          </div>

         <div className="mt-20 flex justify-center opacity-10">
             <ShieldCheck size={120} />
         </div>
      </div>
    </div>
  );
}
