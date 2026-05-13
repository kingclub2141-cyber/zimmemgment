import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2,
  Zap,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface Service {
  id: string;
  name: string;
  amount: number;
  status: string;
}

export default function ServiceList() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (gym) fetchServices();
  }, [gym]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('gym_id', gym.id)
        .order('name');
      
      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      toast.success('Service deleted');
      fetchServices();
    } catch (error) {
      toast.error('Could not delete service (it might be assigned to members)');
    }
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-[#141414]">Extra Services</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Add-ons like Personal Training, Locker, Spa</p>
        </div>
        <Link 
          to="/services/add"
          className="flex items-center gap-2 px-8 py-4 bg-[#141414] text-white border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:shadow-none active:translate-x-1 active:translate-y-1"
        >
          <Plus size={16} />
          Create Service
        </Link>
      </div>

      <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
          <input 
            type="text"
            placeholder="Search service name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-12 pr-4 py-3 font-bold outline-none focus:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-white border-4 border-[#141414] animate-pulse"></div>
          ))
        ) : filteredServices.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <Zap size={48} className="mx-auto mb-4 opacity-10" />
            <p className="font-black uppercase tracking-widest text-sm opacity-20">No services found</p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <div key={service.id} className="bg-white border-4 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] group hover:-translate-y-1 transition-all">
              <div className="p-6 border-b-4 border-[#141414] flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">{service.name}</h3>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 ${service.status === 'Active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {service.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link 
                    to={`/services/${service.id}/edit`}
                    className="p-2 border-2 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
                  >
                    <Edit2 size={14} />
                  </Link>
                  <button 
                    onClick={() => handleDelete(service.id)}
                    className="p-2 border-2 border-[#141414] text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="p-6 bg-[#f5f5f5] flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase opacity-40">Standard Rate</p>
                  <p className="text-3xl font-black tracking-tighter">₹{service.amount.toLocaleString()}</p>
                </div>
                <Activity size={32} className="opacity-10" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
