import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  CheckCircle2, 
  Clock, 
  Info,
  ChevronRight,
  Zap,
  Star,
  Activity
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { safeFormat } from '../../lib/utils';

export default function MemberServices() {
  const { profile } = useAuth();
  const [memberServices, setMemberServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.member_id) {
      fetchServices();
    }
  }, [profile]);

  const fetchServices = async () => {
    try {
      const { data } = await supabase
        .from('member_services')
        .select(`
          *,
          services (*)
        `)
        .eq('member_id', profile.member_id)
        .order('created_at', { ascending: false });

      setMemberServices(data || []);
    } catch (error) {
      console.error('Error fetching member services:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
       {/* Header */}
       <div className="bg-[#E13D4B] p-10 -mx-8 -mt-8 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-black uppercase tracking-tighter">My Services</h1>
          <p className="text-rose-200 font-bold uppercase tracking-[0.2em] text-xs mt-2">Personalized add-ons and premium benefits</p>
        </div>
        <Gift className="absolute -bottom-10 -right-10 w-64 h-64 opacity-10 rotate-12" />
      </div>

      {loading ? (
        <div className="py-20 text-center"><Activity className="animate-spin mx-auto text-[#E13D4B]" /></div>
      ) : memberServices.length === 0 ? (
        <div className="bg-white border-4 border-dashed border-gray-200 p-20 text-center rounded-3xl">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight text-gray-400">No Services Found</h3>
          <p className="text-gray-400 text-sm mt-2 max-w-sm mx-auto">You haven't subscribed to any additional services yet. Contact gym management to upgrade your experience.</p>
          <button className="mt-8 px-8 py-3 bg-[#141414] text-white font-black uppercase text-xs tracking-widest hover:bg-black transition-all">Explore Services</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {memberServices.map((ms) => (
            <div key={ms.id} className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all p-8 flex flex-col group">
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-rose-50 text-[#E13D4B] border-2 border-[#E13D4B]">
                  <Zap size={24} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase opacity-30">Status</p>
                  <p className="text-xs font-black text-green-500 uppercase tracking-widest">{ms.status || 'Active'}</p>
                </div>
              </div>

              <h3 className="text-2xl font-black uppercase tracking-tight mb-2 group-hover:text-[#E13D4B] transition-colors">{ms.services?.name}</h3>
              <p className="text-xs font-bold text-gray-500 mb-6 flex-1">{ms.services?.description || 'Exclusive service accessible through your membership.'}</p>

              <div className="space-y-3 pt-6 border-t-2 border-[#141414] border-dashed">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Subscribed On</span>
                  </div>
                  <span className="text-xs font-black">{safeFormat(ms.created_at, 'dd MMM yyyy')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Star size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Type</span>
                  </div>
                  <span className="text-xs font-black uppercase">{ms.services?.type || 'Personal'}</span>
                </div>
              </div>

              <button className="w-full mt-8 py-3 bg-[#141414] text-white font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 group-hover:bg-[#E13D4B] transition-colors">
                 Manage Service <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Suggested Services */}
      <div className="mt-12">
         <h2 className="text-sm font-black uppercase tracking-widest mb-8 flex items-center gap-2">
           <Star size={20} className="text-[#E13D4B]" /> Recommended for you
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#141414] text-white p-8 border-4 border-[#141414] shadow-[8px_8px_0px_0px_rgba(225,61,75,1)]">
               <h4 className="text-lg font-black uppercase mb-2">Personal Training Pro</h4>
               <p className="text-xs opacity-60 mb-6">Get 1-on-1 sessions with our elite trainers to reach your goals faster.</p>
               <button className="text-xs font-black uppercase tracking-widest text-[#E13D4B] flex items-center gap-1 hover:translate-x-2 transition-transform">Learn More <ChevronRight size={14}/></button>
            </div>
            <div className="bg-white p-8 border-4 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
               <h4 className="text-lg font-black uppercase mb-2">Extended Access</h4>
               <p className="text-xs text-gray-400 mb-6">Early bird and night owl access to the gym 24/7.</p>
               <button className="text-xs font-black uppercase tracking-widest text-gray-900 flex items-center gap-1 hover:translate-x-2 transition-transform">Learn More <ChevronRight size={14}/></button>
            </div>
         </div>
      </div>
    </div>
  );
}
