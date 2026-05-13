import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Loader2,
  Package,
  Layers,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

export default function CategoryList() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCat, setNewCat] = useState({ name: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('product_categories').select('*').order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCat.name.trim()) return;

    try {
      const { error } = await supabase
        .from('product_categories')
        .insert([{ name: newCat.name.trim() }]);
      
      if (error) throw error;
      toast.success('Category added');
      setNewCat({ name: '' });
      fetchCategories();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete category?')) return;
    try {
      const { error } = await supabase.from('product_categories').delete().eq('id', id);
      if (error) throw error;
      toast.success('Category removed');
      fetchCategories();
    } catch (error) {
      toast.error('Could not delete category');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Product Categories</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Classify your supplements & gear</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Creation Form */}
        <div className="md:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] sticky top-8">
            <h3 className="font-black uppercase tracking-widest text-xs mb-6 pb-2 border-b-2 border-[#141414]">New Category</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase">Category Name</label>
                <input 
                  type="text"
                  required
                  value={newCat.name}
                  onChange={(e) => setNewCat({ name: e.target.value })}
                  className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-3 font-bold outline-none"
                  placeholder="e.g. Protein"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-[#141414] text-white font-black uppercase tracking-widest text-[10px] border-2 border-[#141414] hover:bg-white hover:text-[#141414] transition-all"
              >
                Create Category
              </button>
            </div>
          </form>
        </div>

        {/* List */}
        <div className="md:col-span-2">
          <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
            <div className="p-4 bg-[#141414] text-white font-black uppercase tracking-widest text-[10px]">
              Available Classifications
            </div>
            <div className="divide-y-2 divide-[#141414]">
              {loading ? (
                <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto" /></div>
              ) : categories.length === 0 ? (
                <div className="p-12 text-center opacity-20 font-black uppercase tracking-widest text-sm">No categories found</div>
              ) : (
                categories.map((cat) => (
                  <div key={cat.id} className="p-4 flex items-center justify-between group hover:bg-[#f5f5f5]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#141414] flex items-center justify-center text-white">
                        <Layers size={18} />
                      </div>
                      <span className="font-black uppercase tracking-tight">{cat.name}</span>
                    </div>
                    <button 
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 text-red-600 opacity-0 group-hover:opacity-100 transition-all border-2 border-transparent hover:border-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
