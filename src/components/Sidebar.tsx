import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  ClipboardCheck, 
  UserX, 
  Apple, 
  IndianRupee, 
  AlertTriangle, 
  FileText, 
  Wallet, 
  PlusCircle, 
  ClipboardList, 
  Gift, 
  UserCheck, 
  Dumbbell, 
  Calendar, 
  ShoppingCart, 
  Package, 
  PlusSquare, 
  Tags, 
  History, 
  Briefcase, 
  Shield, 
  Target, 
  Radio, 
  Bookmark, 
  Bell, 
  DoorOpen, 
  AlertCircle, 
  BarChart, 
  PieChart, 
  TrendingUp, 
  Download, 
  Building, 
  Clock, 
  Activity, 
  MessageCircle, 
  Database, 
  Send, 
  HelpCircle, 
  List, 
  UserCircle, 
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  CreditCard,
  Key
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  userRole?: string;
  mobile?: boolean;
  onClose?: () => void;
}

interface MenuItem {
  label: string;
  path: string;
  icon: any;
  roles?: string[];
  badge?: string;
}

interface MenuGroup {
  title: string;
  icon: any;
  items: MenuItem[];
  roles?: string[];
}

export default function Sidebar({ collapsed, setCollapsed, mobile, onClose }: SidebarProps) {
  const location = useLocation();
  const { signOut, gym, user, role } = useAuth();
  const userRole = role || 'admin';
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['DASHBOARD', 'MY GYM']);

  const toggleGroup = (title: string) => {
    if (collapsed && !mobile) {
      setCollapsed(false);
      setExpandedGroups([title]);
      return;
    }
    setExpandedGroups(prev => 
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const menuGroups: MenuGroup[] = [
    {
      title: 'DASHBOARD',
      icon: LayoutDashboard,
      roles: ['admin', 'admin2', 'staff', 'trainer'],
      items: [
        { label: 'Admin Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'admin2'] },
        { label: 'Staff Dashboard', path: '/staff/dashboard', icon: LayoutDashboard, roles: ['staff'] },
        { label: 'Trainer Dashboard', path: '/trainer/dashboard', icon: LayoutDashboard, roles: ['trainer'] }
      ]
    },
    {
      title: 'MY GYM',
      icon: LayoutDashboard,
      roles: ['member'],
      items: [
        { label: 'Dashboard', path: '/member/dashboard', icon: LayoutDashboard },
        { label: 'My Profile', path: '/member/profile', icon: UserCircle },
        { label: 'My Plans', path: '/member/plans', icon: CreditCard },
        { label: 'My Attendance', path: '/member/attendance', icon: Calendar },
        { label: 'My Diet Plan', path: '/member/diet', icon: Apple },
        { label: 'My Payments', path: '/member/payments', icon: IndianRupee },
        { label: 'Notifications', path: '/member/notifications', icon: Bell }
      ]
    },
    {
      title: 'MEMBER MANAGEMENT',
      icon: Users,
      roles: ['admin', 'admin2', 'staff', 'trainer'],
      items: [
        { label: 'All Members', path: '/members', icon: Users },
        { label: 'Add Member', path: '/members/add', icon: UserPlus, roles: ['admin', 'admin2', 'staff'] },
        { label: 'Member Attendance', path: '/attendance', icon: ClipboardCheck },
        { label: 'Blocked Members', path: '/members/blocked', icon: UserX, roles: ['admin', 'admin2'] },
        { label: 'Member Diet', path: '/diet', icon: Apple }
      ]
    },
    {
      title: 'FINANCE & PAYMENTS',
      icon: IndianRupee,
      roles: ['admin', 'accountant'],
      items: [
        { label: 'Payments', path: '/payments', icon: IndianRupee },
        { label: 'Due Report', path: '/reports/due', icon: AlertTriangle },
        { label: 'Collection Report', path: '/reports/collection', icon: FileText },
        { label: 'Expenses', path: '/expenses', icon: Wallet },
        { label: 'Add Expense', path: '/expenses/add', icon: PlusCircle }
      ]
    },
    {
      title: 'PLANS & SERVICES',
      icon: ClipboardList,
      roles: ['admin', 'reception'],
      items: [
        { label: 'Membership Plans', path: '/plans', icon: ClipboardList },
        { label: 'Add Plan', path: '/plans/add', icon: PlusCircle },
        { label: 'Services', path: '/services', icon: Gift },
        { label: 'Assign Service', path: '/members', icon: UserCheck }
      ]
    },
    {
      title: 'TRAINER MANAGEMENT',
      icon: Dumbbell,
      roles: ['admin', 'trainer', 'staff'],
      items: [
        { label: 'Trainer Dashboard', path: '/trainer/dashboard', icon: LayoutDashboard, roles: ['trainer'] },
        { label: 'My Attendance', path: '/trainer/attendance', icon: Calendar, roles: ['trainer'] },
        { label: 'Trainer Payroll', path: '/trainers/attendance', icon: IndianRupee, roles: ['admin', 'staff'] },
        { label: 'All Trainers', path: '/trainers', icon: Dumbbell, roles: ['admin', 'staff'] },
        { label: 'Add Trainer', path: '/trainers/add', icon: UserPlus, roles: ['admin', 'staff'] }
      ]
    },
    {
      title: 'POS & STORE',
      icon: ShoppingCart,
      roles: ['admin', 'store_manager'],
      items: [
        { label: 'POS Billing', path: '/pos', icon: ShoppingCart },
        { label: 'Products', path: '/products', icon: Package },
        { label: 'Add Product', path: '/products/add', icon: PlusSquare },
        { label: 'Categories', path: '/categories', icon: Tags },
        { label: 'Orders History', path: '/orders', icon: History }
      ]
    },
    {
      title: 'STAFF & ROLES',
      icon: Briefcase,
      roles: ['admin'],
      items: [
        { label: 'Staff List', path: '/staff', icon: Briefcase },
        { label: 'Login Generator', path: '/staff/login-generator', icon: Key },
        { label: 'Add User', path: '/users/add', icon: UserPlus },
        { label: 'Roles & Permissions', path: '/roles', icon: Shield }
      ]
    },
    {
      title: 'CRM / LEADS',
      icon: Target,
      roles: ['admin', 'reception'],
      items: [
        { label: 'All Leads', path: '/leads', icon: Target },
        { label: 'Add Lead', path: '/leads/add', icon: UserPlus },
        { label: 'Lead Sources', path: '/lead-sources', icon: Radio },
        { label: 'Lead Categories', path: '/lead-categories', icon: Bookmark },
        { label: 'Follow-ups', path: '/leads', icon: Bell }
      ]
    },
    {
      title: 'VISITOR MANAGEMENT',
      icon: DoorOpen,
      roles: ['admin', 'reception'],
      items: [
        { label: 'All Visitors', path: '/visitors', icon: DoorOpen },
        { label: 'Add Visitor', path: '/visitors/add', icon: UserPlus }
      ]
    },
    {
      title: 'REPORTS',
      icon: BarChart,
      roles: ['admin', 'accountant'],
      items: [
        { label: 'Due Report', path: '/reports/due', icon: AlertCircle },
        { label: 'Collection Report', path: '/reports/collection', icon: BarChart },
        { label: 'Expense Report', path: '/reports/expense', icon: PieChart },
        { label: 'Attendance Report', path: '/reports/attendance', icon: Calendar },
        { label: 'Sales Report', path: '/reports/sales', icon: TrendingUp },
        { label: 'GST Report', path: '/reports/gst', icon: FileText },
        { label: 'Export Reports', path: '/reports', icon: Download }
      ]
    },
    {
      title: 'SETTINGS',
      icon: Building,
      roles: ['admin'],
      items: [
        { label: 'Gym Profile', path: '/settings/profile', icon: Building },
        { label: 'Batches', path: '/settings/batches', icon: Clock },
        { label: 'Activities', path: '/settings/activities', icon: Activity },
        { label: 'Invoice Settings', path: '/settings/invoice', icon: FileText },
        { label: 'SMS Settings', path: '/settings/sms', icon: MessageCircle },
        { label: 'Notification Settings', path: '/settings/notifications', icon: Bell },
        { label: 'Backup & Restore', path: '/settings/backup', icon: Database }
      ]
    },
    {
      title: 'SMS & NOTIFICATIONS',
      icon: Send,
      roles: ['admin', 'reception'],
      items: [
        { label: 'Send SMS', path: '/sms/send', icon: Send },
        { label: 'Bulk SMS', path: '/sms/bulk', icon: Users },
        { label: 'SMS History', path: '/sms/history', icon: Clock },
        { label: 'SMS Templates', path: '/sms/templates', icon: FileText },
        { label: 'Notifications', path: '/notifications', icon: Bell }
      ]
    },
    {
      title: 'SUPPORT',
      icon: HelpCircle,
      roles: ['admin'],
      items: [
        { label: 'Help', path: '/help', icon: HelpCircle },
        { label: 'Activity Log', path: '/staff/activity-log', icon: List },
        { label: 'System Health', path: '/dashboard', icon: Activity }
      ]
    }
  ];

  const filteredGroups = menuGroups.filter(group => {
    if (!group.roles) return true;
    return group.roles.includes(userRole.toLowerCase());
  });

  return (
    <aside 
      className={cn(
        "bg-white border-r border-gray-100 flex flex-col h-full transition-all duration-300 z-[60]",
        mobile ? "w-72" : (collapsed ? "w-20" : "w-72")
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 bg-[#E13D4B] text-white">
        <div className={cn("flex items-center gap-2 overflow-hidden transition-all", collapsed && !mobile ? "w-0 opacity-0" : "w-auto opacity-100")}>
          <Dumbbell className="shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="font-black text-sm tracking-tight whitespace-nowrap leading-none mb-0.5">Mera Gym</span>
            <span className="text-[9px] font-bold opacity-80 truncate">{gym?.name || 'Mera Gym Partner'}</span>
          </div>
        </div>
        {mobile ? (
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
            <X size={24} />
          </button>
        ) : (
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className={cn("p-1.5 hover:bg-white/10 rounded transition-all", collapsed ? "mx-auto" : "")}
          >
            <Menu size={20} />
          </button>
        )}
      </div>

      {/* Profile Section */}
      {!collapsed || mobile ? (
        <div className="p-4 border-b border-gray-50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-[#E13D4B]">
            <UserCircle size={24} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-gray-800 truncate">{user?.email?.split('@')[0] || 'User'}</span>
            <span className="text-[10px] font-bold text-[#E13D4B] uppercase tracking-wider">{userRole}</span>
          </div>
        </div>
      ) : (
        <div className="py-4 border-b border-gray-50 flex justify-center">
          <UserCircle size={24} className="text-[#E13D4B]" />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar pt-2 pb-10">
        {filteredGroups.map((group, index) => {
          const isExpanded = expandedGroups.includes(group.title);
          const hasActiveItem = group.items.some(item => location.pathname === item.path);

          return (
            <div key={`${group.title}-${index}`} className="mb-1">
              <button
                onClick={() => toggleGroup(group.title)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 transition-colors group",
                  hasActiveItem ? "text-[#E13D4B]" : "text-gray-500 hover:text-[#E13D4B] hover:bg-rose-50"
                )}
              >
                <group.icon size={20} className={cn("shrink-0", hasActiveItem ? "text-[#E13D4B]" : "text-gray-400 group-hover:text-[#E13D4B]")} />
                {(!collapsed || mobile) && (
                  <>
                    <span className="flex-1 text-[11px] font-black uppercase tracking-wider text-left truncate">{group.title}</span>
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </>
                )}
              </button>

              {((isExpanded && !collapsed) || mobile) && (
                <div className="bg-gray-50/50 py-1">
                  {group.items.filter(item => !item.roles || item.roles.includes(userRole.toLowerCase())).map((item, itemIndex) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={`${item.path}-${item.label}-${itemIndex}`}
                        to={item.path}
                        onClick={mobile ? onClose : undefined}
                        className={cn(
                          "flex items-center gap-3 pl-12 pr-4 py-2 text-xs font-bold transition-all border-l-2",
                          isActive 
                            ? "text-[#E13D4B] bg-white border-[#E13D4B]" 
                            : "text-gray-500 hover:text-[#E13D4B] hover:bg-rose-50 border-transparent hover:border-rose-200"
                        )}
                      >
                        <item.icon size={16} className="shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-2 border-t border-gray-100 bg-gray-50/50">
        <Link 
          to="/profile"
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-600 hover:text-[#E13D4B] hover:bg-white transition-all",
            collapsed && !mobile ? "justify-center" : ""
          )}
        >
          <UserCircle size={20} />
          {(!collapsed || mobile) && <span className="text-xs font-bold">Profile</span>}
        </Link>
        <button 
          onClick={() => signOut()}
          className={cn(
            "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-all mt-1",
            collapsed && !mobile ? "justify-center" : ""
          )}
        >
          <LogOut size={20} />
          {(!collapsed || mobile) && <span className="text-xs font-bold">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
