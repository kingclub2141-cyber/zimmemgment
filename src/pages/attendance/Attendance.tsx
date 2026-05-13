import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  Search, 
  Clock, 
  MapPin,
  Loader2,
  Calendar as CalendarIcon,
  LogIn,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

interface AttendanceRecord {
  id: string;
  member_id: string;
  attendance_date: string;
  status: string;
  punch_in_time: string;
  punch_out_time: string | null;
}

interface Member {
  id: string;
  name: string;
  member_id: string;
  phone: string;
  status: string;
  attendance?: AttendanceRecord;
}

export default function Attendance() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    percentage: 0
  });

  useEffect(() => {
    if (gym) {
      fetchAttendance();
    }
  }, [gym, selectedDate]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      // Fetch all active members
      const { data: membersList, error: membersError } = await supabase
        .from('members')
        .select('id, name, member_id, phone, status')
        .eq('gym_id', gym.id)
        .eq('status', 'Active');

      if (membersError) throw membersError;

      // Fetch attendance for selected date
      const { data: attendanceList, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('attendance_date', selectedDate);

      if (attendanceError) throw attendanceError;

      const attendanceMap = new Map();
      attendanceList?.forEach(record => attendanceMap.set(record.member_id, record));

      const updatedMembers = membersList.map(member => ({
        ...member,
        attendance: attendanceMap.get(member.id)
      }));

      setMembers(updatedMembers);
      
      const present = attendanceList?.length || 0;
      const total = membersList.length;
      setStats({
        total,
        present,
        absent: total - present,
        percentage: total > 0 ? Math.round((present / total) * 100) : 0
      });
    } catch (error: any) {
      toast.error('Failed to load attendance');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePunchIn = async (memberId: string) => {
    try {
      const now = new Date().toLocaleTimeString();
      const { error } = await supabase.from('attendance').insert([{
        gym_id: gym?.id,
        member_id: memberId,
        attendance_date: selectedDate,
        status: 'Present',
        punch_in_time: now
      }]);

      if (error) throw error;
      toast.success('Punched In successfully');
      fetchAttendance();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handlePunchOut = async (recordId: string, punchInTime: string) => {
    try {
      const now = new Date();
      const [h, m] = punchInTime.split(':');
      const punchInDate = new Date();
      punchInDate.setHours(Number(h), Number(m), 0);
      
      const diffMs = now.getTime() - punchInDate.getTime();
      const diffMins = Math.round(diffMs / 60000);

      if (diffMins < 30) {
        toast.warning('Warning: Less than 30 minutes since Punch In');
      }

      const punchOutStr = now.toLocaleTimeString();
      const { error } = await supabase.from('attendance').update({
        punch_out_time: punchOutStr
      }).eq('id', recordId);

      if (error) throw error;
      toast.success('Punched Out successfully');
      fetchAttendance();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.member_id.includes(searchQuery) ||
    m.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Attendance Registry</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Track daily arrivals and departures</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border-2 border-[#141414] p-3 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] flex items-center gap-3">
            <CalendarIcon size={18} className="opacity-40" />
            <input 
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-black uppercase tracking-widest text-xs outline-none"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <Users className="opacity-20 group-hover:rotate-12 transition-transform" size={40} />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Total Active</span>
          </div>
          <p className="text-4xl font-black tracking-tighter">{stats.total}</p>
        </div>

        <div className="bg-[#141414] text-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,0.1)] relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <UserCheck className="opacity-20" size={40} />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Present Today</span>
          </div>
          <p className="text-4xl font-black tracking-tighter">{stats.present}</p>
        </div>

        <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <UserX className="opacity-20 text-red-600" size={40} />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Absent Today</span>
          </div>
          <p className="text-4xl font-black tracking-tighter text-red-600">{stats.absent}</p>
        </div>

        <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <TrendingUp className="opacity-20 text-green-600" size={40} />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Attendance Rate</span>
          </div>
          <p className="text-4xl font-black tracking-tighter text-green-600">{stats.percentage}%</p>
        </div>
      </div>

      {/* Registry Table */}
      <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
        <div className="p-6 border-b-4 border-[#141414] flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
            <input 
              type="text"
              placeholder="Search by name, ID or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-12 pr-4 py-3 font-bold outline-none focus:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#141414] text-white">
                <th className="p-4 font-black uppercase tracking-widest text-xs h-12">Member</th>
                <th className="p-4 font-black uppercase tracking-widest text-xs h-12">Member ID</th>
                <th className="p-4 font-black uppercase tracking-widest text-xs h-12">Status</th>
                <th className="p-4 font-black uppercase tracking-widest text-xs h-12">Punch In</th>
                <th className="p-4 font-black uppercase tracking-widest text-xs h-12">Punch Out</th>
                <th className="p-4 font-black uppercase tracking-widest text-xs h-12 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#141414]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <Loader2 className="animate-spin inline-block mr-2" />
                    <span className="font-black uppercase tracking-widest text-xs opacity-60">Refreshing list...</span>
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <p className="font-black opacity-20 uppercase tracking-[0.2em] text-sm">No active members found</p>
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-[#f5f5f5] transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#141414] text-white flex items-center justify-center font-black text-xs">
                          {member.name.charAt(0)}
                        </div>
                        <span className="font-black text-sm">{member.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-xs uppercase tracking-tighter">{member.member_id}</span>
                    </td>
                    <td className="p-4">
                      {member.attendance ? (
                        <span className="px-2 py-1 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest">Present</span>
                      ) : (
                        <span className="px-2 py-1 bg-red-400 text-white text-[10px] font-black uppercase tracking-widest">Absent</span>
                      )}
                    </td>
                    <td className="p-4">
                      {member.attendance?.punch_in_time ? (
                        <div className="flex items-center gap-2 font-bold text-sm tracking-tight">
                          <Clock size={12} className="opacity-40" />
                          {member.attendance.punch_in_time}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="p-4">
                      {member.attendance?.punch_out_time ? (
                        <div className="flex items-center gap-2 font-bold text-sm tracking-tight text-red-600">
                          <Clock size={12} className="opacity-40" />
                          {member.attendance.punch_out_time}
                        </div>
                      ) : member.attendance ? 'Active' : '-'}
                    </td>
                    <td className="p-4 text-center">
                      {!member.attendance ? (
                        <button 
                          onClick={() => handlePunchIn(member.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-[#141414] text-white border-2 border-[#141414] font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-[#141414] transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
                        >
                          <LogIn size={14} /> Punch In
                        </button>
                      ) : !member.attendance.punch_out_time ? (
                        <button 
                          onClick={() => handlePunchOut(member.attendance!.id, member.attendance!.punch_in_time)}
                          className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 border-2 border-red-600 font-black uppercase tracking-widest text-[10px] hover:bg-red-600 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] hover:shadow-none"
                        >
                          <LogOut size={14} /> Punch Out
                        </button>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-600 flex items-center justify-center gap-2">
                          <CheckCircle2 size={14} /> Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
