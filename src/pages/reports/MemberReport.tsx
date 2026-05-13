import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  Download, 
  Search, 
  Loader2, 
  PieChart as PieIcon,
  TrendingUp,
  Filter,
  ArrowRight,
  UserPlus,
  UserCheck,
  ShieldAlert,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function MemberReport() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    if (gym) fetchMembers();
  }, [gym]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('*, member_plans(name)')
        .eq('gym_id', gym.id);
      
      if (error) throw error;
      setMembers(data || []);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'Active').length,
    expired: members.filter(m => m.status === 'Expired').length,
    blocked: members.filter(m => m.status === 'Blocked').length,
    male: members.filter(m => m.gender === 'Male').length,
    female: members.filter(m => m.gender === 'Female').length,
  };

  const genderData = [
    { name: 'Male', value: stats.male },
    { name: 'Female', value: stats.female },
    { name: 'Other', value: stats.total - stats.male - stats.female }
  ].filter(d => d.value > 0);

  const statusData = [
    { name: 'Active', value: stats.active },
    { name: 'Expired', value: stats.expired },
    { name: 'Blocked', value: stats.blocked }
  ].filter(d => d.value > 0);

  const COLORS = ['#141414', '#4F46E5', '#DC2626', '#10B981'];

  const exportToExcel = () => {
    const exportData = members.map(m => ({
      ID: m.member_id,
      Name: m.name,
      Phone: m.phone,
      Gender: m.gender,
      Status: m.status,
      Plan: m.member_plans?.name || 'N/A',
      Joining: format(new Date(m.created_at), 'dd/MM/yyyy'),
      Expiry: m.expiry_date ? format(new Date(m.expiry_date), 'dd/MM/yyyy') : 'N/A'
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Members");
    XLSX.writeFile(wb, `Member_Demographics_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Population Census</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Member demographics & status distribution</p>
        </div>
        <button 
          onClick={exportToExcel}
          className="flex items-center justify-center gap-3 bg-[#141414] text-white px-8 py-4 border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]"
        >
          <Download size={18} /> Export Census
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'TOTAL ENROLLMENT', val: stats.total, icon: <Users />, color: 'bg-indigo-600' },
          { label: 'STATUS: ACTIVE', val: stats.active, icon: <UserCheck />, color: 'bg-green-600' },
          { label: 'STATUS: EXPIRED', val: stats.expired, icon: <AlertTriangle />, color: 'bg-amber-600' },
          { label: 'STATUS: BLOCKED', val: stats.blocked, icon: <ShieldAlert />, color: 'bg-red-600' }
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
            <h3 className="text-xl font-black uppercase tracking-tight mb-8">Status Stratification</h3>
            <div className="h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                     >
                        {statusData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip contentStyle={{ border: '4px solid #141414', borderRadius: 0, fontWeight: 900 }} />
                  </PieChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-white border-4 border-[#141414] p-10 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
            <h3 className="text-xl font-black uppercase tracking-tight mb-8">Gender Balance</h3>
            <div className="h-[350px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={genderData} layout="vertical">
                     <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#14141410" />
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }} />
                     <Tooltip contentStyle={{ border: '4px solid #141414', borderRadius: 0, fontWeight: 900 }} />
                     <Bar dataKey="value" fill="#141414" barSize={40} radius={[0, 4, 4, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      <div className="bg-white border-4 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
        <table className="w-full text-left">
           <thead>
              <tr className="bg-[#141414] text-white text-[10px] font-black uppercase tracking-widest border-b-4 border-[#141414]">
                 <th className="px-6 py-5">Member Identity</th>
                 <th className="px-6 py-5">Sex</th>
                 <th className="px-6 py-5">Engagement Status</th>
                 <th className="px-6 py-5">Enrolled Plan</th>
                 <th className="px-6 py-5 text-right">Join Date</th>
              </tr>
           </thead>
           <tbody className="divide-y-2 divide-[#141414] font-mono text-[11px]">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="animate-spin mx-auto opacity-20" size={40} /></td></tr>
              ) : members.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center opacity-20 font-black uppercase text-sm font-sans">Empty registry detected</td></tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                     <td className="px-6 py-4">
                        <div className="font-sans">
                           <p className="font-black uppercase tracking-tight text-xs">{m.name}</p>
                           <p className="text-[9px] font-bold opacity-40 uppercase">UID: {m.member_id} • {m.phone}</p>
                        </div>
                     </td>
                     <td className="px-6 py-4 uppercase opacity-40">{m.gender}</td>
                     <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 border-2 text-[9px] font-black uppercase ${
                          m.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 
                          m.status === 'Expired' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                          'bg-red-50 text-red-700 border-red-200'
                        }`}>
                           {m.status}
                        </span>
                     </td>
                     <td className="px-6 py-4 font-sans font-black uppercase text-[10px] opacity-60">
                        {m.member_plans?.name || 'N/A'}
                     </td>
                     <td className="px-6 py-4 text-right font-sans font-black opacity-60">
                        {format(new Date(m.created_at), 'dd MMM yy')}
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
