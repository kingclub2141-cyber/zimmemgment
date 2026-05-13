import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  Phone, 
  Calendar, 
  MapPin, 
  IndianRupee, 
  UserCheck, 
  History, 
  CreditCard,
  Edit2,
  Plus,
  Loader2,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

type TabType = 'members' | 'attendance' | 'payments';

export default function TrainerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trainer, setTrainer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('members');
  const [tabData, setTabData] = useState<any[]>([]);
  const [tabLoading, setTabLoading] = useState(false);

  useEffect(() => {
    if (id && gym) {
      fetchTrainer();
    }
  }, [id, gym]);

  useEffect(() => {
    if (activeTab) fetchTabData();
  }, [activeTab, id]);

  const fetchTrainer = async () => {
    try {
      const { data, error } = await supabase
        .from('trainers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setTrainer(data);
    } catch (error) {
      toast.error('Trainer not found');
      navigate('/trainers');
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async () => {
    try {
      setTabLoading(true);
      if (activeTab === 'members') {
        const { data } = await supabase
          .from('member_plans')
          .select('*, members(id, name, member_id, phone)')
          .eq('trainer_id', id);
        setTabData(data || []);
      } else if (activeTab === 'attendance') {
        const { data } = await supabase
          .from('trainer_attendance')
          .select('*')
          .eq('trainer_id', id)
          .order('attendance_date', { ascending: false });
        setTabData(data || []);
      } else if (activeTab === 'payments') {
        const { data } = await supabase
          .from('trainer_payments')
          .select('*')
          .eq('trainer_id', id)
          .order('payment_date', { ascending: false });
        setTabData(data || []);
      }
    } catch (error) {
      toast.error('Failed to load tab data');
    } finally {
      setTabLoading(false);
    }
  };

  if (loading || !trainer) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/trainers')}
            className="p-3 border-4 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">{trainer.name}</h1>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Trainer Elite Profile</p>
          </div>
        </div>
        <Link 
          to={`/trainers/${id}/edit`}
          className="flex items-center gap-2 px-6 py-3 bg-[#141414] text-white border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all shadow-[6px_6px_0px_0px_rgba(20,20,20,1)]"
        >
          <Edit2 size={16} />
          Edit Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white border-4 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
            <div className="aspect-square bg-[#141414] border-b-4 border-[#141414]">
              {trainer.photo_url ? (
                <img src={trainer.photo_url} alt={trainer.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-black text-6xl opacity-20">
                  {trainer.name.charAt(0)}
                </div>
              )}
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 font-black text-[10px] uppercase tracking-widest ${trainer.status === 'Active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {trainer.status}
                </span>
                <span className="text-[10px] font-black uppercase opacity-40">Joined {format(new Date(trainer.joining_date), 'MMM yyyy')}</span>
              </div>
              
              <div className="space-y-3 pt-4">
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="opacity-40" />
                  <span className="font-bold">{trainer.phone}</span>
                </div>
                {trainer.dob && (
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar size={16} className="opacity-40" />
                    <span className="font-bold">DOB: {format(new Date(trainer.dob), 'MMM dd, yyyy')}</span>
                  </div>
                )}
                <div className="flex items-start gap-3 text-sm">
                  <MapPin size={16} className="opacity-40 mt-1 shrink-0" />
                  <span className="font-bold">{trainer.address || 'No address provided'}</span>
                </div>
              </div>

              <div className="pt-6 border-t-2 border-dashed border-[#141414]">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black uppercase opacity-40 mb-1">Fee Structure</p>
                    <p className="text-xl font-black">₹{trainer.monthly_amount.toLocaleString()}/mo</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold opacity-40">₹{trainer.daily_amount}/day</p>
                  </div>
                </div>
                <Link 
                  to={`/trainers/${trainer.id}/payments`}
                  className="mt-4 w-full py-3 bg-[#f5f5f5] text-[#141414] border-2 border-[#141414] font-black uppercase tracking-widest text-[10px] hover:bg-[#141414] hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard size={14} />
                  Record Payment
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex border-4 border-[#141414] bg-white shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
            {(['members', 'attendance', 'payments'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab 
                    ? 'bg-[#141414] text-white' 
                    : 'bg-white text-[#141414] hover:bg-[#f5f5f5]'
                }`}
              >
                {tab === 'members' && <UserCheck size={16} />}
                {tab === 'attendance' && <History size={16} />}
                {tab === 'payments' && <CreditCard size={16} />}
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] min-h-[400px]">
            {tabLoading ? (
              <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  {activeTab === 'members' && (
                    <>
                      <thead className="bg-[#141414] text-white">
                        <tr>
                          <th className="p-4 font-black text-[10px] uppercase tracking-widest">Member</th>
                          <th className="p-4 font-black text-[10px] uppercase tracking-widest">ID</th>
                          <th className="p-4 font-black text-[10px] uppercase tracking-widest">Phone</th>
                          <th className="p-4 font-black text-[10px] uppercase tracking-widest">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-[#141414]">
                        {tabData.map((row: any) => (
                          <tr key={row.id}>
                            <td className="p-4 font-bold text-sm tracking-tight">{row.members?.name}</td>
                            <td className="p-4 font-mono text-xs">{row.members?.member_id}</td>
                            <td className="p-4 font-bold text-sm opacity-60">{row.members?.phone}</td>
                            <td className="p-4">
                              <Link to={`/members/${row.members?.id}`} className="text-[#141414] hover:underline font-black text-[10px] uppercase tracking-widest">Profile</Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}

                  {activeTab === 'attendance' && (
                    <>
                      <thead className="bg-[#141414] text-white">
                        <tr>
                          <th className="p-4 font-black text-[10px] uppercase tracking-widest">Date</th>
                          <th className="p-4 font-black text-[10px] uppercase tracking-widest">Punch In</th>
                          <th className="p-4 font-black text-[10px] uppercase tracking-widest">Punch Out</th>
                          <th className="p-4 font-black text-[10px] uppercase tracking-widest">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-[#141414]">
                        {tabData.map((row: any) => (
                          <tr key={row.id}>
                            <td className="p-4 font-bold text-sm">{format(new Date(row.attendance_date), 'MMM dd, yyyy')}</td>
                            <td className="p-4 font-bold text-sm">{row.punch_in_time || '-'}</td>
                            <td className="p-4 font-bold text-sm">{row.punch_out_time || '-'}</td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 bg-green-500 text-white font-black text-[8px] uppercase tracking-widest">{row.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}

                  {activeTab === 'payments' && (
                    <>
                      <thead className="bg-[#141414] text-white">
                        <tr>
                          <th className="p-4 font-black text-[10px] uppercase tracking-widest">Date</th>
                          <th className="p-4 font-black text-[10px] uppercase tracking-widest">Amount</th>
                          <th className="p-4 font-black text-[10px] uppercase tracking-widest">Mode</th>
                          <th className="p-4 font-black text-[10px] uppercase tracking-widest">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-[#141414]">
                        {tabData.map((row: any) => (
                          <tr key={row.id}>
                            <td className="p-4 font-bold text-sm">{format(new Date(row.payment_date), 'MMM dd, yyyy')}</td>
                            <td className="p-4 font-black text-lg tracking-tighter">₹{row.amount.toLocaleString()}</td>
                            <td className="p-4 font-bold text-xs uppercase opacity-60">{row.payment_mode}</td>
                            <td className="p-4 font-medium text-xs opacity-60">{row.description || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}
                </table>
                {tabData.length === 0 && (
                  <div className="p-20 text-center text-sm font-black uppercase opacity-20 tracking-widest">No records found</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
