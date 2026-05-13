import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  Clock, 
  Calendar, 
  UserCheck, 
  ArrowRight,
  TrendingUp,
  MessageSquare,
  LayoutDashboard
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function TrainerDashboard() {
  const { staff, gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assignedMembers, setAssignedMembers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeClients: 0,
    todayClasses: 0,
    weeklyAttendance: 0
  });

  useEffect(() => {
    if (staff?.id) {
      fetchTrainerData();
    }
  }, [staff?.id]);

  async function fetchTrainerData() {
    setLoading(true);
    try {
      // Fetch members assigned to this trainer
      const { data: members, error } = await supabase
        .from('members')
        .select('*')
        .eq('trainer_id', staff.id);
      
      if (error) throw error;
      setAssignedMembers(members || []);
      setStats(prev => ({
        ...prev,
        activeClients: (members || []).filter(m => m.status === 'Active').length
      }));

      // In a real app, we'd fetch batches/classes and today's attendance here
      // For now using mock stats for these
      setStats(prev => ({
        ...prev,
        todayClasses: 4,
        weeklyAttendance: 92
      }));
    } catch (err) {
      console.error('Error fetching trainer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#E13D4B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-800">Trainer Pulse</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Command Center for {staff?.name}</p>
        </div>
        <div className="hidden md:block">
           <div className="bg-white border-4 border-[#141414] px-4 py-2 font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
              {format(new Date(), 'EEEE, MMMM dd')}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-rose-50 text-[#E13D4B] border-2 border-[#141414]">
                <Users size={20} />
             </div>
             <span className="text-[10px] font-black uppercase opacity-40">Client Base</span>
          </div>
          <p className="text-4xl font-black tracking-tighter">{stats.activeClients}</p>
          <p className="text-[10px] font-bold text-green-600 uppercase mt-2">Active Individuals</p>
        </div>

        <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-amber-50 text-amber-600 border-2 border-[#141414]">
                <Calendar size={20} />
             </div>
             <span className="text-[10px] font-black uppercase opacity-40">Today's Schedule</span>
          </div>
          <p className="text-4xl font-black tracking-tighter">{stats.todayClasses}</p>
          <p className="text-[10px] font-bold text-amber-600 uppercase mt-2">Personal Sessions</p>
        </div>

        <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-indigo-50 text-indigo-600 border-2 border-[#141414]">
                <Clock size={20} />
             </div>
             <span className="text-[10px] font-black uppercase opacity-40">Performance</span>
          </div>
          <p className="text-4xl font-black tracking-tighter">{stats.weeklyAttendance}%</p>
          <p className="text-[10px] font-bold text-indigo-600 uppercase mt-2">Attendance Score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* assigned members */}
        <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] flex flex-col">
          <div className="p-6 border-b-4 border-[#141414] bg-[#f5f5f5] flex justify-between items-center">
            <h2 className="text-sm font-black uppercase tracking-widest">My Clients</h2>
            <Link to="/members" className="text-[10px] font-black uppercase underline">Full Roster</Link>
          </div>
          <div className="divide-y-2 divide-[#141414]/5 max-h-[400px] overflow-y-auto">
            {assignedMembers.length > 0 ? assignedMembers.map((member: any) => (
              <div key={member.id} className="p-4 flex items-center justify-between hover:bg-gray-50 group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-50 rounded-full border-2 border-[#141414] flex items-center justify-center font-black">
                    {member.name[0]}
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase text-gray-800">{member.name}</h3>
                    <p className="text-[10px] font-bold opacity-40 uppercase">{member.member_id}</p>
                  </div>
                </div>
                <Link to={`/members/${member.id}`} className="p-2 border-2 border-[#141414] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#141414] hover:text-white">
                  <ArrowRight size={14} />
                </Link>
              </div>
            )) : (
              <div className="p-12 text-center opacity-20 italic font-black uppercase">No clients assigned</div>
            )}
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-[#141414] text-white p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,0.2)]">
              <h2 className="text-lg font-black uppercase tracking-widest mb-6">Trainer Tips</h2>
              <ul className="space-y-4">
                 <li className="flex gap-4 items-start">
                    <UserCheck className="text-green-400 shrink-0" size={18} />
                    <p className="text-[11px] font-bold leading-relaxed">Ensure all clients hydrate specifically during high-intensity intervals.</p>
                 </li>
                 <li className="flex gap-4 items-start">
                    <TrendingUp className="text-rose-400 shrink-0" size={18} />
                    <p className="text-[11px] font-bold leading-relaxed">Review member diet progress before starting new cycles.</p>
                 </li>
                 <li className="flex gap-4 items-start">
                    <MessageSquare className="text-amber-400 shrink-0" size={18} />
                    <p className="text-[11px] font-bold leading-relaxed">Collect verbal feedback after every personal session.</p>
                 </li>
              </ul>
           </div>
           
           <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4">Upcoming Renewals</h3>
              <div className="space-y-2">
                 <div className="flex justify-between items-center text-[10px] font-bold p-2 bg-gray-50 rounded">
                    <span>Rahul Sharma</span>
                    <span className="text-rose-500">In 2 Days</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-bold p-2 bg-gray-50 rounded">
                    <span>Anita Desai</span>
                    <span className="text-rose-500">In 5 Days</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
