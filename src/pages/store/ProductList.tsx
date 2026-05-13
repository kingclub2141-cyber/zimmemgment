import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2,
  Package,
  AlertTriangle,
  MoveHorizontal
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function ProductList() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (gym) fetchProducts();
  }, [gym]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`*, product_categories(name)`)
        .eq('gym_id', gym.id)
        .order('name');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast.success('Product removed');
      fetchProducts();
    } catch (error) {
      toast.error('Product could not be deleted (it may have orders)');
    }
  };

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    if (filter === 'low_stock') return matchesSearch && p.total_quantity <= p.min_order_quantity;
    if (filter === 'out_stock') return matchesSearch && p.total_quantity === 0;
    return matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Inventory Console</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Retail & Nutrition Management</p>
        </div>
        <Link 
          to="/products/add"
          className="flex items-center gap-2 px-8 py-4 bg-[#141414] text-white border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
        >
          <Plus size={16} />
          New Product
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="md:col-span-2 bg-white border-4 border-[#141414] p-4 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
            <input 
              type="text" 
              placeholder="Search by Name or SKU..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-12 pr-4 py-2 font-bold outline-none" 
            />
          </div>
        </div>
        <select 
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="bg-white border-4 border-[#141414] p-4 font-black uppercase tracking-widest text-[10px] outline-none shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]"
        >
          <option value="all">Everywhere</option>
          <option value="low_stock">Low Stock Alerts</option>
          <option value="out_stock">Sold Out Items</option>
        </select>
      </div>

      <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#141414] text-white font-black uppercase tracking-widest text-[10px]">
                <th className="px-6 py-4">Item Details</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Inventory</th>
                <th className="px-6 py-4 text-right">Price</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#141414]">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-20 text-center font-black uppercase opacity-20">No matching products</td></tr>
              ) : (
                filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-[#f5f5f5] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 border-2 border-[#141414] overflow-hidden bg-white">
                          {product.image_url ? (
                            <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-10"><Package size={20}/></div>
                          )}
                        </div>
                        <div>
                          <p className="font-black uppercase tracking-tight text-sm">{product.name}</p>
                          <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{product.product_categories?.name || 'No Category'}</p>
                          <p className="text-[10px] font-mono opacity-60">SKU: {product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 border-2 border-[#141414] ${product.status === 'Active' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-black ${product.total_quantity <= product.min_order_quantity ? 'text-red-500' : ''}`}>
                          {product.total_quantity}
                        </span>
                        {product.total_quantity <= product.min_order_quantity && (
                          <AlertTriangle size={14} className="text-red-500" />
                        )}
                      </div>
                      <p className="text-[10px] font-bold opacity-40 uppercase">Min: {product.min_order_quantity}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="font-black text-sm text-green-600">₹{product.selling_price.toLocaleString()}</p>
                      <p className="text-[10px] font-bold opacity-40">Cost: ₹{product.purchase_price}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`/products/${product.id}/edit`} className="p-2 border-2 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none">
                          <Edit2 size={14} />
                        </Link>
                        <button onClick={() => handleDelete(product.id)} className="p-2 border-2 border-[#141414] hover:bg-white text-red-600 transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
