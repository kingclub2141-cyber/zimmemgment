import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, BarChart2, PieChart, TrendingUp, Calendar, Zap, 
  ArrowUpRight, Users2, Target, Clock, Download, Loader2 
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell 
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { toast } from 'sonner';

export default function VisitorAnalytics() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    total: 0,
    active: 0,
    conversions: 0,
    avgDuration: 0,
    dailyTraffic: [],
    purposeDistribution: [],
    conversionRate: 0
  });

  useEffect(() => {
    if (gym) fetchStats();
  }, [gym]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      
      const { data: visitors, error } = await supabase
        .from('visitors')
        .select('*')
        .eq('gym_id', gym.id)
        .gte('created_at', thirtyDaysAgo);

      if (error) throw error;

      // Process Stats
      const total = visitors.length;
      const active = visitors.filter(v => !v.time_out).length;
      const converted = visitors.filter(v => v.status.includes('Converted')).length;
      
      // Hourly peak logic (bar chart)
      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i}:00`,
        count: 0
      }));
      
      visitors.forEach(v => {
        const hour = new Date(v.created_at).getHours();
        hourlyData[hour].count++;
      });

      // Purpose distribution (pie chart)
      const purposeMap: any = {};
      visitors.forEach(v => {
        purposeMap[v.purpose] = (purposeMap[v.purpose] || 0) + 1;
      });
      const purposeData = Object.entries(purposeMap).map(([name, value]) => ({ name, value }));

      setStats({
        total,
        active,
        conversions: converted,
        dailyTraffic: hourlyData,
        purposeDistribution: purposeData,
        conversionRate: total > 0 ? ((converted / total) * 100).toFixed(1) : 0
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#141414', '#4F46E5', '#EF4444', '#10B981', '#F59E0B', '#6366F1'];

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-8 border-[#141414] pb-10">
        <div>
           <h1 className="text-5xl font-black uppercase tracking-tighter italic">Traffic Intelligence</h1>
           <p className="text-sm font-black uppercase tracking-[0.4em] opacity-40">Entry logs & conversion forensics</p>
        </div>
      </div>

      {loading ? (
         <div className="py-40 text-center"><Loader2 className="animate-spin mx-auto opacity-20" size={48} /></div>
      ) : (
         <>
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
               {[
                  { label: 'Cumulative Entry', val: stats.total, sub: 'Last 30 Days', icon: <Users size={24}/>, color: 'indigo-500' },
                  { label: 'Current Load', val: stats.active, sub: 'Active Sessions', icon: <Zap size={24}/>, color: 'emerald-500' },
                  { label: 'Conv. Registry', val: stats.conversions, sub: 'Lead/Member', icon: <Target size={24}/>, color: 'orange-500' },
                  { label: 'Success Ratio', val: `${stats.conversionRate}%`, sub: 'Efficiency', icon: <TrendingUp size={24}/>, color: 'rose-500' }
               ].map((item, i) => (
                  <div key={i} className="bg-white border-8 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] relative overflow-hidden group">
                     <div className={`absolute top-0 right-0 w-2 h-full bg-${item.color}`} />
                     <div className="flex items-center gap-4 mb-6 opacity-40 group-hover:scale-110 transition-transform origin-left">
                        {item.icon}
                        <h3 className="text-[10px] font-black uppercase tracking-widest">{item.label}</h3>
                     </div>
                     <p className="text-5xl font-black italic mb-2">{item.val}</p>
                     <p className="text-[9px] font-black uppercase opacity-20 tracking-widest">{item.sub}</p>
                  </div>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               {/* Peak Hours chart */}
               <div className="bg-white border-8 border-[#141414] p-10 shadow-[16px_16px_0px_0px_rgba(20,20,20,1)] space-y-10">
                  <div className="flex justify-between items-center border-b-4 border-[#141414] pb-6">
                     <h3 className="text-xl font-black uppercase tracking-tighter italic">Temporal Density (Peak Hours)</h3>
                     <BarChart2 className="opacity-20" />
                  </div>
                  <div className="h-[400px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.dailyTraffic}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#141414" strokeOpacity={0.05} />
                           <XAxis dataKey="hour" fontSize={10} fontWeight={900} tickLine={false} axisLine={false} />
                           <YAxis fontSize={10} fontWeight={900} tickLine={false} axisLine={false} />
                           <Tooltip 
                              cursor={{fill: '#141414', fillOpacity: 0.05}}
                              contentStyle={{backgroundColor: '#141414', border: 'none', borderRadius: '0', color: '#fff'}}
                           />
                           <Bar dataKey="count" fill="#141414" />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               {/* Purpose Distribution */}
               <div className="bg-white border-8 border-[#141414] p-10 shadow-[16px_16px_0px_0px_rgba(20,20,20,1)] space-y-10">
                  <div className="flex justify-between items-center border-b-4 border-[#141414] pb-6">
                     <h3 className="text-xl font-black uppercase tracking-tighter italic">Strategic Purpose Distribution</h3>
                     <PieChart className="opacity-20" />
                  </div>
                  <div className="h-[400px] flex items-center">
                     <div className="flex-1 h-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <RePieChart>
                              <Pie
                                 data={stats.purposeDistribution}
                                 innerRadius={80}
                                 outerRadius={120}
                                 paddingAngle={10}
                                 dataKey="value"
                              >
                                 {stats.purposeDistribution.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                 ))}
                              </Pie>
                              <Tooltip />
                           </RePieChart>
                        </ResponsiveContainer>
                     </div>
                     <div className="w-1/3 space-y-4">
                        {stats.purposeDistribution.map((item: any, i: number) => (
                           <div key={i} className="flex items-center gap-3">
                              <div className="w-4 h-4" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                              <span className="text-[10px] font-black uppercase tracking-tighter">{item.name} ({item.value})</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* Insight block */}
            <div className="bg-[#141414] text-white p-12 border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,0.1)] flex flex-col md:flex-row items-center gap-12">
               <TrendingUp size={64} className="opacity-20" />
               <div className="space-y-4 flex-1 text-center md:text-left">
                  <h4 className="text-2xl font-black uppercase italic tracking-tighter">Conversion Yield Optimization</h4>
                  <p className="text-xs font-medium uppercase opacity-40 leading-relaxed tracking-widest max-w-2xl">
                     Current forensics indicate a {stats.conversionRate}% conversion yield. Peak entry detected at {stats.dailyTraffic.sort((a:any, b:any) => b.count - a.count)[0]?.hour || 'N/A'}. Recommend increasing front-terminal staff during this window.
                  </p>
               </div>
               <button className="px-10 py-5 bg-white text-[#141414] font-black uppercase tracking-[0.4em] text-xs hover:invert transition-all">
                  Optimize Protocol
               </button>
            </div>
         </>
      )}
    </div>
  );
}
