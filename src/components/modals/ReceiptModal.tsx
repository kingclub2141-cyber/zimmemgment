import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Printer, Download, Dumbbell } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  gymName: string;
  payment: {
    receipt_number: string;
    payment_date: string;
    amount: number;
    payment_mode: string;
    remarks?: string;
  };
  member: {
    name: string;
    member_id: string;
    phone: string;
  };
  plan: {
    plan_name: string;
    total_amount: number;
    paid_amount: number;
    due_amount: number;
  };
}

export default function ReceiptModal({ isOpen, onClose, gymName, payment, member, plan }: ReceiptModalProps) {
  const handlePrint = () => {
    window.print();
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text(gymName.toUpperCase(), 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text('PAYMENT RECEIPT', 105, 28, { align: 'center' });
    
    doc.setDrawColor(20, 20, 20);
    doc.line(20, 35, 190, 35);
    
    // Details
    doc.setFontSize(10);
    doc.text(`Receipt No: ${payment.receipt_number}`, 20, 45);
    doc.text(`Date: ${new Date(payment.payment_date).toLocaleDateString()}`, 150, 45);
    
    doc.text(`Member Name: ${member.name}`, 20, 55);
    doc.text(`Member ID: ${member.member_id}`, 20, 62);
    doc.text(`Phone: ${member.phone}`, 20, 69);
    
    // Table
    (doc as any).autoTable({
      startY: 80,
      head: [['Plan Name', 'Total', 'Paid Now', 'Balance Due']],
      body: [
        [plan.plan_name, `Rs. ${plan.total_amount}`, `Rs. ${payment.amount}`, `Rs. ${plan.due_amount}`]
      ],
      theme: 'grid',
      headStyles: { fillStyle: [20, 20, 20], textColor: [255, 255, 255] }
    });
    
    doc.text(`Payment Mode: ${payment.payment_mode}`, 20, (doc as any).lastAutoTable.finalY + 15);
    doc.text(`Remarks: ${payment.remarks || 'N/A'}`, 20, (doc as any).lastAutoTable.finalY + 22);
    
    doc.text('Thank you for choosing us!', 105, (doc as any).lastAutoTable.finalY + 40, { align: 'center' });
    
    doc.save(`Receipt_${payment.receipt_number}.pdf`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141414]/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] w-full max-w-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#141414] p-6 text-white flex justify-between items-center no-print">
              <div className="flex items-center gap-3">
                <Dumbbell className="text-white" size={24} />
                <h2 className="text-lg font-black uppercase tracking-widest">Payment Receipt</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div id="receipt-content" className="p-8 space-y-8 print:p-0">
              <div className="text-center border-b-4 border-[#141414] pb-6">
                <h1 className="text-3xl font-black uppercase tracking-tighter mb-1">{gymName}</h1>
                <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Official Payment Receipt</p>
              </div>

              <div className="grid grid-cols-2 gap-8 text-sm">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Receipt To</p>
                    <p className="font-black text-lg">{member.name}</p>
                    <p className="font-medium opacity-60">ID: {member.member_id}</p>
                    <p className="font-medium opacity-60">{member.phone}</p>
                  </div>
                </div>
                <div className="space-y-4 text-right">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Receipt Info</p>
                    <p className="font-black">{payment.receipt_number}</p>
                    <p className="font-medium opacity-60">{new Date(payment.payment_date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <table className="w-full border-4 border-[#141414] text-sm">
                <thead className="bg-[#141414] text-white">
                  <tr>
                    <th className="p-4 text-left font-black uppercase tracking-widest h-12">Plan Name</th>
                    <th className="p-4 text-right font-black uppercase tracking-widest h-12">Total</th>
                    <th className="p-4 text-right font-black uppercase tracking-widest h-12">Paid</th>
                    <th className="p-4 text-right font-black uppercase tracking-widest h-12">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#141414]">
                  <tr className="bg-white">
                    <td className="p-4 font-bold">{plan.plan_name}</td>
                    <td className="p-4 text-right font-bold">Rs. {plan.total_amount}</td>
                    <td className="p-4 text-right font-black text-green-600">Rs. {payment.amount}</td>
                    <td className="p-4 text-right font-black text-red-600">Rs. {plan.due_amount}</td>
                  </tr>
                </tbody>
              </table>

              <div className="flex justify-between items-start pt-4">
                <div className="text-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Payment Method</p>
                  <p className="font-black uppercase tracking-widest text-[#141414] px-3 py-1 bg-[#141414]/5 inline-block">
                    {payment.payment_mode}
                  </p>
                  {payment.remarks && (
                    <div className="mt-4">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Remarks</p>
                      <p className="font-medium opacity-60 max-w-xs">{payment.remarks}</p>
                    </div>
                  )}
                </div>
                <div className="text-right">
                   <div className="bg-[#141414] text-white px-6 py-4">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Total Paid</p>
                    <p className="text-3xl font-black tracking-tighter">Rs. {payment.amount}</p>
                  </div>
                </div>
              </div>

              <div className="pt-12 text-center border-t-2 border-[#141414]/10">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">This is a computer generated receipt</p>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-[#f5f5f5] p-6 flex justify-end gap-4 no-print border-t-4 border-[#141414]">
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-[#141414] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:shadow-none active:translate-x-1 active:translate-y-1"
              >
                <Printer size={16} />
                Print
              </button>
              <button 
                onClick={downloadPDF}
                className="flex items-center gap-2 px-6 py-3 bg-[#141414] text-white border-2 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:shadow-none active:translate-x-1 active:translate-y-1"
              >
                <Download size={16} />
                Download PDF
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
