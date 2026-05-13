import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Wallet, 
  Clock, 
  Users, 
  UserCheck, 
  ShoppingBag, 
  Receipt, 
  FileText, 
  ShieldCheck, 
  Layers,
  ArrowRight,
  PieChart,
  TrendingUp,
  Package,
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function ReportsDashboard() {
  const navigate = useNavigate();

  const reportGroups = [
    {
      title: 'Finance & Accounts',
      items: [
        { label: 'Collection Report', path: '/reports/collection', icon: <Wallet className="text-green-600" />, desc: 'Revenue analytics & payment modes' },
        { label: 'Due Payments', path: '/reports/due', icon: <AlertCircle className="text-amber-600" />, desc: 'Outstanding balances tracking' },
        { label: 'Expense Ledger', path: '/reports/expense', icon: <Receipt className="text-red-600" />, desc: 'Operational cost breakdowns' },
        { label: 'GST Register', path: '/reports/gst', icon: <ShieldCheck className="text-blue-600" />, desc: 'Tax compliance & GSTR filings' }
      ]
    },
    {
      title: 'Operations & Membership',
      items: [
        { label: 'Member Directory', path: '/reports/members', icon: <Users className="text-indigo-600" />, desc: 'Demographics & enrollment stats' },
        { label: 'Attendance logs', path: '/reports/attendance', icon: <Calendar className="text-orange-600" />, desc: 'Daily footprint & activity' },
        { label: 'Expiry Matrix', path: '/reports/expiry', icon: <Clock className="text-rose-600" />, desc: 'Upcoming renewal schedules' },
        { label: 'Trainer Performance', path: '/reports/trainers', icon: <UserCheck className="text-teal-600" />, desc: 'Assignment & payroll audits' }
      ]
    },
    {
      title: 'Inventory & Retail',
      items: [
        { label: 'Sales Report', path: '/reports/sales', icon: <TrendingUp className="text-cyan-600" />, desc: 'Store performance & margins' },
        { label: 'Stock Inventory', path: '/reports/stock', icon: <Package className="text-stone-600" />, desc: 'Asset valuation & low stock alerts' }
      ]
    },
    {
      title: 'Insights',
      items: [
        { label: 'Custom Builder', path: '/reports/builder', icon: <Layers className="text-purple-600" />, desc: 'Build multi-dimensional reports' }
      ]
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-5xl font-black uppercase tracking-tighter">Report Intelligence</h1>
           <p className="text-sm font-black uppercase tracking-[0.4em] opacity-40">Cross-departmental data analytics</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-[#141414] text-white p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,0.1)] flex items-center gap-6">
              <BarChart3 size={32} className="opacity-40" />
              <div className="text-right">
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Data Integrity</p>
                 <p className="text-xl font-black italic">VERIFIED</p>
              </div>
           </div>
        </div>
      </div>

      <div className="space-y-16">
         {reportGroups.map(group => (
           <div key={group.title} className="space-y-8">
              <div className="flex items-center gap-6">
                 <h2 className="text-xl font-black uppercase tracking-widest bg-[#141414] text-white px-4 py-1">{group.title}</h2>
                 <div className="flex-1 h-1 bg-[#141414]/5" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {group.items.map(item => (
                   <button 
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className="group bg-white border-4 border-[#141414] p-8 text-left shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex flex-col min-h-[220px]"
                   >
                      <div className="flex-1 space-y-4">
                         <div className="w-12 h-12 border-2 border-[#141414]/10 bg-gray-50 flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-white group-hover:border-[#141414]">
                            {item.icon}
                         </div>
                         <h3 className="text-lg font-black uppercase tracking-tight leading-tight">{item.label}</h3>
                         <p className="text-[10px] font-bold opacity-40 uppercase leading-relaxed">{item.desc}</p>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity mt-4">
                         Investigate Data <ArrowRight size={12}/>
                      </div>
                   </button>
                 ))}
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
