import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  UserPlus, 
  CreditCard, 
  ChevronRight, 
  TrendingUp, 
  Search, 
  Clock, 
  Calendar,
  IndianRupee,
  Activity,
  ArrowRight
} from 'lucide-react';
import { format, startOfMonth } from 'date-fns';
import { motion } from 'motion/react';

export default function StaffDashboard() {
  const { profile, gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeMembers: 0,
    newMembersMonth: 0,
    todayCollection: 0,
    pendingDues: 0
  });

  useEffect(() => {
    fetchStaffStats();
  }, [profile]);

  async function fetchStaffStats() {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const firstDayMonth = format(startOfMonth(new Date()), 'yyyy-MM-dd');

      const [
        { count: activeCount },
        { count: newCount },
        { data: todayPayments },
        { data: allDues }
      ] = await Promise.all([
        supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'Active'),
        supabase.from('members').select('*', { count: 'exact', head: true }).gte('joining_date', firstDayMonth),
        supabase.from('payments').select('amount').eq('payment_date', today),
        supabase.from('member_plans').select('due_amount').eq('status', 'Active')
      ]);

      setStats({
        activeMembers: activeCount || 0,
        newMembersMonth: newCount || 0,
        todayCollection: todayPayments?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0,
        pendingDues: allDues?.reduce((acc, curr) => acc + (curr.due_amount || 0), 0) || 0
      });
    } catch (error) {
      console.error('Error fetching staff stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><Clock className="animate-spin text-[#E13D4B]" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Staff Hero */}
      <div className="bg-gray-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl shadow-gray-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E13D4B] rounded-full -mr-32 -mt-32 blur-[80px] opacity-20" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight leading-tight">
              Good Morning, <span className="text-[#E13D4B]">{profile?.name || 'Staff'}</span>!
            </h1>
            <p className="text-white/50 text-sm font-medium">You are managing <span className="text-white font-black">{stats.activeMembers} active warriors</span> today.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/members/add" className="px-6 py-3 bg-[#E13D4B] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-2 group">
              <UserPlus size={16} /> Quick Add Member
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
           { label: 'Active Members', value: stats.activeMembers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
           { label: 'New This Month', value: stats.newMembersMonth, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
           { label: "Today's Collection", value: `₹${stats.todayCollection}`, icon: IndianRupee, color: 'text-[#E13D4B]', bg: 'bg-rose-50' },
           { label: 'Outstanding Dues', value: `₹${stats.pendingDues}`, icon: CreditCard, color: 'text-amber-500', bg: 'bg-amber-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] shadow-xl shadow-gray-100 border border-gray-50 flex items-center gap-4">
             <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shrink-0`}>
                <stat.icon size={24} />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">{stat.label}</p>
                <p className="text-xl font-black text-gray-900">{stat.value}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Operational Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Collections */}
        <div className="lg:col-span-2 bg-white rounded-[32px] shadow-xl shadow-gray-100 border border-gray-50 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-widest text-[#141414]">Operational Roadmap</h2>
          </div>
          <div className="p-8 grid grid-cols-2 md:grid-cols-3 gap-4">
             {[
                { label: 'Lead Management', path: '/leads', icon: Users, desc: 'Track inquiries' },
                { label: 'Daily Expenses', path: '/expenses', icon: IndianRupee, desc: 'Log spending' },
                { label: 'Member List', path: '/members', icon: Users, desc: 'Manage directory' },
                { label: 'Visitor Logs', path: '/visitors', icon: Search, desc: 'Front desk entries' },
                { label: 'Collection Report', path: '/reports/collection', icon: Activity, desc: 'Revenue flow' },
                { label: 'Attendance History', path: '/attendance', icon: Calendar, desc: 'Audit logs' }
             ].map((tool, i) => (
                <Link key={i} to={tool.path} className="p-6 bg-gray-50 rounded-3xl border border-transparent hover:border-[#E13D4B] hover:bg-white transition-all group">
                   <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-gray-400 group-hover:text-[#E13D4B] mb-4">
                      <tool.icon size={20} />
                   </div>
                   <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-900 mb-1">{tool.label}</h3>
                   <p className="text-[9px] font-bold text-gray-400 uppercase leading-tight">{tool.desc}</p>
                </Link>
             ))}
          </div>
        </div>

        {/* Reminders / Status */}
        <div className="space-y-6">
           <div className="bg-rose-50 rounded-[32px] p-8 border border-rose-100 shadow-xl shadow-rose-50/50">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E13D4B] mb-4">Urgent Attention</h2>
              <div className="space-y-4">
                 <div className="flex gap-4 p-4 bg-white rounded-2xl border border-rose-100 shadow-sm">
                    <div className="w-8 h-8 bg-rose-50 text-[#E13D4B] rounded-lg flex items-center justify-center shrink-0">
                       <Clock size={16} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-gray-900">Renewals Due</p>
                       <p className="text-[9px] font-bold text-rose-500 uppercase">12 Members expiring this week</p>
                    </div>
                 </div>
                 <div className="flex gap-4 p-4 bg-white rounded-2xl border border-rose-100 shadow-sm">
                    <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
                       <IndianRupee size={16} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-gray-900">Highest Dues</p>
                       <p className="text-[9px] font-bold text-amber-500 uppercase">Rahul Sharma: ₹2,500 pending</p>
                    </div>
                 </div>
              </div>
              <Link to="/reports/due" className="mt-6 w-full py-4 bg-white text-[#E13D4B] font-black text-[10px] uppercase tracking-widest rounded-2xl border-2 border-[#E13D4B] hover:bg-[#E13D4B] hover:text-white transition-all flex items-center justify-center gap-2">
                 Generate Due List <ArrowRight size={14} />
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
