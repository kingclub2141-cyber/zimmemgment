import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Loader2,
  Share2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function LeadSources() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sources, setSources] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<any>(null);
  const [name, setName] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (gym) fetchSources();
  }, [gym]);

  const fetchSources = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lead_sources')
        .select('*')
        .eq('gym_id', gym.id)
        .order('name');
      
      if (error) throw error;
      setSources(data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = { gym_id: gym.id, name, is_active: isActive };
      
      if (editingSource) {
        const { error } = await supabase.from('lead_sources').update(data).eq('id', editingSource.id);
        if (error) throw error;
        toast.success('Source updated');
      } else {
        const { error } = await supabase.from('lead_sources').insert([data]);
        if (error) throw error;
        toast.success('Source added');
      }
      setIsModalOpen(false);
      setName('');
      setIsActive(true);
      setEditingSource(null);
      fetchSources();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteSource = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const { error } = await supabase.from('lead_sources').delete().eq('id', id);
      if (error) throw error;
      toast.success('Source deleted');
      fetchSources();
    } catch (error: any) {
      toast.error('Cannot delete: Source may be in use');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Lead Channels</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Manage marketing sources</p>
        </div>
        <button 
          onClick={() => { setIsModalOpen(true); setEditingSource(null); setName(''); setIsActive(true); }}
          className="flex items-center justify-center gap-3 bg-[#141414] text-white px-8 py-4 border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
        >
          <Plus size={18} /> New Channel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading && !isModalOpen ? (
          <div className="col-span-2 py-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>
        ) : sources.length === 0 ? (
          <div className="col-span-2 py-20 bg-white border-4 border-[#141414] text-center opacity-20 font-black uppercase tracking-widest text-xs shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
            No lead channels defined yet
          </div>
        ) : (
          sources.map((s) => (
            <div key={s.id} className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className={`p-3 border-2 border-[#141414] ${s.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                   <Share2 size={24} />
                </div>
                <div>
                   <h3 className="font-black uppercase tracking-tight">{s.name}</h3>
                   <span className={`text-[8px] font-black uppercase tracking-widest ${s.is_active ? 'text-green-600' : 'text-red-500'}`}>
                     {s.is_active ? 'Channel Active' : 'Channel Disabled'}
                   </span>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                  onClick={() => { setEditingSource(s); setName(s.name); setIsActive(s.is_active); setIsModalOpen(true); }}
                  className="p-2 border-2 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
                 >
                   <Edit3 size={14} />
                 </button>
                 <button 
                  onClick={() => deleteSource(s.id)}
                  className="p-2 border-2 border-[#141414] hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
                 >
                   <Trash2 size={14} />
                 </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border-8 border-[#141414] max-w-md w-full shadow-[20px_20px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
            <div className="bg-[#141414] p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tighter">{editingSource ? 'Edit Source' : 'New Source'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform"><XCircle size={24}/></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest">Channel Name</label>
                <input 
                  required
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-black uppercase outline-none focus:bg-white"
                  placeholder="e.g. INSTAGRAM ADS"
                />
              </div>
              <div className="flex items-center gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsActive(!isActive)}
                  className={`flex items-center gap-3 px-6 py-3 border-4 border-[#141414] font-black uppercase tracking-widest text-[10px] transition-all ${
                    isActive ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isActive ? <CheckCircle2 size={16}/> : <XCircle size={16}/>}
                  {isActive ? 'Active' : 'Disabled'}
                </button>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#141414] text-white border-4 border-[#141414] font-black uppercase tracking-widest hover:bg-white hover:text-[#141414] transition-all"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Save Channel'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
