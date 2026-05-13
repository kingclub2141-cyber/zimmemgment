import React, { useState, useEffect } from 'react';
import { Bell, Clock, Trash2, CheckCircle2, Info, AlertCircle, Calendar, CreditCard } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export default function NotificationsList() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchNotifications();
    }
  }, [profile]);

  const fetchNotifications = async () => {
    try {
      const { data } = await supabase
        .from('gym_notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      
      setNotifications(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await supabase.from('gym_notifications').update({ is_read: true }).eq('id', id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Renewal': return <Calendar size={18} />;
      case 'Payment': return <CreditCard size={18} />;
      case 'Alert': return <AlertCircle size={18} />;
      default: return <Bell size={18} />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'Renewal': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Payment': return 'bg-green-50 text-green-600 border-green-100';
      case 'Alert': return 'bg-rose-50 text-[#E13D4B] border-rose-100';
      default: return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Notifications</h1>
          <p className="text-gray-500 font-medium italic">Stay updated with your activities</p>
        </div>
        <button className="text-[10px] font-black text-[#E13D4B] uppercase tracking-widest hover:underline">
          Mark All Read
        </button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-[32px] p-12 text-center border-2 border-dashed border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 mx-auto mb-4">
              <Bell size={32} />
            </div>
            <h2 className="text-xl font-black text-gray-400 uppercase tracking-widest">No New Notifications</h2>
            <p className="text-xs text-gray-400 mt-2 font-medium">We'll let you know when something important happens.</p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.map((n, i) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={n.id}
                className={`bg-white rounded-3xl p-6 shadow-xl shadow-gray-100 border transition-all ${
                  !n.is_read ? 'border-[#E13D4B]/20 ring-1 ring-[#E13D4B]/5' : 'border-gray-50'
                }`}
              >
                <div className="flex gap-6">
                  <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center border ${getColors(n.type)}`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className={`text-sm font-black uppercase tracking-tight ${!n.is_read ? 'text-gray-900' : 'text-gray-500'}`}>
                        {n.title}
                      </h3>
                      <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap ml-4">
                        {format(new Date(n.created_at), 'dd MMM, hh:mm a')}
                      </span>
                    </div>
                    <p className={`text-xs font-medium leading-relaxed ${!n.is_read ? 'text-gray-600' : 'text-gray-400'}`}>
                      {n.message}
                    </p>
                    {!n.is_read && (
                      <button 
                        onClick={() => markAsRead(n.id)}
                        className="mt-4 px-3 py-1 bg-gray-900 text-white text-[8px] font-black uppercase tracking-widest rounded-full hover:bg-black transition-colors"
                      >
                        Got it
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
