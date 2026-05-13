import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Loader2,
  Tag,
  CheckCircle2,
  XCircle,
  Palette
} from 'lucide-react';
import { toast } from 'sonner';

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
  '#141414', // black
];

export default function LeadCategories() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#141414');

  useEffect(() => {
    if (gym) fetchCategories();
  }, [gym]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lead_categories')
        .select('*')
        .eq('gym_id', gym.id)
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = { gym_id: gym.id, name, color };
      
      if (editingCategory) {
        const { error } = await supabase.from('lead_categories').update(data).eq('id', editingCategory.id);
        if (error) throw error;
        toast.success('Category updated');
      } else {
        const { error } = await supabase.from('lead_categories').insert([data]);
        if (error) throw error;
        toast.success('Category added');
      }
      setIsModalOpen(false);
      setName('');
      setColor('#141414');
      setEditingCategory(null);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const { error } = await supabase.from('lead_categories').delete().eq('id', id);
      if (error) throw error;
      toast.success('Category deleted');
      fetchCategories();
    } catch (error: any) {
      toast.error('Cannot delete: Category may be in use');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Lead Status Types</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Categorize your prospects</p>
        </div>
        <button 
          onClick={() => { setIsModalOpen(true); setEditingCategory(null); setName(''); setColor('#141414'); }}
          className="flex items-center justify-center gap-3 bg-[#141414] text-white px-8 py-4 border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
        >
          <Plus size={18} /> New Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading && !isModalOpen ? (
          <div className="col-span-3 py-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>
        ) : categories.length === 0 ? (
          <div className="col-span-3 py-20 bg-white border-4 border-[#141414] text-center opacity-20 font-black uppercase tracking-widest text-xs shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
            No status categories defined
          </div>
        ) : (
          categories.map((c) => (
            <div key={c.id} className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] flex flex-col gap-4 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full" style={{ background: c.color }}></div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 border-2 border-[#141414] flex items-center justify-center" style={{ color: c.color, background: `${c.color}10` }}>
                   <Tag size={20} />
                </div>
                <div>
                   <h3 className="font-black uppercase tracking-tight text-lg">{c.name}</h3>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-4 border-t border-[#f0f0f0]">
                 <button 
                  onClick={() => { setEditingCategory(c); setName(c.name); setColor(c.color || '#141414'); setIsModalOpen(true); }}
                  className="p-2 border-2 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none text-xs"
                 >
                   <Edit3 size={12} />
                 </button>
                 <button 
                  onClick={() => deleteCategory(c.id)}
                  className="p-2 border-2 border-[#141414] hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none text-xs"
                 >
                   <Trash2 size={12} />
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
              <h2 className="text-xl font-black uppercase tracking-tighter">{editingCategory ? 'Edit Type' : 'New Type'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform"><XCircle size={24}/></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest">Type Name</label>
                <input 
                  required
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-black uppercase outline-none focus:bg-white"
                  placeholder="e.g. HOT PROSPECT"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Palette size={12} /> Identity Color
                </label>
                <div className="grid grid-cols-8 gap-2">
                   {PRESET_COLORS.map(c => (
                     <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-full aspect-square border-2 border-[#141414] transition-transform hover:scale-110 ${
                        color === c ? 'ring-4 ring-offset-2 ring-[#141414] scale-110 z-10' : ''
                      }`}
                      style={{ background: c }}
                     />
                   ))}
                </div>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#141414] text-white border-4 border-[#141414] font-black uppercase tracking-widest hover:bg-white hover:text-[#141414] transition-all shadow-[8px_8px_0px_0px] active:shadow-none translate-y-0 active:translate-y-2"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm Status Type'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
