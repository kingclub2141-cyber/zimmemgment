import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Calendar, 
  Clock, 
  Bell, 
  User, 
  ChevronRight, 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle, 
  MapPin,
  TrendingUp,
  Apple,
  History,
  Download,
  Zap,
  IndianRupee
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { format, differenceInDays, isValid, parseISO } from 'date-fns';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { safeFormat } from '../../lib/utils';

export default function MemberDashboard() {
  const { profile, gym } = useAuth();
  const [stats, setStats] = useState({
    activePlan: null as any,
    dueAmount: 0,
    todayAttendance: null as any,
    recentPayments: [] as any[],
    notifications: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.member_id) {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    try {
      // Fetch active plan
      const { data: plans } = await supabase
        .from('member_plans')
        .select('*, plans(*)')
        .eq('member_id', profile.member_id)
        .eq('status', 'Active')
        .maybeSingle();

      // Fetch due amount
      const { data: dueData } = await supabase
        .from('member_plans')
        .select('due_amount')
        .eq('member_id', profile.member_id);
      const totalDue = dueData?.reduce((acc, curr) => acc + (curr.due_amount || 0), 0) || 0;

      // Fetch today attendance
      const { data: attendance } = await supabase
        .from('attendance')
        .select('*')
        .eq('member_id', profile.member_id)
        .eq('attendance_date', format(new Date(), 'yyyy-MM-dd'))
        .maybeSingle();

      // Fetch recent payments
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('member_id', profile.member_id)
        .order('payment_date', { ascending: false })
        .limit(3);

      // Fetch notifications
      const { data: notifications } = await supabase
        .from('gym_notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        activePlan: plans,
        dueAmount: totalDue,
        todayAttendance: attendance,
        recentPayments: payments || [],
        notifications: notifications || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePunchIn = async () => {
    try {
      const now = new Date();
      const { error } = await supabase.from('attendance').insert({
        member_id: profile.member_id,
        punch_in_time: now.toISOString(),
        attendance_date: format(now, 'yyyy-MM-dd'),
        status: 'Present'
      });

      if (error) throw error;
      toast.success('Punched in successfully');
      fetchDashboardData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handlePunchOut = async () => {
    try {
      const now = new Date();
      const { error } = await supabase.from('attendance').update({
        punch_out_time: now.toISOString()
      }).eq('id', stats.todayAttendance.id);

      if (error) throw error;
      toast.success('Punched out successfully');
      fetchDashboardData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Clock className="animate-spin text-rose-500" /></div>;
  
  const expiryDate = stats.activePlan?.expiry_date ? new Date(stats.activePlan.expiry_date) : null;
  const daysLeft = (expiryDate && isValid(expiryDate)) ? differenceInDays(expiryDate, new Date()) : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">Namaste, {profile.name}! 👋</h1>
          <p className="text-gray-500 font-medium italic">Welcome to {gym?.name || 'Mera Gym'}</p>
        </div>
        <div className="flex items-center gap-4">
           <Link to="/member/notifications" className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500 relative hover:text-[#E13D4B] transition-colors">
             <Bell size={20} />
             <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#E13D4B] rounded-full border-2 border-white animate-pulse" />
           </Link>
           <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white font-black text-xs">
             {profile.name?.charAt(0)}
           </div>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Plan Card */}
        <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-100 border border-gray-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-[#E13D4B]">
              <CreditCard size={20} />
            </div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">My Plan</h3>
          </div>
          <p className="text-2xl font-black text-gray-900 mb-1">{stats.activePlan?.plans?.plan_name || 'No Plan'}</p>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Expires</p>
              <p className="text-xs font-bold text-gray-700">{safeFormat(stats.activePlan?.expiry_date, 'dd/MM/yyyy')}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-[#E13D4B] leading-none mb-0.5">{daysLeft}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Days Left</p>
            </div>
          </div>
        </div>

        {/* Due Card */}
        <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-100 border border-gray-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
              <IndianRupee size={20} />
            </div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Due Amount</h3>
          </div>
          <p className="text-2xl font-black text-gray-900 mb-1">₹{stats.dueAmount}</p>
          <div className="mt-4 pt-4 border-t border-gray-50">
            {stats.dueAmount > 0 ? (
              <p className="text-[10px] font-black text-[#E13D4B] uppercase tracking-widest">Payment Pending</p>
            ) : (
              <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">No Dues Outstanding</p>
            )}
          </div>
        </div>

        {/* Attendance Card */}
        <div className="bg-white p-6 rounded-2xl shadow-xl shadow-gray-100 border border-gray-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
              <Calendar size={20} />
            </div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attendance</h3>
          </div>
          <p className="text-2xl font-black text-gray-900 mb-1">{stats.todayAttendance ? '✅ Present' : '❌ Absent'}</p>
          <div className="mt-4 pt-4 border-t border-gray-50">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
              {stats.todayAttendance ? `Punched In: ${safeFormat(stats.todayAttendance.punch_in_time, 'hh:mm a')}` : 'Not Punched In Today'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-100 border border-gray-50">
        <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <Zap size={16} className="text-amber-500" /> Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={handlePunchIn}
            disabled={!!stats.todayAttendance}
            className="flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-[#E13D4B] text-white shadow-rose-100 hover:bg-[#c93542]"
          >
            Punch In
          </button>
          <button 
            onClick={handlePunchOut}
            disabled={!stats.todayAttendance || !!stats.todayAttendance.punch_out_time}
            className="flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-900 text-white shadow-gray-100 hover:bg-black"
          >
            Punch Out
          </button>
          <Link 
            to="/member/plans"
            className="flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg active:scale-95 bg-white border-2 border-[#E13D4B] text-[#E13D4B] hover:bg-rose-50"
          >
            Renew Plan
          </Link>
          <Link 
            to="/member/plans"
            className="flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg active:scale-95 bg-white border-2 border-gray-100 text-gray-600 hover:bg-gray-50"
          >
            Pay Due
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diet Plan Preview */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-50 flex flex-col">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                <Apple size={18} />
              </div>
              <h2 className="font-black text-sm uppercase tracking-widest">Today's Diet</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {[
              { meal: 'Breakfast', menu: '2 Boiled Eggs & Oatmeal' },
              { meal: 'Lunch', menu: 'Chicken Breast with Brown Rice' },
              { meal: 'Snacks', menu: 'Protein Shake & Almonds' },
              { meal: 'Dinner', menu: 'Grilled Fish & Steamed Veggies' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 group">
                <div className="w-1.5 h-10 bg-gray-100 rounded-full group-hover:bg-green-500 transition-all" />
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{item.meal}</p>
                  <p className="text-sm font-bold text-gray-700">{item.menu}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications & Activity */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-50">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center text-[#E13D4B]">
                  <Bell size={18} />
                </div>
                <h2 className="font-black text-sm uppercase tracking-widest text-[#141414]">Alerts</h2>
              </div>
            </div>
            <div className="p-2">
              {stats.notifications.length > 0 ? stats.notifications.map((n, i) => (
                <div key={i} className="p-4 hover:bg-gray-50 rounded-xl transition-all cursor-pointer group">
                  <p className="text-xs font-black text-gray-800 mb-0.5">{n.title}</p>
                  <p className="text-[11px] font-medium text-gray-500 line-clamp-1">{n.message}</p>
                  <p className="text-[9px] font-bold text-gray-400 mt-2 flex items-center gap-1 uppercase tracking-wider">
                    <Clock size={10} /> {safeFormat(n.created_at, 'dd MMM | hh:mm a')}
                  </p>
                </div>
              )) : (
                <div className="p-10 text-center text-gray-300">
                  <Bell size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-[10px] font-black uppercase tracking-widest">No new alerts</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-gray-900 text-white rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-black transition-all">
              <CreditCard size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Renew Plan</span>
            </button>
            <button className="p-4 bg-white border border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-rose-50 transition-all text-gray-600 hover:text-[#E13D4B]">
              <Calendar size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Attendance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-50 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white">
              <History size={18} />
            </div>
            <h2 className="font-black text-sm uppercase tracking-widest">Recent Payments</h2>
          </div>
          <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Mode</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.recentPayments.map((p, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-gray-600">{safeFormat(p.payment_date, 'dd MMM yyyy')}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-black text-gray-900 uppercase">Membership Fee</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-[#E13D4B]">₹{p.amount}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-[10px] font-black text-gray-600 rounded uppercase tracking-wider">{p.payment_mode}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-rose-50 text-[#666] hover:text-[#E13D4B] rounded-lg transition-all">
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {stats.recentPayments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-300 font-bold italic text-xs">No payment history found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
