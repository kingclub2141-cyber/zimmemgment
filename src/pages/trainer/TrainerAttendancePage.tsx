import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar, 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  XCircle,
  Zap,
  MapPin
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { toast } from 'sonner';

export default function TrainerAttendancePage() {
  const { profile } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [punching, setPunching] = useState(false);

  useEffect(() => {
    if (profile?.id) fetchAttendance();
  }, [profile, currentMonth]);

  async function fetchAttendance() {
    setLoading(true);
    try {
      const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('trainer_attendance')
        .select('*')
        .eq('trainer_id', profile.trainer_id)
        .gte('attendance_date', start)
        .lte('attendance_date', end);

      if (error) throw error;
      setAttendance(data || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handlePunch = async (type: 'in' | 'out') => {
    if (!profile?.trainer_id) return toast.error('Trainer record not found');
    setPunching(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const nowTime = format(new Date(), 'HH:mm:ss');

      if (type === 'in') {
        const { error } = await supabase.from('trainer_attendance').insert({
          trainer_id: profile.trainer_id,
          attendance_date: today,
          check_in: nowTime,
          status: 'Present'
        });
        if (error) throw error;
        toast.success('Check-in recorded');
      } else {
        const { error } = await supabase.from('trainer_attendance').update({
          check_out: nowTime
        }).eq('trainer_id', profile.trainer_id).eq('attendance_date', today);
        if (error) throw error;
        toast.success('Check-out recorded');
      }
      fetchAttendance();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPunching(false);
    }
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const todayRecord = attendance.find(a => isSameDay(new Date(a.attendance_date), new Date()));

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-tight">My Attendance</h1>
          <p className="text-gray-500 font-medium italic">Track your shifts and duty sessions</p>
        </div>
        
        <div className="flex items-center gap-4">
           {!todayRecord?.check_in ? (
             <button 
                disabled={punching}
                onClick={() => handlePunch('in')}
                className="px-8 py-3 bg-gray-900 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-xl shadow-gray-200"
             >
                {punching ? <Clock className="animate-spin" size={16} /> : <Zap size={16} className="text-amber-400" />} Punch In Today
             </button>
           ) : !todayRecord?.check_out ? (
             <button 
                disabled={punching}
                onClick={() => handlePunch('out')}
                className="px-8 py-3 bg-[#E13D4B] text-white font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2 shadow-xl shadow-rose-100"
             >
                {punching ? <Clock className="animate-spin" size={16} /> : <Clock size={16} />} Punch Out Now
             </button>
           ) : (
             <div className="px-6 py-3 bg-green-50 text-green-600 font-black text-[10px] uppercase tracking-widest rounded-2xl border border-green-100 flex items-center gap-2">
                <CheckCircle2 size={16} /> Shift Completed
             </div>
           )}
        </div>
      </div>

      <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-100 border border-gray-50 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <button 
            onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
            className="p-3 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-gray-100 text-gray-400 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-black uppercase tracking-widest text-[#141414]">{format(currentMonth, 'MMMM yyyy')}</h2>
          <button 
            onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
            className="p-3 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-gray-100 text-gray-400 hover:text-gray-900"
          >
            <ArrowRight size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">In Time</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Out Time</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Shift Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {days.map((day, i) => {
                const record = attendance.find(a => isSameDay(new Date(a.attendance_date), day));
                const isToday = isSameDay(day, new Date());
                
                return (
                  <tr key={i} className={`hover:bg-gray-50 transition-colors ${isToday ? 'bg-rose-50/30' : ''}`}>
                    <td className="px-8 py-5">
                       <span className={`text-sm font-black ${isToday ? 'text-[#E13D4B]' : 'text-gray-900'}`}>{format(day, 'dd MMM')}</span>
                       <p className="text-[10px] font-bold text-gray-400 uppercase">{format(day, 'EEEE')}</p>
                    </td>
                    <td className="px-8 py-5">
                       {record ? (
                         <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100">
                           Present
                         </span>
                       ) : (
                         <span className="px-3 py-1 bg-gray-100 text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                           --
                         </span>
                       )}
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-600">{record?.check_in || '--:--'}</td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-600">{record?.check_out || '--:--'}</td>
                    <td className="px-8 py-5">
                       {record?.check_in && record?.check_out ? (
                         <div className="flex items-center gap-2 text-xs font-black text-gray-900">
                            <Clock size={14} className="text-gray-400" /> Calculating...
                         </div>
                       ) : '--'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
