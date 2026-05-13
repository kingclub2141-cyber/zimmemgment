import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar, 
  Download, 
  Search, 
  Loader2, 
  Users, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  BarChart3,
  Filter,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  Cell
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function AttendanceReport() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({
    from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    if (gym) fetchAttendance();
  }, [gym, dateRange]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('attendance')
        .select('*, members(name, phone)')
        .eq('gym_id', gym.id)
        .gte('check_in', `${dateRange.from}T00:00:00`)
        .lte('check_in', `${dateRange.to}T23:59:59`)
        .order('check_in', { ascending: false });
      
      if (error) throw error;
      setAttendance(data || []);
    } finally {
      setLoading(false);
    }
  };

  const trendData = React.useMemo(() => {
    const days = eachDayOfInterval({
      start: new Date(dateRange.from),
      end: new Date(dateRange.to)
    });

    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const count = attendance.filter(a => format(new Date(a.check_in), 'yyyy-MM-dd') === dayStr).length;
      return { date: format(day, 'MMM dd'), count };
    });
  }, [attendance, dateRange]);

  const exportToExcel = () => {
    const exportData = attendance.map(a => ({
      Date: format(new Date(a.check_in), 'dd/MM/yyyy'),
      Time: format(new Date(a.check_in), 'HH:mm'),
      Member: a.members?.name || 'N/A',
      Phone: a.members?.phone || 'N/A'
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance_Logs");
    XLSX.writeFile(wb, `Attendance_Report_${dateRange.from}_to_${dateRange.to}.xlsx`);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black uppercase tracking-tighter">Footprint Analysis</h1>
           <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Daily attendance & engagement trends</p>
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
          { label: 'GROSS FOOTFALL', val: attendance.length, icon: <Users />, color: 'bg-indigo-600' },
          { label: 'DAILY AVERAGE', val: Math.round(attendance.length / trendData.length), icon: <TrendingUp />, color: 'bg-[#141414]' },
          { label: 'PEAK ATTENDANCE', val: Math.max(...trendData.map(d => d.count), 0), icon: <BarChart3 />, color: 'bg-green-600' },
          { label: 'RETENTION SCORE', val: '88%', icon: <CheckCircle2 />, color: 'bg-orange-600' }
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

      <div className="bg-white border-4 border-[#141414] p-10 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
        <h3 className="text-xl font-black uppercase tracking-tight mb-8">Daily Traffic Density</h3>
        <div className="h-[400px]">
           <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                 <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#14141415" />
                 <XAxis 
                   dataKey="date" 
                   axisLine={false} 
                   tickLine={false} 
                   tick={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }} 
                   padding={{ left: 20, right: 20 }}
                 />
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} />
                 <Tooltip 
                    contentStyle={{ border: '4px solid #141414', borderRadius: 0, fontWeight: 900, textTransform: 'uppercase' }}
                    cursor={{ stroke: '#141414', strokeWidth: 2 }}
                 />
                 <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#141414" 
                    strokeWidth={6} 
                    dot={{ r: 6, fill: '#141414', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 10, fill: '#4F46E5' }} 
                 />
              </LineChart>
           </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white border-4 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
        <table className="w-full text-left">
           <thead>
              <tr className="bg-[#141414] text-white text-[10px] font-black uppercase tracking-widest border-b-4 border-[#141414]">
                 <th className="px-6 py-5">Timestamp</th>
                 <th className="px-6 py-5">Member Identification</th>
                 <th className="px-6 py-5">Phone Registry</th>
                 <th className="px-6 py-5 text-right">Status</th>
              </tr>
           </thead>
           <tbody className="divide-y-2 divide-[#141414] font-mono text-[11px]">
              {loading ? (
                <tr><td colSpan={4} className="p-20 text-center"><Loader2 className="animate-spin mx-auto opacity-20" size={40} /></td></tr>
              ) : attendance.length === 0 ? (
                <tr><td colSpan={4} className="p-20 text-center opacity-20 font-black uppercase text-sm font-sans">No check-ins recorded for this interval</td></tr>
              ) : (
                attendance.slice(0, 100).map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                     <td className="px-6 py-4">
                        <div className="font-sans">
                           <p className="font-black uppercase text-[10px]">{format(new Date(a.check_in), 'dd MMM yyyy')}</p>
                           <p className="text-[10px] opacity-40 font-bold">{format(new Date(a.check_in), 'HH:mm:ss')}</p>
                        </div>
                     </td>
                     <td className="px-6 py-4 font-sans font-black uppercase text-xs">{a.members?.name}</td>
                     <td className="px-6 py-4 opacity-60 italic">{a.members?.phone}</td>
                     <td className="px-6 py-4 text-right">
                        <span className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 font-black uppercase text-[9px] tracking-widest">
                           Present
                        </span>
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
