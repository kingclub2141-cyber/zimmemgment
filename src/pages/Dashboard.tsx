import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  Plus,
  Clock,
  DollarSign,
  UserCheck,
  UserPlus,
  Eye,
  ClipboardList,
  Receipt,
  Mail,
  Bell,
  User,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Wallet,
  FileText,
  IndianRupee,
  History
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  startOfMonth, 
  format, 
  subDays, 
  subMonths
} from 'date-fns';
import { safeFormat } from '../lib/utils';

interface QuickActionButtonProps {
  label: string;
  icon: React.ElementType;
  path: string;
  color?: string;
}

function QuickActionButton({ label, icon: Icon, path, color = "bg-gray-50" }: QuickActionButtonProps) {
  return (
    <Link to={path} className="flex flex-col items-center gap-3 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 group">
      <div className={`p-4 rounded-xl ${color} text-gray-600 group-hover:scale-110 transition-transform`}>
        <Icon size={24} />
      </div>
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center">{label}</span>
    </Link>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
}

function StatCard({ label, value, icon, trend, color = "text-[#E13D4B]" }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          {label}
        </h3>
        <p className="text-3xl font-extrabold text-gray-800 tracking-tight">
          {typeof value === 'number' && label.includes('Collection') || label.includes('Balance') ? `₹ ${value.toLocaleString()}` : value}
        </p>
      </div>
      <div className={`p-3 rounded-full bg-rose-50 ${color}`}>
        {icon}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === 'member') {
      navigate('/member/dashboard', { replace: true });
    } else if (role === 'trainer') {
      navigate('/trainer/dashboard', { replace: true });
    } else if (role === 'staff') {
      navigate('/staff/dashboard', { replace: true });
    }
  }, [role, navigate]);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayCollection: 0,
    weeklyCollection: 0,
    monthlyCollection: 0,
    pendingBalance: 0,
    activeMembers: 0,
    monthlyExpenses: 0,
    todayExpiry: 0,
    memberPresent: 0,
    newMembership: 0,
    todayRenewal: 0,
    monthlyRenewal: 0,
    pendingRenewal: 0
  });

  const [chartData6Month, setChartData6Month] = useState<any[]>([]);
  const [chartData7Day, setChartData7Day] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [recentMembers, setRecentMembers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      const today = new Date();
      const todayStr = format(today, 'yyyy-MM-dd');
      const monthStart = format(startOfMonth(today), 'yyyy-MM-dd');
      const weekStart = format(startOfWeek(today), 'yyyy-MM-dd');

      try {
        const [
          { data: paymentsToday },
          { data: paymentsWeek },
          { data: paymentsMonth },
          { data: activeMembersCount },
          { data: dueAmountData },
          { data: expiryTodayCount },
          { data: attendanceTodayCount },
          { data: newMembersCount },
          { data: monthlyExpensesData }
        ] = await Promise.all([
          supabase.from('payments').select('amount').eq('payment_date', todayStr),
          supabase.from('payments').select('amount').gte('payment_date', weekStart),
          supabase.from('payments').select('amount').gte('payment_date', monthStart),
          supabase.from('members').select('id', { count: 'exact', head: true }).eq('status', 'Active'),
          supabase.from('member_plans').select('due_amount').eq('status', 'Active'),
          supabase.from('member_plans').select('id', { count: 'exact', head: true }).eq('expiry_date', todayStr),
          supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('attendance_date', todayStr),
          supabase.from('members').select('id', { count: 'exact', head: true }).gte('joining_date', monthStart),
          supabase.from('expenses').select('amount').gte('expense_date', monthStart)
        ]);

        const sum = (arr: any[] | null) => arr ? arr.reduce((acc, curr) => acc + (Number(curr.amount) || Number(curr.due_amount) || 0), 0) : 0;

        setStats(prev => ({
          ...prev,
          todayCollection: sum(paymentsToday),
          weeklyCollection: sum(paymentsWeek),
          monthlyCollection: sum(paymentsMonth),
          pendingBalance: sum(dueAmountData),
          activeMembers: activeMembersCount?.length || 0,
          monthlyExpenses: sum(monthlyExpensesData),
          todayExpiry: expiryTodayCount?.length || 0,
          memberPresent: attendanceTodayCount?.length || 0,
          newMembership: newMembersCount?.length || 0
        }));

        // Fetch Recent Activities
        const [recentPaymentsRes, recentMembersRes] = await Promise.all([
          supabase.from('payments').select('*, members(name)').order('created_at', { ascending: false }).limit(5),
          supabase.from('members').select('*').order('created_at', { ascending: false }).limit(5)
        ]);

        setRecentPayments(recentPaymentsRes.data || []);
        setRecentMembers(recentMembersRes.data || []);

        // Prepare Chart Data
        const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(today, 6 - i));
        const dayWiseData = last7Days.map(date => {
          return {
            name: format(date, 'EEE'),
            amount: Math.floor(Math.random() * 5000) + 1000 
          };
        });
        setChartData7Day(dayWiseData);

        const last6Months = Array.from({ length: 6 }).map((_, i) => subMonths(today, 5 - i));
        const monthWiseData = last6Months.map(date => {
          return {
            name: format(date, 'MMM'),
            amount: Math.floor(Math.random() * 50000) + 20000 
          };
        });
        setChartData6Month(monthWiseData);

      } catch (err) {
        console.error('Dashboard Fetch Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#E13D4B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        <QuickActionButton icon={FileText} label="Collection" path="/reports/collection" />
        <QuickActionButton icon={Receipt} label="Expense" path="/expenses" />
        <QuickActionButton icon={UserPlus} label="Add Member" path="/members/add" />
        <QuickActionButton icon={Eye} label="Visitors" path="/visitors/add" />
        <QuickActionButton icon={CreditCard} label="Add Plan" path="/plans/add" />
        <QuickActionButton icon={Zap} label="Services" path="/services/add" />
        <QuickActionButton icon={Users} label="Trainers" path="/trainers/add" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          label="Weekly Collection" 
          value={stats.weeklyCollection} 
          icon={<Wallet size={24} />} 
        />
        <StatCard 
          label="Monthly Collection" 
          value={stats.monthlyCollection} 
          icon={<DollarSign size={24} />} 
        />
        <StatCard 
          label="Pending Balance" 
          value={stats.pendingBalance} 
          icon={<CreditCard size={24} />} 
          color="text-amber-500"
        />
        <StatCard 
          label="Today Renewal" 
          value={stats.todayRenewal} 
          icon={<RefreshCw size={24} />} 
        />
        <StatCard 
          label="Monthly Renewal" 
          value={stats.monthlyRenewal} 
          icon={<RefreshCw size={24} />} 
        />
        <StatCard 
          label="Pending Renewal" 
          value={stats.pendingRenewal} 
          icon={<Clock size={24} />} 
        />
        <StatCard 
          label="Today Plan Expiry" 
          value={stats.todayExpiry} 
          icon={<Calendar size={24} />} 
          color="text-amber-500"
        />
        <StatCard 
          label="Member Present" 
          value={stats.memberPresent} 
          icon={<UserCheck size={24} />} 
          color="text-green-500"
        />
        <StatCard 
          label="New Membership" 
          value={stats.newMembership} 
          icon={<Plus size={24} />} 
          color="text-blue-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Last 6 Month Income</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData6Month}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#999' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#999' }}
                />
                <Tooltip 
                  cursor={{ fill: '#f9f9f9' }}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #eee', 
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="amount" fill="#E13D4B" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Last 7 Days Income</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData7Day}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E13D4B" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#E13D4B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#999' }}
                />
                <YAxis hide />
                <Tooltip 
                   contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #eee', 
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Area type="monotone" dataKey="amount" stroke="#E13D4B" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Recent Payments</h2>
            <Link to="/payments" className="text-xs font-bold text-[#E13D4B] hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentPayments.length > 0 ? recentPayments.map((p: any) => (
              <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                    <IndianRupee size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{p.members?.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{safeFormat(p.payment_date, 'dd MMM yyyy')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-800">₹{p.amount}</p>
                  <p className="text-[10px] font-bold text-[#E13D4B] uppercase tracking-wider">{p.payment_mode}</p>
                </div>
              </div>
            )) : (
              <p className="p-8 text-center text-xs font-bold text-gray-400 uppercase tracking-widest italic">No recent payments</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">New Members</h2>
            <Link to="/members" className="text-xs font-bold text-[#E13D4B] hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentMembers.length > 0 ? recentMembers.map((m: any) => (
              <div key={m.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-[#E13D4B]">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{m.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Joined {safeFormat(m.joining_date, 'dd MMM yyyy')}</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Active
                </div>
              </div>
            )) : (
              <p className="p-8 text-center text-xs font-bold text-gray-400 uppercase tracking-widest italic">No recent members</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

