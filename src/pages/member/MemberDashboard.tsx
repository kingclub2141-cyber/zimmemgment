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
  IndianRupee,
  LayoutDashboard,
  UserCircle,
  LogOut
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
    notifications: [] as any[],
    attendanceCount: 18, // Mock for now or fetch from DB
    dietToday: {
      breakfast: '2 Eggs & Oats',
      lunch: 'Chicken & Rice',
      snacks: 'Protein Shake',
      dinner: 'Grilled Fish'
    }
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
      const { data: currentPlans } = await supabase
        .from('member_plans')
        .select('*, plans(*)')
        .eq('member_id', profile.member_id)
        .eq('status', 'Active')
        .order('created_at', { ascending: false });
      
      const activePlan = currentPlans?.[0] || null;

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
        .limit(2);

      // Fetch monthly attendance count
      const startOfMonth = format(new Date(), 'yyyy-MM-01');
      const { count: attCount } = await supabase
        .from('attendance')
        .select('*', { count: 'exact', head: true })
        .eq('member_id', profile.member_id)
        .gte('attendance_date', startOfMonth);

      // Fetch diet plan
      const { data: dietData } = await supabase
        .from('diet_plans')
        .select('*')
        .eq('member_id', profile.member_id)
        .eq('day_number', new Date().getDay() || 7) // 1-7
        .maybeSingle();

      setStats({
        activePlan: activePlan,
        dueAmount: totalDue,
        todayAttendance: attendance,
        recentPayments: payments || [],
        notifications: notifications || [],
        attendanceCount: attCount || 0,
        dietToday: {
          breakfast: dietData?.breakfast || 'Not specified',
          lunch: dietData?.lunch || 'Not specified',
          snacks: dietData?.snacks || 'Not specified',
          dinner: dietData?.dinner || 'Not specified'
        }
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
        punch_in_time: format(now, 'HH:mm:ss'),
        attendance_date: format(now, 'yyyy-MM-dd'),
        status: 'Present',
        gym_id: profile.gym_id
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
        punch_out_time: format(now, 'HH:mm:ss')
      }).eq('id', stats.todayAttendance.id);

      if (error) throw error;
      toast.success('Punched out successfully');
      fetchDashboardData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-[#E4E3E0]"><Clock className="animate-spin text-[#E13D4B]" size={48} /></div>;
  
  const expiryDate = stats.activePlan?.expiry_date ? new Date(stats.activePlan.expiry_date) : null;
  const daysInMonth = 25; // Standard gym assumption

  return (
    <div className="space-y-8 pb-10">
      {/* Top Navigation Mock Header */}
      <div className="flex items-center justify-between bg-white border-4 border-[#141414] p-4 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#E13D4B] rounded flex items-center justify-center text-white">
            <Bell size={20} />
          </div>
          <span className="font-black uppercase tracking-widest text-sm italic">ZimmeManagement</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/member/profile" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:text-[#E13D4B] transition-colors">
            <UserCircle size={20} /> My Profile
          </Link>
          <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#E13D4B]">
             <LogOut size={20} /> Logout
          </button>
        </div>
      </div>

      {/* Main Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">My Plan</p>
          <h3 className="text-2xl font-black uppercase text-[#E13D4B]">{stats.activePlan?.plans?.plan_name || 'No Plan'}</h3>
          <p className="text-xs font-bold text-gray-400 mt-1">Exp: {safeFormat(stats.activePlan?.expiry_date, 'dd/MM')}</p>
        </div>
        <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Due Amount</p>
          <h3 className={`text-2xl font-black uppercase ${stats.dueAmount > 0 ? 'text-[#E13D4B]' : 'text-green-500'}`}>₹{stats.dueAmount}</h3>
          <p className="text-xs font-bold text-gray-400 mt-1">{stats.dueAmount > 0 ? 'Payment Pending' : 'No Due'}</p>
        </div>
        <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2">Attendance</p>
          <h3 className="text-2xl font-black uppercase flex items-center gap-2">
            {stats.todayAttendance ? (
              <><span className="text-green-500">✅ Present</span></>
            ) : (
              <><span className="text-rose-500">❌ Absent</span></>
            )}
          </h3>
          <p className="text-xs font-bold text-gray-400 mt-1">
            {stats.todayAttendance?.punch_in_time ? safeFormat(`2000-01-01T${stats.todayAttendance.punch_in_time}`, 'hh:mm a') : '--:--'}
          </p>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
         <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2 text-gray-400">
           <Zap size={14} className="text-[#E13D4B]" /> QUICK ACTIONS
         </h2>
         <div className="flex flex-wrap gap-4">
            <button 
              onClick={handlePunchIn}
              disabled={!!stats.todayAttendance}
              className="px-8 py-3 bg-[#141414] text-white font-black uppercase text-xs tracking-widest hover:bg-[#E13D4B] transition-all disabled:opacity-30 shadow-[4px_4px_0px_0px_rgba(225,61,75,1)] hover:shadow-none"
            >
              Punch In
            </button>
            <button 
              onClick={handlePunchOut}
              disabled={!stats.todayAttendance || !!stats.todayAttendance.punch_out_time}
              className="px-8 py-3 bg-white text-[#141414] border-2 border-[#141414] font-black uppercase text-xs tracking-widest hover:bg-gray-50 transition-all disabled:opacity-30 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
            >
              Punch Out
            </button>
            <Link 
              to="/member/my-plans" 
              className="px-8 py-3 bg-white text-[#141414] border-2 border-[#141414] font-black uppercase text-xs tracking-widest hover:bg-gray-50 transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
            >
              Renew
            </Link>
            <Link 
              to="/member/payments" 
              className="px-8 py-3 bg-white text-[#141414] border-2 border-[#141414] font-black uppercase text-xs tracking-widest hover:bg-gray-50 transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
            >
              Pay Due
            </Link>
         </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Attendance */}
        <div className="bg-white border-4 border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] flex items-center justify-between">
           <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-gray-400">📅 This Month</h2>
              <p className="text-3xl font-black italic">Attendance: {stats.attendanceCount}/{daysInMonth}</p>
              <p className="text-sm font-black text-[#E13D4B] mt-1">Percentage: {Math.round((stats.attendanceCount / daysInMonth) * 100)}%</p>
           </div>
           <div className="w-20 h-20 border-4 border-[#141414] flex items-center justify-center rounded-full bg-rose-50 p-2">
              <Calendar size={32} className="text-[#E13D4B]" />
           </div>
        </div>

        {/* Diet Plan */}
        <div className="bg-[#141414] text-white p-8 border-4 border-[#141414] shadow-[8px_8px_0px_0px_rgba(225,61,75,1)]">
           <h2 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-rose-500 flex items-center gap-2">
             <Apple size={14} />🥗 Today's Diet
           </h2>
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Breakfast</p>
                 <p className="text-xs font-bold truncate">{stats.dietToday.breakfast}</p>
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Lunch</p>
                 <p className="text-xs font-bold truncate">{stats.dietToday.lunch}</p>
              </div>
           </div>
           <Link to="/member/diet" className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest mt-6 hover:text-rose-400 transition-colors">
              Full Diet Plan <ChevronRight size={12} />
           </Link>
        </div>
      </div>

      {/* Recent Payments Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-widest italic">📜 RECENT PAYMENTS</h2>
        <div className="bg-white border-4 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
           {stats.recentPayments.length > 0 ? stats.recentPayments.map((p, idx) => (
             <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b-2 border-[#141414] last:border-0 hover:bg-rose-50 transition-colors">
                <div className="flex items-center gap-8 mb-4 sm:mb-0">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Date</p>
                    <p className="text-xs font-black">{safeFormat(p.payment_date, 'dd/MM/yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Amount</p>
                    <p className="text-xs font-black text-[#E13D4B]">₹{p.amount}</p>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Type</p>
                    <p className="text-xs font-black uppercase">Membership</p>
                  </div>
                </div>
                <Link 
                  to={`/payments/${p.id}/invoice`}
                  className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-[#141414] text-[10px] font-black uppercase tracking-widest hover:bg-[#141414] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
                >
                  [Receipt]
                </Link>
             </div>
           )) : (
             <div className="p-10 text-center text-gray-300 italic font-bold">No recent payments</div>
           )}
        </div>
      </div>

      {/* Notifications Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-black uppercase tracking-widest italic flex items-center gap-2">
          <Bell size={18} /> NOTIFICATIONS ({stats.notifications.length} unread)
        </h2>
        <div className="bg-white border-4 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
           {stats.notifications.length > 0 ? stats.notifications.map((n, idx) => (
             <div key={idx} className="p-6 border-b-2 border-[#141414] last:border-0 hover:bg-gray-50 transition-colors flex items-start gap-4">
                <div className="w-2 h-2 mt-1.5 bg-[#E13D4B] rounded-full shrink-0" />
                <div>
                   <p className="text-xs font-black uppercase mb-1">{n.title}</p>
                   <p className="text-[11px] font-bold text-gray-500">{n.message}</p>
                </div>
             </div>
           )) : (
             <div className="p-10 text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2">
                   <Bell size={24} className="opacity-20" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">No new notifications</p>
             </div>
           )}
        </div>
      </div>
      
      {/* Mobile Bottom Bar Legend (Responsive Only) */}
      <div className="md:hidden flex items-center justify-around bg-white border-t-4 border-[#141414] fixed bottom-0 left-0 right-0 p-4 z-[55]">
         <Link to="/member/dashboard" className="flex flex-col items-center gap-1 text-[#E13D4B]">
           <LayoutDashboard size={20} />
           <span className="text-[8px] font-black uppercase">Home</span>
         </Link>
         <Link to="/member/my-plans" className="flex flex-col items-center gap-1 text-gray-400">
           <CreditCard size={20} />
           <span className="text-[8px] font-black uppercase">Plan</span>
         </Link>
         <Link to="/member/attendance" className="flex flex-col items-center gap-1 text-gray-400">
           <Calendar size={20} />
           <span className="text-[8px] font-black uppercase">Attend</span>
         </Link>
         <Link to="/member/diet" className="flex flex-col items-center gap-1 text-gray-400">
           <Apple size={20} />
           <span className="text-[8px] font-black uppercase">Diet</span>
         </Link>
         <Link to="/member/notifications" className="flex flex-col items-center gap-1 text-gray-400">
           <Bell size={20} />
           <span className="text-[8px] font-black uppercase">Notif</span>
         </Link>
      </div>
    </div>
  );
}
