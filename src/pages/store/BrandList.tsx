import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  Trash2, 
  Loader2,
  Bookmark
} from 'lucide-react';
import { toast } from 'sonner';

export default function BrandList() {
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<any[]>([]);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('product_brands').select('*').order('name');
      if (error) throw error;
      setBrands(data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await supabase.from('product_brands').insert([{ name: newName.trim() }]);
      toast.success('Brand added');
      setNewName('');
      fetchBrands();
    } catch (error) { toast.error('Failed to add'); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete brand?')) return;
    await supabase.from('product_brands').delete().eq('id', id);
    fetchBrands();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Product Brands</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Brands list (Optimum, Muscletech, etc.)</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <form onSubmit={handleSubmit} className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] sticky top-8">
            <h3 className="font-black uppercase tracking-widest text-xs mb-6 pb-2 border-b-2 border-[#141414]">New Brand</h3>
            <div className="space-y-4">
              <input type="text" required value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-3 font-bold" placeholder="Brand Name" />
              <button type="submit" className="w-full py-4 bg-[#141414] text-white font-black uppercase tracking-widest text-[10px] border-2 border-[#141414] hover:bg-white hover:text-[#141414] transition-all">Add Brand</button>
            </div>
          </form>
        </div>
        <div className="md:col-span-2">
           <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] divide-y-2 divide-[#141414]">
              {loading ? <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto" /></div> : 
               brands.map(b => (
                 <div key={b.id} className="p-4 flex items-center justify-between group hover:bg-[#f5f5f5]">
                    <div className="flex items-center gap-4">
                      <Bookmark size={18} className="opacity-20" />
                      <span className="font-black uppercase">{b.name}</span>
                    </div>
                    <button onClick={() => handleDelete(b.id)} className="p-2 text-red-600 opacity-20 group-hover:opacity-100 hover:opacity-100"><Trash2 size={16}/></button>
                 </div>
               ))}
           </div>
        </div>
      </div>
    </div>
  );
}
