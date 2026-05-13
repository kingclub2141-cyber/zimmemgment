import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  Plus, 
  Filter, 
  Edit2, 
  Trash2, 
  Loader2,
  User,
  Phone,
  Calendar,
  ChevronRight,
  UserCheck,
  MoreVertical
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Trainer {
  id: string;
  name: string;
  phone: string;
  gender: string;
  monthly_amount: number;
  daily_amount: number;
  joining_date: string;
  status: string;
  photo_url: string | null;
  assigned_members_count?: number;
}

export default function TrainerList() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    if (gym) fetchTrainers();
  }, [gym]);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      
      // Get trainers
      const { data: trainersData, error: trainersError } = await supabase
        .from('trainers')
        .select('*')
        .eq('gym_id', gym.id)
        .order('name');

      if (trainersError) throw trainersError;

      // Get assigned counts (this is a bit complex in Supabase without a custom RPC or view, 
      // but let's try a simple approach)
      const { data: assignments } = await supabase
        .from('member_plans')
        .select('trainer_id');

      const countMap: any = {};
      assignments?.forEach(a => {
        if (a.trainer_id) {
          countMap[a.trainer_id] = (countMap[a.trainer_id] || 0) + 1;
        }
      });

      const processedTrainers = (trainersData || []).map(t => ({
        ...t,
        assigned_members_count: countMap[t.id] || 0
      }));

      setTrainers(processedTrainers);
    } catch (error: any) {
      toast.error('Failed to fetch trainers');
    } finally {
      setLoading(false);
    }
  };

  const filteredTrainers = trainers.filter(trainer => {
    const matchesSearch = trainer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         trainer.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'All' || trainer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Trainer Roster</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Manage your gym's elite trainers</p>
        </div>
        <Link 
          to="/trainers/add"
          className="flex items-center gap-2 px-6 py-3 bg-[#141414] text-white border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-none active:translate-x-1 active:translate-y-1"
        >
          <Plus size={16} />
          Onboard Trainer
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
          <input 
            type="text"
            placeholder="Search trainers by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-12 pr-4 py-3 font-bold outline-none focus:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] transition-all"
          />
        </div>
        <div className="flex gap-4">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#f5f5f5] border-2 border-[#141414] px-6 py-3 font-bold outline-none cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Trainer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-white border-4 border-[#141414] animate-pulse"></div>
          ))
        ) : filteredTrainers.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <UserCheck size={48} className="mx-auto mb-4 opacity-10" />
            <p className="font-black uppercase tracking-widest text-sm opacity-20">No trainers recruited yet</p>
          </div>
        ) : (
          filteredTrainers.map((trainer, index) => (
            <div 
              key={`${trainer.id}-${index}`}
              className="bg-white border-4 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] group hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] transition-all"
            >
              <div className="p-6 border-b-4 border-[#141414] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {trainer.photo_url ? (
                    <img src={trainer.photo_url} alt={trainer.name} className="w-16 h-16 border-4 border-[#141414] object-cover" />
                  ) : (
                    <div className="w-16 h-16 bg-[#141414] text-white flex items-center justify-center font-black text-2xl">
                      {trainer.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-black uppercase tracking-tighter text-lg leading-tight">{trainer.name}</h3>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 ${trainer.status === 'Active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {trainer.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase opacity-40">Members</p>
                  <p className="text-2xl font-black">{trainer.assigned_members_count}</p>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 opacity-60">
                    <Phone size={14} />
                    <span className="font-bold">{trainer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-60">
                    <Calendar size={14} />
                    <span className="font-bold">{format(new Date(trainer.joining_date), 'MMM yyyy')}</span>
                  </div>
                </div>
                
                <div className="pt-4 grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[#f5f5f5] border-2 border-[#141414]">
                    <p className="text-[10px] font-black uppercase opacity-40">Monthly</p>
                    <p className="font-black">₹{trainer.monthly_amount.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-[#f5f5f5] border-2 border-[#141414]">
                    <p className="text-[10px] font-black uppercase opacity-40">Daily</p>
                    <p className="font-black">₹{trainer.daily_amount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <Link 
                    to={`/trainers/${trainer.id}`}
                    className="flex-1 py-3 text-center bg-[#141414] text-white font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-[#141414] border-2 border-[#141414] transition-all"
                  >
                    View Details
                  </Link>
                  <Link 
                    to={`/trainers/${trainer.id}/edit`}
                    className="p-3 border-2 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
                  >
                    <Edit2 size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
