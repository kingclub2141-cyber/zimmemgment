import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Loader2,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';

interface Category {
  id: string;
  name: string;
  is_active: boolean;
}

export default function ExpenseCategories() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [gym]);

  const fetchCategories = async () => {
    if (!gym) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expense_categories')
        .select('*')
        .eq('gym_id', gym.id)
        .order('name');
      
      if (error) throw error;

      // Seed default categories if none exist or specific ones are missing
      const defaultCategories = [
        'Rent/Mortgage',
        'Salary/Payroll',
        'Equipment/Maintenance',
        'Marketing/Ads',
        'Other'
      ];

      const existingNames = (data || []).map(c => c.name);
      const missingCategories = defaultCategories.filter(name => !existingNames.includes(name));

      if (missingCategories.length > 0) {
        const { error: insertError } = await supabase
          .from('expense_categories')
          .insert(missingCategories.map(name => ({ name, gym_id: gym.id })));
        
        if (!insertError) {
          // Re-fetch if we added new ones
          const { data: updatedData } = await supabase
            .from('expense_categories')
            .select('*')
            .eq('gym_id', gym.id)
            .order('name');
          setCategories(updatedData || []);
        }
      } else {
        setCategories(data || []);
      }
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      const { error } = await supabase
        .from('expense_categories')
        .insert([{ name: newCategory.trim() }]);
      
      if (error) throw error;
      toast.success('Category added');
      setNewCategory('');
      fetchCategories();
    } catch (error) {
      toast.error('Category already exists or failed to add');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editValue.trim()) return;

    try {
      const { error } = await supabase
        .from('expense_categories')
        .update({ name: editValue.trim() })
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Category updated');
      setEditingId(null);
      fetchCategories();
    } catch (error) {
      toast.error('Failed to update category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Mark this category as inactive? This will hide it from new entries.')) return;
    
    try {
      const { error } = await supabase
        .from('expense_categories')
        .update({ is_active: false })
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Category inactivated');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter">Expense Categories</h1>
        <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Classify your spending</p>
      </div>

      <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
        <form onSubmit={handleAdd} className="flex gap-4">
          <input 
            type="text"
            placeholder="New Category Name..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-1 bg-[#f5f5f5] border-2 border-[#141414] px-4 py-3 font-bold outline-none focus:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] transition-all"
          />
          <button 
            type="submit"
            className="px-8 py-3 bg-[#141414] text-white font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] border-2 border-[#141414] transition-all"
          >
            Add
          </button>
        </form>
      </div>

      <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
        <div className="p-4 bg-[#141414] text-white flex items-center justify-between">
          <span className="font-black uppercase tracking-widest text-[10px]">Active Categories</span>
          <span className="bg-white text-[#141414] px-2 py-0.5 font-black text-[10px]">{categories.length}</span>
        </div>
        <div className="divide-y-2 divide-[#141414]">
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="animate-spin inline-block" />
            </div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center opacity-20 font-black uppercase tracking-widest text-sm">
              No categories defined
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className={`p-4 flex items-center justify-between group ${!category.is_active ? 'opacity-40 grayscale' : ''}`}>
                {editingId === category.id ? (
                  <div className="flex-1 flex gap-2">
                    <input 
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 bg-[#f5f5f5] border-2 border-[#141414] px-3 py-1 font-bold outline-none"
                      autoFocus
                    />
                    <button onClick={() => handleUpdate(category.id)} className="p-1 hover:text-green-600"><Check size={20}/></button>
                    <button onClick={() => setEditingId(null)} className="p-1 hover:text-red-600"><X size={20}/></button>
                  </div>
                ) : (
                  <>
                    <span className="font-black uppercase tracking-tight">{category.name}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingId(category.id);
                          setEditValue(category.name);
                        }}
                        className="p-2 border-2 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(category.id)}
                        className="p-2 border-2 border-[#141414] text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
