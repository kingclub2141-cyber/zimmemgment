import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Loader2,
  Bookmark,
  XCircle,
  Database
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProductCategories() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [name, setName] = useState('');

  useEffect(() => {
    if (gym) fetchCategories();
  }, [gym]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_categories')
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
      const data = { gym_id: gym.id, name: name.toUpperCase() };
      
      if (editingCategory) {
        const { error } = await supabase.from('product_categories').update(data).eq('id', editingCategory.id);
        if (error) throw error;
        toast.success('Category updated');
      } else {
        const { error } = await supabase.from('product_categories').insert([data]);
        if (error) throw error;
        toast.success('Category added');
      }
      setIsModalOpen(false);
      setName('');
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
      const { error } = await supabase.from('product_categories').delete().eq('id', id);
      if (error) throw error;
      toast.success('Category deleted');
      fetchCategories();
    } catch (error: any) {
      toast.error('Cannot delete: Category might be used by products');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Inventory Groups</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Organize your store database</p>
        </div>
        <button 
          onClick={() => { setIsModalOpen(true); setEditingCategory(null); setName(''); }}
          className="flex items-center justify-center gap-3 bg-[#141414] text-white px-8 py-4 border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
        >
          <Plus size={18} /> New Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading && !isModalOpen ? (
          <div className="col-span-3 py-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>
        ) : categories.length === 0 ? (
          <div className="col-span-3 py-20 bg-white border-4 border-[#141414] text-center opacity-20 font-black uppercase tracking-widest text-xs shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
            No product groups defined
          </div>
        ) : (
          categories.map((c) => (
            <div key={c.id} className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 border-2 border-[#141414] text-indigo-700">
                   <Bookmark size={20} />
                </div>
                <div>
                   <h3 className="font-black uppercase tracking-tight">{c.name}</h3>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                  onClick={() => { setEditingCategory(c); setName(c.name); setIsModalOpen(true); }}
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
              <h2 className="text-xl font-black uppercase tracking-tighter">{editingCategory ? 'Modify Group' : 'Define Group'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform"><XCircle size={24}/></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                   <Database size={12} /> Portfolio Name
                </label>
                <input 
                  required
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-black uppercase outline-none focus:bg-white"
                  placeholder="e.g. SUPPLEMENTS"
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#141414] text-white border-4 border-[#141414] font-black uppercase tracking-widest hover:bg-white hover:text-[#141414] transition-all shadow-[8px_8px_0px_0px] active:shadow-none translate-y-0 active:translate-y-2"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Register Group'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
