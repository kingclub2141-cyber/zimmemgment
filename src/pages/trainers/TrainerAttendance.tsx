import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Clock, 
  LogIn, 
  LogOut, 
  Loader2,
  Calendar as CalendarIcon,
  CheckCircle2,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function TrainerAttendance() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (gym) {
      fetchTrainers();
      fetchTodayAttendance();
    }
  }, [gym]);

  const fetchTrainers = async () => {
    const { data } = await supabase
      .from('trainers')
      .select('*')
      .eq('gym_id', gym.id)
      .eq('status', 'Active')
      .order('name');
    setTrainers(data || []);
  };

  const fetchTodayAttendance = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('trainer_attendance')
        .select('*')
        .eq('attendance_date', today);
      
      if (error) throw error;
      setAttendance(data || []);
    } catch (error) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const handlePunch = async (trainerId: string, type: 'in' | 'out') => {
    try {
      setProcessing(trainerId);
      const today = format(new Date(), 'yyyy-MM-dd');
      const time = format(new Date(), 'HH:mm:ss');
      const existing = attendance.find(a => a.trainer_id === trainerId);

      if (type === 'in') {
        if (existing) {
          toast.error('Already punched in today');
          return;
        }
        const { error } = await supabase
          .from('trainer_attendance')
          .insert([{
            trainer_id: trainerId,
            attendance_date: today,
            punch_in_time: time,
            status: 'Present'
          }]);
        if (error) throw error;
        toast.success('Punch in successful');
      } else {
        if (!existing) {
          toast.error('Not punched in today');
          return;
        }
        const { error } = await supabase
          .from('trainer_attendance')
          .update({ punch_out_time: time })
          .eq('id', existing.id);
        if (error) throw error;
        toast.success('Punch out successful');
      }
      fetchTodayAttendance();
    } catch (error) {
      toast.error('Attendance operation failed');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Trainer Attendance</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Live punch-in registry</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-white border-4 border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
          <CalendarIcon size={20} />
          <span className="font-black uppercase tracking-widest text-xs">{format(new Date(), 'eeee, MMM dd, yyyy')}</span>
        </div>
      </div>

      <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#141414] text-white">
                <th className="p-4 font-black uppercase tracking-widest text-xs">Trainer</th>
                <th className="p-4 font-black uppercase tracking-widest text-xs">Status</th>
                <th className="p-4 font-black uppercase tracking-widest text-xs text-center">In Time</th>
                <th className="p-4 font-black uppercase tracking-widest text-xs text-center">Out Time</th>
                <th className="p-4 font-black uppercase tracking-widest text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-[#141414]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <Loader2 className="animate-spin inline-block mx-auto mb-4" />
                    <p className="font-black uppercase tracking-widest text-xs">Syncing rosters...</p>
                  </td>
                </tr>
              ) : trainers.map((trainer) => {
                const record = attendance.find(a => a.trainer_id === trainer.id);
                const isPunchedIn = !!record;
                const isPunchedOut = !!record?.punch_out_time;

                return (
                  <tr key={trainer.id} className="hover:bg-[#f5f5f5] transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#141414] text-white flex items-center justify-center font-black text-xs uppercase">
                          {trainer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black uppercase tracking-tight text-sm leading-tight">{trainer.name}</p>
                          <p className="text-[10px] font-bold opacity-40 uppercase">{trainer.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {isPunchedIn ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-500 text-white font-black text-[10px] uppercase tracking-widest">
                          <CheckCircle2 size={12} /> Present
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-200 text-[#141414] font-black text-[10px] uppercase tracking-widest opacity-40">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-black text-lg tracking-tighter">{record?.punch_in_time || '--:--'}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-black text-lg tracking-tighter">{record?.punch_out_time || '--:--'}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {!isPunchedIn ? (
                          <button 
                            onClick={() => handlePunch(trainer.id, 'in')}
                            disabled={processing === trainer.id}
                            className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white font-black uppercase tracking-widest text-[10px] hover:bg-[#141414] transition-all border-2 border-green-500 disabled:opacity-50"
                          >
                            <LogIn size={14} /> Punch In
                          </button>
                        ) : !isPunchedOut ? (
                          <button 
                            onClick={() => handlePunch(trainer.id, 'out')}
                            disabled={processing === trainer.id}
                            className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-[#141414] transition-all border-2 border-red-600 disabled:opacity-50"
                          >
                            <LogOut size={14} /> Punch Out
                          </button>
                        ) : (
                          <span className="text-[10px] font-black uppercase opacity-20 tracking-widest px-4 py-2 border-2 border-dashed border-[#141414]">Shift Complete</span>
                        )}
                      </div>
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
