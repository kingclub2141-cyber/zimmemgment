import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Loader2,
  Package,
  ArrowUpDown,
  Filter,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Save
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProductManagement() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: 0,
    cost_price: 0,
    stock_quantity: 0,
    min_stock_level: 5,
    unit: 'Unit',
    barcode: ''
  });

  useEffect(() => {
    if (gym) fetchData();
  }, [gym]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        supabase.from('products').select('*, product_categories(name)').eq('gym_id', gym.id).order('name'),
        supabase.from('product_categories').select('*').eq('gym_id', gym.id)
      ]);
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = { ...formData, gym_id: gym.id };
      
      if (editingProduct) {
        const { error } = await supabase.from('products').update(data).eq('id', editingProduct.id);
        if (error) throw error;
        toast.success('Product updated');
      } else {
        const { error } = await supabase.from('products').insert([data]);
        if (error) throw error;
        toast.success('Product added');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category_id: '',
      price: 0,
      cost_price: 0,
      stock_quantity: 0,
      min_stock_level: 5,
      unit: 'Unit',
      barcode: ''
    });
    setEditingProduct(null);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Permanent delete?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast.success('Product removed');
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredProducts = products.filter(p => 
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.barcode?.includes(search)) &&
    (!categoryFilter || p.category_id === categoryFilter)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Stock Inventory</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Manage your retail items</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center gap-3 bg-[#141414] text-white px-8 py-4 border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
        >
          <Plus size={18} /> Add SKU
        </button>
      </div>

      <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
          <input 
            type="text" 
            placeholder="Search products or scan barcode..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-12 pr-4 py-3 font-bold outline-none" 
          />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-[#f5f5f5] border-2 border-[#141414] px-4 py-3 font-bold outline-none text-xs uppercase">
          <option value="">ALL CATEGORIES</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#141414] text-white font-black uppercase tracking-widest text-[10px]">
                <th className="px-6 py-4">Item Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price (₹)</th>
                <th className="px-6 py-4">SOH</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#141414]">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center opacity-20 font-black uppercase">Warehouse is empty</td></tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLowStock = p.stock_quantity <= p.min_stock_level;
                  return (
                    <tr key={p.id} className="hover:bg-[#f5f5f5] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 border-2 border-[#141414] ${isLowStock ? 'bg-red-50 text-red-500' : 'bg-gray-50'}`}>
                             <Package size={20} />
                          </div>
                          <div>
                            <p className="font-black uppercase tracking-tight">{p.name}</p>
                            <p className="text-[10px] font-bold opacity-40">{p.barcode || 'NO BARCODE'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black uppercase px-2 py-1 bg-white border border-[#141414] w-fit italic">
                          {p.product_categories?.name || 'Unsorted'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black">
                        {p.price.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex flex-col">
                            <span className={`text-lg font-black tracking-tighter ${isLowStock ? 'text-red-600' : ''}`}>
                              {p.stock_quantity}
                            </span>
                            {isLowStock && (
                              <span className="text-[8px] font-black uppercase text-red-500 flex items-center gap-1 animate-pulse">
                                <AlertCircle size={8} /> Restock Needed
                              </span>
                            )}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => { setEditingProduct(p); setFormData({ ...p }); setIsModalOpen(true); }}
                            className="p-2 border-2 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={() => deleteProduct(p.id)}
                            className="p-2 border-2 border-[#141414] hover:bg-red-500 hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border-8 border-[#141414] max-w-2xl w-full shadow-[20px_20px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
            <div className="bg-[#141414] p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tighter">{editingProduct ? 'Mod SKU' : 'New Product Entry'}</h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="hover:rotate-90 transition-transform bg-white/20 p-2 rounded-full"
              >
                <Plus className="rotate-45" size={20}/>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest">Product Display Name</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value.toUpperCase() }))} className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-3 font-black outline-none" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest">Group</label>
                        <select required value={formData.category_id} onChange={e => setFormData(f => ({ ...f, category_id: e.target.value }))} className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-3 font-black outline-none">
                           <option value="">SELECT GROUP</option>
                           {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest">Barcode / SKU</label>
                        <input type="text" value={formData.barcode} onChange={e => setFormData(f => ({ ...f, barcode: e.target.value }))} className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-3 font-black outline-none" placeholder="SCAN OR TYPE..." />
                     </div>
                  </div>
                  <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest">Sell Price</label>
                          <input required type="number" value={formData.price} onChange={e => setFormData(f => ({ ...f, price: Number(e.target.value) }))} className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-3 font-black outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest">Cost Price</label>
                          <input required type="number" value={formData.cost_price} onChange={e => setFormData(f => ({ ...f, cost_price: Number(e.target.value) }))} className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-3 font-black outline-none" />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest">In Stock</label>
                          <input required type="number" value={formData.stock_quantity} onChange={e => setFormData(f => ({ ...f, stock_quantity: Number(e.target.value) }))} className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-3 font-black outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest">Min. Safety Stock</label>
                          <input required type="number" value={formData.min_stock_level} onChange={e => setFormData(f => ({ ...f, min_stock_level: Number(e.target.value) }))} className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-3 font-black outline-none" />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest">Measurement Unit</label>
                        <select value={formData.unit} onChange={e => setFormData(f => ({ ...f, unit: e.target.value }))} className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-3 font-black outline-none">
                           <option value="Unit">UNIT</option>
                           <option value="Kg">KG</option>
                           <option value="Grams">GRAMS</option>
                           <option value="Bottle">BOTTLE</option>
                           <option value="Packet">PACKET</option>
                        </select>
                     </div>
                  </div>
               </div>
               <button 
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-[#141414] text-white border-4 border-[#141414] font-black uppercase tracking-widest hover:bg-white hover:text-[#141414] transition-all shadow-[12px_12px_0px_0px] active:shadow-none translate-y-0 active:translate-y-2"
              >
                {loading ? <Loader2 className="animate-spin mx-auto" /> : <><Save size={18} className="inline mr-2"/> Catalog Item</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
