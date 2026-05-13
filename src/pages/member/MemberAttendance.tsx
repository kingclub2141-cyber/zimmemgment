import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronRight,
  Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isValid
} from 'date-fns';
import { motion } from 'motion/react';
import { safeFormat } from '../../lib/utils';

export default function MemberAttendance() {
  const { profile } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.member_id) {
      fetchAttendance();
    }
  }, [profile, currentDate]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);

      const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('member_id', profile.member_id)
        .gte('attendance_date', format(start, 'yyyy-MM-dd'))
        .lte('attendance_date', format(end, 'yyyy-MM-dd'));

      setAttendance(data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate)),
    end: endOfWeek(endOfMonth(currentDate))
  });

  const getAttendanceForDay = (day: Date) => {
    return attendance.find(a => isSameDay(new Date(a.attendance_date), day));
  };

  const stats = {
    present: attendance.length,
    total: eachDayOfInterval({ start: startOfMonth(currentDate), end: isSameDay(currentDate, new Date()) ? currentDate : endOfMonth(currentDate) }).length,
    percentage: 0
  };
  stats.percentage = Math.round((stats.present / stats.total) * 100) || 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Attendance Calendar</h1>
          <p className="text-gray-500 font-medium italic">Track your consistency and progress</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-lg shadow-gray-100 border border-gray-50">
          <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-black uppercase tracking-widest min-w-[120px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-gray-50 rounded-xl transition-all">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[32px] shadow-2xl shadow-gray-100 border border-gray-50 overflow-hidden">
            <div className="grid grid-cols-7 bg-gray-900 text-white py-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 border-l border-t border-gray-50">
              {days.map((day, i) => {
                const record = getAttendanceForDay(day);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isTodayDate = isToday(day);

                return (
                  <div 
                    key={i} 
                    className={`min-h-[100px] border-r border-b border-gray-50 p-2 transition-all relative ${
                      !isCurrentMonth ? 'bg-gray-50/30' : 'bg-white'
                    } ${isTodayDate ? 'ring-2 ring-inset ring-[#E13D4B] z-10' : ''}`}
                  >
                    <span className={`text-xs font-black p-1 block text-right mb-2 ${
                      !isCurrentMonth ? 'text-gray-300' : (isTodayDate ? 'text-[#E13D4B]' : 'text-gray-400')
                    }`}>
                      {format(day, 'd')}
                    </span>
                    
                    {record ? (
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-1">
                          <CheckCircle2 size={16} />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-tighter text-green-600">Present</span>
                        {record.punch_in_time && (
                          <span className="text-[7px] font-bold text-gray-400 uppercase mt-1">
                            {safeFormat(record.punch_in_time, 'hh:mm a')}
                          </span>
                        )}
                      </div>
                    ) : isCurrentMonth && day < new Date() && (
                       <div className="flex flex-col items-center opacity-40">
                        <div className="w-8 h-8 bg-rose-50 text-rose-300 rounded-lg flex items-center justify-center mb-1">
                          <XCircle size={16} />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-tighter text-rose-300">Absent</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats & Info */}
        <div className="space-y-6">
          {/* Progress Chart Simulation */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-50 p-8 flex flex-col items-center">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-8">Monthly Progress</h3>
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle cx="80" cy="80" r="70" fill="none" stroke="#F3F4F6" strokeWidth="12" />
                <circle 
                  cx="80" cy="80" r="70" 
                  fill="none" 
                  stroke="#E13D4B" 
                  strokeWidth="12" 
                  strokeDasharray={440} 
                  strokeDashoffset={440 - (440 * stats.percentage) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-gray-900 leading-none">{stats.percentage}%</span>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Consistency</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 w-full gap-4 mt-12">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Present</p>
                <p className="text-xl font-black text-gray-900">{stats.present}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Days Left</p>
                <p className="text-xl font-black text-gray-900">
                  {differenceInDays(endOfMonth(currentDate), isSameDay(currentDate, new Date()) ? currentDate : endOfMonth(currentDate))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-rose-50 rounded-3xl p-6 border border-rose-100">
            <h4 className="text-xs font-black text-[#E13D4B] uppercase tracking-widest mb-2">Trainer's Insight</h4>
            <p className="text-xs font-medium text-rose-700 leading-relaxed italic">
              "Great consistency this week! Your morning workouts are paying off. Keep it up!"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function differenceInDays(end: Date, start: Date) {
  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
