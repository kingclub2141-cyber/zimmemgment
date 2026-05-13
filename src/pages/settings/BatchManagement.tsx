import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Clock, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  Loader2, 
  Zap, 
  Calendar,
  Users,
  Timer,
  Info,
  ArrowRight,
  X,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

export default function BatchManagement() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<any>(null);
  const [formData, setFormData] = useState({
    batch_name: '',
    start_time: '06:00',
    end_time: '07:00',
    is_active: true
  });

  useEffect(() => {
    if (gym) fetchBatches();
  }, [gym]);

  const fetchBatches = async () => {
    if (!gym?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .eq('gym_id', gym.id)
        .order('start_time');
      
      if (error) throw error;
      setBatches(data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (batch: any) => {
    setEditingBatch(batch);
    setFormData({
      batch_name: batch.batch_name,
      start_time: batch.start_time,
      end_time: batch.end_time,
      is_active: batch.is_active
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingBatch(null);
    setFormData({
      batch_name: '',
      start_time: '06:00',
      end_time: '07:00',
      is_active: true
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym?.id) {
      toast.error('Gym session not found. Please log in again.');
      return;
    }
    if (!formData.batch_name || !formData.start_time || !formData.end_time) {
      toast.error('All fields are required');
      return;
    }

    setIsSaving(true);
    try {
      if (editingBatch) {
        const { error } = await supabase
          .from('batches')
          .update({
            batch_name: formData.batch_name,
            start_time: formData.start_time,
            end_time: formData.end_time,
            is_active: formData.is_active
          })
          .eq('id', editingBatch.id);
        
        if (error) throw error;
        toast.success('Batch updated successfully');
      } else {
        const { error } = await supabase
          .from('batches')
          .insert([{
            gym_id: gym.id,
            batch_name: formData.batch_name,
            start_time: formData.start_time,
            end_time: formData.end_time,
            is_active: formData.is_active
          }]);
        
        if (error) throw error;
        toast.success('New batch defined successfully');
      }
      setShowModal(false);
      fetchBatches();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteBatch = async (id: string) => {
    if (!window.confirm('Delete this operational slot?')) return;
    try {
      const { error } = await supabase.from('batches').delete().eq('id', id);
      if (error) throw error;
      setBatches(batches.filter(b => b.id !== id));
      toast.success('Batch removed from schedule');
    } catch (error: any) {
      toast.error('Cannot remove active batch');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-8 border-[#141414] pb-12">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Operational Batches</h1>
          <p className="text-sm font-black uppercase tracking-[0.4em] opacity-40">Shift & slot inventory management</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-[#141414] text-white px-8 py-4 border-4 border-[#141414] font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-[8px_8px_0px_0px_rgba(20,20,20,0.1)] hover:invert transition-all"
        >
           <Plus size={18} /> Define Slot
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {loading ? (
            <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto opacity-20" size={40} /></div>
         ) : batches.length === 0 ? (
            <div className="col-span-full py-20 text-center border-4 border-dashed border-[#141414]/10 bg-white">
               <Clock size={48} className="mx-auto mb-4 opacity-10" />
               <p className="font-black uppercase tracking-widest opacity-20">No scheduled batches defined</p>
            </div>
         ) : batches.map((batch) => (
           <div key={batch.id} className="bg-white border-4 border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-8 pb-4 border-b-2 border-[#141414]/5">
                 <div className="space-y-1">
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic">{batch.batch_name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">
                      {batch.is_active ? 'Active Slot' : 'Inactive'}
                    </p>
                 </div>
                 <div className="p-3 bg-indigo-600 text-white shadow-[4px_4px_0px_0px_rgba(79,70,229,0.2)]">
                    <Zap size={20} />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                 <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase opacity-40 tracking-widest">Commencement</p>
                    <p className="text-lg font-black uppercase flex items-center gap-2">
                       <Clock size={16} className="text-indigo-600" /> {batch.start_time.substring(0, 5)}
                    </p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase opacity-40 tracking-widest">Termination</p>
                    <p className="text-lg font-black uppercase flex items-center gap-2">
                       <Clock size={16} className="text-orange-600" /> {batch.end_time.substring(0, 5)}
                    </p>
                 </div>
              </div>

              <div className="flex items-center justify-between border-t border-[#141414]/5 pt-6">
                 <div className="flex items-center gap-2">
                    <Users size={16} className="opacity-40" />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Operations Unit</span>
                 </div>
                 <div className="flex gap-4">
                    <button 
                      onClick={() => handleEdit(batch)}
                      className="p-3 border-2 border-[#141414]/10 hover:border-[#141414] transition-all"
                    >
                      <Edit2 size={16}/>
                    </button>
                    <button onClick={() => deleteBatch(batch.id)} className="p-3 border-2 border-red-100 text-red-600 hover:bg-red-50 transition-all"><Trash2 size={16}/></button>
                 </div>
              </div>
           </div>
         ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#141414]/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white border-4 border-[#141414] w-full max-w-lg shadow-[12px_12px_0px_0px_rgba(20,20,20,0.5)]">
            <div className="p-6 border-b-4 border-[#141414] flex items-center justify-between bg-[#f5f5f5]">
              <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                <Clock size={24} /> {editingBatch ? 'Edit Batch' : 'Define New Slot'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 border-2 border-[#141414] hover:bg-white transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Batch Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning Warriors"
                  value={formData.batch_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, batch_name: e.target.value }))}
                  className="w-full px-4 py-3 bg-[#f5f5f5] border-2 border-[#141414] text-sm font-bold focus:bg-white transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formData.start_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#f5f5f5] border-2 border-[#141414] text-sm font-bold focus:bg-white transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">End Time</label>
                  <input
                    type="time"
                    required
                    value={formData.end_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#f5f5f5] border-2 border-[#141414] text-sm font-bold focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-5 h-5 accent-[#141414]"
                />
                <label htmlFor="is_active" className="text-xs font-black uppercase tracking-widest cursor-pointer">
                  Slot is currently active
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-8 py-3 border-2 border-[#141414] text-xs font-black uppercase tracking-widest hover:bg-[#f5f5f5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-12 py-3 bg-[#141414] text-white text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,0.3)] disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
                  {editingBatch ? 'Update Slot' : 'Create Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-[#141414] text-white p-10 border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,0.1)] flex flex-col md:flex-row items-center gap-10">
         <Timer size={48} className="opacity-20 shrink-0" />
         <div className="space-y-2 flex-1">
            <h4 className="text-xl font-black uppercase italic tracking-tight">Active Duty Monitoring</h4>
            <p className="text-xs font-medium uppercase opacity-40 leading-relaxed tracking-wider">
               Operational slots are strictly synchronized with point-of-sale check-ins and attendance terminals. Ensure at least 15 minutes buffer between sequential batches.
            </p>
         </div>
         <button className="px-10 py-5 bg-white text-[#141414] font-black uppercase tracking-[0.2em] text-xs hover:invert transition-all">
            Review Calendar
         </button>
      </div>
    </div>
  );
}
