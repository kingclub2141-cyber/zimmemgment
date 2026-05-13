import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  Calendar as CalendarIcon, 
  Loader2, 
  Download,
  Clock,
  User,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface AttendanceRecord {
  attendance_date: string;
  punch_in_time: string;
  punch_out_time: string;
  status: string;
}

interface Member {
  id: string;
  name: string;
  member_id: string;
}

export default function AttendanceHistory() {
  const { gym } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  useEffect(() => {
    if (gym) fetchMembers();
  }, [gym]);

  useEffect(() => {
    if (selectedMember && month) {
      fetchHistory();
    }
  }, [selectedMember, month]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('id, name, member_id')
        .eq('gym_id', gym.id)
        .eq('status', 'Active')
        .order('name');
      
      if (error) throw error;
      setMembers(data || []);
      if (data && data.length > 0) setSelectedMember(data[0].id);
    } catch (error: any) {
      toast.error('Failed to load members');
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const startOfMonth = `${month}-01`;
      const endOfMonth = `${month}-31`;

      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('member_id', selectedMember)
        .gte('attendance_date', startOfMonth)
        .lte('attendance_date', endOfMonth)
        .order('attendance_date', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error: any) {
      toast.error('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const member = members.find(m => m.id === selectedMember);
    const exportData = history.map(h => ({
      'Date': h.attendance_date,
      'Status': h.status,
      'Punch In': h.punch_in_time,
      'Punch Out': h.punch_out_time || 'N/A'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `Attendance_${member?.name}_${month}.xlsx`);
  };

  const memberName = members.find(m => m.id === selectedMember)?.name || 'Member';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/attendance')}
            className="p-2 hover:bg-white border-2 border-transparent hover:border-[#141414] transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Attendance History</h1>
            <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Monthly view for {memberName}</p>
          </div>
        </div>
        <button 
          onClick={handleExport}
          disabled={history.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-[#141414] text-white border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-none disabled:opacity-20 translate-y-0 active:translate-x-1 active:translate-y-1"
        >
          <Download size={16} />
          Export Excel
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Select Member</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={18} />
            <select 
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-12 pr-4 py-3 font-bold appearance-none outline-none focus:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] transition-all"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.member_id})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="w-full md:w-64 space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Month / Year</label>
          <div className="relative">
            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={18} />
            <input 
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-12 pr-4 py-3 font-bold outline-none focus:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#141414] text-white">
                <th className="p-4 font-black uppercase tracking-widest text-xs h-12">Date</th>
                <th className="p-4 font-black uppercase tracking-widest text-xs h-12">Day</th>
                <th className="p-4 font-black uppercase tracking-widest text-xs h-12">Punch In</th>
                <th className="p-4 font-black uppercase tracking-widest text-xs h-12">Punch Out</th>
                <th className="p-4 font-black uppercase tracking-widest text-xs h-12">Duration</th>
                <th className="p-4 font-black uppercase tracking-widest text-xs h-12">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#141414]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <Loader2 className="animate-spin inline-block mr-2" />
                    <span className="font-black uppercase tracking-widest text-xs">Loading records...</span>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <p className="font-black opacity-20 uppercase tracking-[0.2em] text-sm">No attendance records for this month</p>
                  </td>
                </tr>
              ) : (
                history.map((record) => (
                  <tr key={record.attendance_date} className="hover:bg-[#f5f5f5] transition-colors">
                    <td className="p-4 font-black text-sm tracking-tight">{record.attendance_date}</td>
                    <td className="p-4 font-bold text-xs uppercase opacity-40">
                      {new Date(record.attendance_date).toLocaleDateString('en-US', { weekday: 'long' })}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-bold text-sm tracking-tight">
                        <Clock size={12} className="opacity-40" />
                        {record.punch_in_time}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-bold text-sm tracking-tight">
                        <Clock size={12} className="opacity-40" />
                        {record.punch_out_time || '-'}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-black uppercase opacity-60">
                        {calculateDuration(record.punch_in_time, record.punch_out_time)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest">
                        {record.status}
                      </span>
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

function calculateDuration(punchIn: string, punchOut: string | null) {
  if (!punchIn || !punchOut) return '-';
  
  try {
    const [h1, m1] = punchIn.split(':');
    const [h2, m2] = punchOut.split(':');
    
    // Simple duration calc for the same day
    const m1Total = Number(h1) * 60 + Number(m1);
    const m2Total = Number(h2) * 60 + Number(m2);
    
    const diff = m2Total - m1Total;
    if (diff < 0) return '-';
    
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    
    return `${hours}h ${mins}m`;
  } catch (e) {
    return '-';
  }
}
