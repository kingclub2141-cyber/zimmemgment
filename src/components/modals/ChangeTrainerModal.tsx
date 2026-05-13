import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  X, 
  Loader2,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';

interface ChangeTrainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberPlanId: string;
  currentTrainerId?: string;
  onSuccess: () => void;
}

export default function ChangeTrainerModal({ 
  isOpen, 
  onClose, 
  memberPlanId, 
  currentTrainerId,
  onSuccess 
}: ChangeTrainerModalProps) {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState(currentTrainerId || '');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchTrainers();
      setSelectedTrainer(currentTrainerId || '');
    }
  }, [isOpen, currentTrainerId]);

  const fetchTrainers = async () => {
    try {
      const { data } = await supabase
        .from('trainers')
        .select('id, name')
        .eq('status', 'Active');
      setTrainers(data || []);
    } catch (error) {
      toast.error('Failed to load trainers');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase
        .from('member_plans')
        .update({ trainer_id: selectedTrainer || null })
        .eq('id', memberPlanId);

      if (error) throw error;
      toast.success('Trainer updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Failed to update trainer');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white border-4 border-[#141414] w-full max-w-md shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b-4 border-[#141414] flex items-center justify-between">
          <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            <UserCheck size={24} /> Assign Trainer
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#f5f5f5] transition-all">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {fetching ? (
            <div className="h-20 flex items-center justify-center"><Loader2 className="animate-spin" /></div>
          ) : (
            <div className="space-y-4">
              <label className="block text-xs font-black uppercase tracking-widest opacity-40">Choose Trainer</label>
              <select
                value={selectedTrainer}
                onChange={(e) => setSelectedTrainer(e.target.value)}
                className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-bold outline-none"
              >
                <option value="">No Personal Trainer</option>
                {trainers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border-4 border-[#141414] font-black uppercase tracking-widest text-[10px] hover:bg-[#f5f5f5]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-[#141414] text-white border-4 border-[#141414] font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-[#141414]"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
