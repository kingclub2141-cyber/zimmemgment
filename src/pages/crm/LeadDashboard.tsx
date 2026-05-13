import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  UserCheck, 
  Target, 
  Clock, 
  Loader2,
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line
} from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths, isToday } from 'date-fns';
import { Link } from 'react-router-dom';

export default function LeadDashboard() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    convertedLeads: 0,
    conversionRate: 0,
    todayFollowups: 0,
    overdueFollowups: 0
  });
  const [sourceData, setSourceData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [todayList, setTodayList] = useState<any[]>([]);

  useEffect(() => {
    if (gym) fetchDashboardData();
  }, [gym]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const start = startOfMonth(now);
      const end = endOfMonth(now);

      const { data: leads } = await supabase
        .from('leads')
        .select('*, lead_sources(name)')
        .eq('gym_id', gym.id);

      if (leads) {
        const thisMonth = leads.filter(l => new Date(l.created_at) >= start && new Date(l.created_at) <= end);
        const converted = leads.filter(l => l.status === 'Converted').length;
        const todayFU = leads.filter(l => l.next_followup_date && isToday(new Date(l.next_followup_date))).length;
        const overdueFU = leads.filter(l => l.next_followup_date && new Date(l.next_followup_date) < now && !isToday(new Date(l.next_followup_date)) && l.status === 'Pending').length;

        setStats({
          totalLeads: thisMonth.length,
          convertedLeads: leads.filter(l => l.status === 'Converted' && new Date(l.converted_at || l.created_at) >= start).length,
          conversionRate: leads.length ? (converted / leads.length) * 100 : 0,
          todayFollowups: todayFU,
          overdueFollowups: overdueFU
        });

        const sources: any = {};
        leads.forEach(l => {
          const sName = l.lead_sources?.name || 'Unknown';
          sources[sName] = (sources[sName] || 0) + 1;
        });
        setSourceData(Object.keys(sources).map(k => ({ name: k, value: sources[k] })));

        const status: any = {};
        leads.forEach(l => {
          status[l.status] = (status[l.status] || 0) + 1;
        });
        setStatusData(Object.keys(status).map(k => ({ name: k, count: status[k] })));
        
        setTodayList(leads.filter(l => l.next_followup_date && isToday(new Date(l.next_followup_date))));
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#141414', '#3b82f6', '#10b981', '#f59e0b', '#ee4444'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">CRM Dashboard</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Marketing Performance Analytics</p>
        </div>
        <Link 
          to="/leads/add" 
          className="flex items-center justify-center gap-3 bg-[#141414] text-white px-8 py-4 border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]"
        >
          Add New Lead
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: 'Leads (MTD)', value: stats.totalLeads, color: 'bg-blue-100', icon: <Users size={16}/> },
          { label: 'Conversions', value: stats.convertedLeads, color: 'bg-green-100', icon: <UserCheck size={16}/> },
          { label: 'Conv. Rate', value: `${stats.conversionRate.toFixed(1)}%`, color: 'bg-yellow-100', icon: <TrendingUp size={16}/> },
          { label: 'Today F/U', value: stats.todayFollowups, color: 'bg-red-100', icon: <Clock size={16}/> },
          { label: 'Overdue F/U', value: stats.overdueFollowups, color: 'bg-gray-100', icon: <Target size={16}/> },
        ].map((stat, i) => (
          <div key={i} className="bg-white border-4 border-[#141414] p-6 shadow-[6px_6px_0px_0px_rgba(20,20,20,1)]">
            <div className={`w-8 h-8 ${stat.color} flex items-center justify-center mb-4 border-2 border-[#141414]`}>
              {stat.icon}
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">{stat.label}</p>
            <p className="text-2xl font-black tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
              <h3 className="text-sm font-black uppercase tracking-widest mb-8 border-b-2 border-[#141414] pb-2">Funnel Health</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="h-[250px]">
                    <p className="text-[10px] font-black uppercase text-center mb-4 opacity-40">By Lead Source</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={sourceData} innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                          {sourceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="h-[250px]">
                    <p className="text-[10px] font-black uppercase text-center mb-4 opacity-40">By Current Status</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusData}>
                        <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                        <YAxis hide />
                        <Tooltip />
                        <Bar dataKey="count" fill="#141414" />
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>

           <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
              <div className="p-6 border-b-4 border-[#141414] bg-[#f5f5f5] flex justify-between items-center">
                 <h3 className="text-sm font-black uppercase tracking-widest">Today's Hot Follow-ups</h3>
                 <Link to="/leads?followUpFilter=today" className="text-[10px] font-black uppercase underline">View All</Link>
              </div>
              <div className="divide-y-2 divide-[#141414]">
                 {loading ? (
                   <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto" /></div>
                 ) : todayList.length === 0 ? (
                   <div className="p-12 text-center text-[10px] font-black uppercase opacity-20">No tasks for today</div>
                 ) : (
                   todayList.map(l => (
                     <div key={l.id} className="p-6 flex items-center justify-between hover:bg-[#f5f5f5]">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-white border-2 border-[#141414] flex items-center justify-center font-black">
                              {l.name[0]}
                           </div>
                           <div>
                              <p className="font-black uppercase tracking-tight">{l.name}</p>
                              <p className="text-[10px] font-bold opacity-40">{l.phone}</p>
                           </div>
                        </div>
                        <Link to={`/leads/${l.id}`} className="p-3 border-2 border-[#141414] hover:bg-[#141414] hover:text-white transition-all">
                           <ArrowRight size={16} />
                        </Link>
                     </div>
                   ))
                 )}
              </div>
           </div>
        </div>

        <div className="space-y-8">
           <div className="bg-[#141414] text-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6">Quick Links</h3>
              <div className="space-y-3">
                 {[
                   { label: 'Manage Sources', to: '/lead-sources' },
                   { label: 'Status Categories', to: '/lead-categories' },
                   { label: 'View All Leads', to: '/leads' },
                   { label: 'Conversion Report', to: '/reports/crm' },
                 ].map(link => (
                   <Link 
                    key={link.to}
                    to={link.to} 
                    className="block w-full p-4 border-2 border-white/20 hover:bg-white hover:text-[#141414] font-black uppercase tracking-widest text-[10px] transition-all"
                   >
                     {link.label}
                   </Link>
                 ))}
              </div>
           </div>

           <div className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
              <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-40">Pro Tip</h3>
              <p className="text-xs font-bold leading-relaxed italic">
                "Leads mentioned within 5 minutes are 21x more likely to convert. Keep your follow-up game strong to boost your revenue."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
