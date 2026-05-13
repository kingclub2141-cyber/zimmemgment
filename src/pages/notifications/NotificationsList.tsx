import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Loader2, 
  Tag, 
  Zap, 
  Circle,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Package,
  Cake,
  Calendar,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function NotificationsList() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (gym) fetchNotifications();
  }, [gym]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('gym_id', gym.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setNotifications(data || []);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      if (error) throw error;
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };

  const markAllRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('gym_id', gym.id)
        .eq('is_read', false);
      
      if (error) throw error;
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast.success('All marked as read');
    } catch (error: any) {
      toast.error('Failed to update status');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success('Notification cleared');
    } catch (error: any) {
      toast.error('Failed to delete');
    }
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'Renewal': return <Clock className="text-amber-600" size={20} />;
      case 'Payment': return <TrendingUp className="text-green-600" size={20} />;
      case 'Stock': return <Package className="text-red-600" size={20} />;
      case 'Birthday': return <Cake className="text-indigo-600" size={20} />;
      case 'New Member': return <Zap className="text-indigo-600" size={20} />;
      default: return <Bell size={20} />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter === 'all') return true;
    return n.type.toLowerCase() === filter.toLowerCase();
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
              Intelligence Stream 
              {unreadCount > 0 && <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-sm">{unreadCount} NEW</span>}
           </h1>
           <p className="text-sm font-black uppercase tracking-[0.3em] opacity-40">System-wide event monitoring</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={markAllRead}
             className="px-6 py-3 border-4 border-[#141414] font-black uppercase text-[10px] tracking-widest hover:bg-[#141414] hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] active:shadow-none translate-y-0 active:translate-y-1"
           >
              Acknowledge All
           </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
         {['all', 'unread', 'Renewal', 'Payment', 'Stock', 'Birthday'].map(f => (
           <button 
             key={f}
             onClick={() => setFilter(f)}
             className={`px-6 py-3 border-4 font-black uppercase text-[10px] tracking-widest whitespace-nowrap transition-all ${
               filter === f ? 'bg-[#141414] text-white border-[#141414]' : 'bg-white text-[#141414] border-[#141414]/10 hover:border-[#141414]'
             }`}
           >
              {f}
           </button>
         ))}
      </div>

      <div className="space-y-6">
         {loading ? (
           <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto opacity-20" size={40} /></div>
         ) : filteredNotifications.length === 0 ? (
           <div className="py-20 text-center border-4 border-dashed border-[#141414]/10 bg-white">
              <Bell size={48} className="mx-auto mb-4 opacity-10" />
              <p className="font-black uppercase tracking-widest opacity-20">No events detected in this stream</p>
           </div>
         ) : filteredNotifications.map(n => (
           <div 
             key={n.id} 
             className={`relative group bg-white border-4 border-[#141414] p-8 shadow-[10px_10px_0px_0px_rgba(20,20,20,1)] transition-all ${
               !n.is_read ? 'border-indigo-600' : 'opacity-60 grayscale-[0.5]'
             }`}
           >
              {!n.is_read && <div className="absolute top-0 right-0 w-8 h-8 bg-indigo-600 text-white flex items-center justify-center font-black">!</div>}
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                 <div className="flex gap-6 items-start">
                    <div className={`p-4 border-4 border-[#141414] shadow-[4px_4px_0px_0px_rgba(30,30,30,0.1)] ${!n.is_read ? 'bg-indigo-50' : 'bg-gray-50'}`}>
                       {getIcon(n.type)}
                    </div>
                    <div className="space-y-2">
                       <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-[#141414] text-white">{n.type}</span>
                          <span className="text-[10px] font-bold opacity-40 flex items-center gap-1"><Calendar size={12}/> {format(new Date(n.created_at), 'MMMM dd, HH:mm')}</span>
                       </div>
                       <h3 className="text-xl font-black uppercase tracking-tight leading-tight">{n.title}</h3>
                       <p className="text-sm font-medium opacity-60 leading-relaxed italic pr-12">"{n.message}"</p>
                    </div>
                 </div>

                 <div className="flex gap-4 md:flex-col lg:flex-row">
                    {!n.is_read && (
                      <button 
                        onClick={() => markAsRead(n.id)}
                        className="flex-1 px-6 py-4 bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest hover:bg-indigo-700 transition-all shadow-[6px_6px_0px_0px_rgba(79,70,229,0.2)]"
                      >
                         Acknowledge
                      </button>
                    )}
                    {n.action_url && (
                      <Link 
                        to={n.action_url}
                        onClick={() => markAsRead(n.id)}
                        className="flex-1 px-6 py-4 border-4 border-[#141414] font-black uppercase text-[10px] tracking-widest hover:bg-[#141414] hover:text-white transition-all flex items-center justify-center gap-2"
                      >
                         Investigate <ArrowRight size={14}/>
                      </Link>
                    )}
                    <button 
                      onClick={() => deleteNotification(n.id)}
                      className="p-4 border-4 border-red-100 text-red-600 hover:bg-red-50 transition-all"
                    >
                       <X size={20} />
                    </button>
                 </div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
