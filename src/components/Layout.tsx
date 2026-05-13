import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Bell, 
  Settings, 
  Menu,
  UserPlus,
  Eye,
  Receipt,
  BarChart3,
  ClipboardCheck,
  Utensils,
  MessageSquare,
  MessageCircle,
  Smartphone,
  Phone,
  Search,
  X,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';

const QuickIcon = ({ icon: Icon, label, path }: { icon: any, label: string, path: string }) => (
  <Link to={path} className="flex flex-col items-center gap-0.5 group shrink-0">
    <div className="p-1.5 text-gray-400 group-hover:text-[#E13D4B] transition-colors">
      <Icon size={18} />
    </div>
    <span className="text-[9px] font-black text-gray-400 group-hover:text-gray-600 uppercase tracking-tighter">{label}</span>
  </Link>
);

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { gym, isOwner, staff, signOut } = useAuth();

  const userRole = isOwner ? 'Admin' : (staff?.roles?.name || 'Staff');

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans text-[#333]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          setCollapsed={setSidebarCollapsed} 
          userRole={userRole} 
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-[100] md:hidden"
            />
            <motion.div 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="fixed inset-y-0 left-0 z-[101] md:hidden"
            >
              <Sidebar 
                collapsed={false} 
                setCollapsed={() => {}} 
                userRole={userRole} 
                mobile 
                onClose={() => setMobileMenuOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden pb-[60px]">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-100 sticky top-0 z-40 flex items-center justify-between px-4 md:px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
               <h2 className="text-[10px] font-black text-[#E13D4B] uppercase tracking-wider leading-none mb-0.5">Mera Gym</h2>
               <p className="text-sm font-bold text-gray-800 truncate max-w-[150px] sm:max-w-none">{gym?.name || 'My Fitness Center'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Global Search */}
            <Link 
              to="/search" 
              className="p-2 text-gray-400 hover:text-[#E13D4B] transition-colors hidden sm:block"
            >
              <Search size={20} />
            </Link>

            {/* Quick Actions Desktop */}
            <div className="hidden lg:flex items-center gap-5 pr-6 border-r border-gray-100">
              <QuickIcon icon={UserPlus} label="Member" path="/members/add" />
              <QuickIcon icon={Eye} label="Visitors" path="/visitors" />
              <QuickIcon icon={Receipt} label="Expense" path="/expenses" />
              <QuickIcon icon={ClipboardCheck} label="Attend" path="/attendance" />
              <QuickIcon icon={MessageSquare} label="SMS" path="/sms" />
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <button className="p-2 text-gray-400 hover:text-rose-500 transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
              </button>
              <Link to="/settings/profile" className="p-2 text-gray-400 hover:text-rose-500 transition-colors">
                <Settings size={20} />
              </Link>
              <button 
                onClick={() => signOut()}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all flex items-center gap-2 font-black uppercase text-[10px] tracking-widest px-3 border-2 border-transparent hover:border-rose-100"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 md:p-6 flex-1 pb-24 md:pb-20">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
               <motion.div
                 key={location.pathname}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.2 }}
               >
                 {children}
               </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2 flex items-center justify-between z-[60] shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
           <Link to="/dashboard" className={cn("flex flex-col items-center gap-1 p-2", location.pathname === '/dashboard' ? "text-[#E13D4B]" : "text-gray-400")}>
             <BarChart3 size={20} />
             <span className="text-[8px] font-black uppercase tracking-tighter">Dash</span>
           </Link>
           <Link to="/members" className={cn("flex flex-col items-center gap-1 p-2", location.pathname === '/members' ? "text-[#E13D4B]" : "text-gray-400")}>
             <UserPlus size={20} />
             <span className="text-[8px] font-black uppercase tracking-tighter">Members</span>
           </Link>
           <Link to="/attendance" className={cn("flex flex-col items-center gap-1 p-2", location.pathname === '/attendance' ? "text-[#E13D4B]" : "text-gray-400")}>
             <ClipboardCheck size={20} />
             <span className="text-[8px] font-black uppercase tracking-tighter">Attend</span>
           </Link>
           <Link to="/reports" className={cn("flex flex-col items-center gap-1 p-2", location.pathname.startsWith('/reports') ? "text-[#E13D4B]" : "text-gray-400")}>
             <Eye size={20} />
             <span className="text-[8px] font-black uppercase tracking-tighter">Reports</span>
           </Link>
           <Link to="/settings/profile" className={cn("flex flex-col items-center gap-1 p-2", location.pathname.startsWith('/settings') ? "text-[#E13D4B]" : "text-gray-400")}>
             <Settings size={20} />
             <span className="text-[8px] font-black uppercase tracking-tighter">Profile</span>
           </Link>
        </div>

        {/* Support Banner (Desktop Only) */}
        <div className="hidden md:flex fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-[60px] flex items-center justify-between px-4 md:px-6 z-50">
          <div className="flex items-center gap-2">
             <span className="text-[#E13D4B] font-black text-xs uppercase tracking-tight hidden lg:inline">Mera Gym Management Software</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                <MessageCircle size={14} className="fill-emerald-100" />
                <span className="text-[10px] font-black uppercase tracking-wider">Support: 6390008506</span>
             </div>
             <div className="hidden sm:flex items-center gap-4 text-gray-500">
                <div className="flex items-center gap-1">
                  <Smartphone size={14} />
                  <span className="text-[10px] font-bold">6390008506</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone size={14} />
                  <span className="text-[10px] font-bold">7267977827</span>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
