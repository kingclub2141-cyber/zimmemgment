import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  Upload,
  Camera,
  X,
  Package,
  Layers,
  Tag,
  Boxes,
  IndianRupee
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { gym } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    brand_id: '',
    unit_id: '',
    sku: '',
    purchase_price: '0',
    selling_price: '0',
    tax_percent: '0',
    total_quantity: '0',
    min_order_quantity: '5',
    status: 'Active',
    image_url: ''
  });

  useEffect(() => {
    if (gym?.id) {
      fetchMeta();
      if (id) fetchProduct();
      else generateSKU();
    }
  }, [gym?.id, id]);

  const fetchMeta = async () => {
    const [cats, brnds, unts] = await Promise.all([
      supabase.from('product_categories').select('*').eq('gym_id', gym.id).order('name'),
      supabase.from('product_brands').select('*').eq('gym_id', gym.id).order('name'),
      supabase.from('product_units').select('*').eq('gym_id', gym.id).order('name')
    ]);
    setCategories(cats.data || []);
    setBrands(brnds.data || []);
    setUnits(unts.data || []);
  };

  const generateSKU = () => {
    const code = 'PRD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData(f => ({ ...f, sku: code }));
  };

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error) throw error;
      setFormData({
        name: data.name,
        description: data.description || '',
        category_id: data.category_id || '',
        brand_id: data.brand_id || '',
        unit_id: data.unit_id || '',
        sku: data.sku,
        purchase_price: data.purchase_price.toString(),
        selling_price: data.selling_price.toString(),
        tax_percent: data.tax_percent?.toString() || '0',
        total_quantity: data.total_quantity.toString(),
        min_order_quantity: data.min_order_quantity.toString(),
        status: data.status,
        image_url: data.image_url || ''
      });
      setPreview(data.image_url);
    } catch (error) {
      toast.error('Product not found');
      navigate('/store/products');
    } finally {
      setFetching(false);
    }
  };

  const uploadImage = async (file: File) => {
    const ext = file.name.split('.').pop();
    const name = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;
    const path = `products/${gym.id}/${name}`;
    const { error } = await supabase.storage.from('gym_assets').upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from('gym_assets').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym?.id) return;

    try {
      setLoading(true);
      let imgUrl = formData.image_url;
      if (image) {
        try {
          imgUrl = await uploadImage(image);
        } catch (uploadErr) {
          console.error('Image upload failed, continuing with fallback:', uploadErr);
          // Fallback to placeholder if storage isn't set up
          imgUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=141414&color=fff`;
        }
      }

      const payload = {
        ...formData,
        gym_id: gym.id,
        purchase_price: parseFloat(formData.purchase_price) || 0,
        selling_price: parseFloat(formData.selling_price) || 0,
        tax_percent: parseFloat(formData.tax_percent) || 0,
        total_quantity: parseInt(formData.total_quantity) || 0,
        min_order_quantity: parseInt(formData.min_order_quantity) || 0,
        image_url: imgUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=141414&color=fff`
      };

      if (id) {
        const { error } = await supabase.from('products').update(payload).eq('id', id);
        if (error) throw error;
        toast.success('Product updated');
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
        toast.success('Product created');
      }
      navigate('/store/products');
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-[#141414]" size={40} /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/store/products')} className="p-3 border-4 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">{id ? 'Update Stock Item' : 'Add New Inventory'}</h1>
          <p className="text-xs font-black uppercase tracking-widest opacity-40">Store & Catalog Management</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* General Info */}
          <div className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-8">
            <div className="flex items-center gap-2 pb-4 border-b-4 border-[#141414]">
              <Package size={20} />
              <h3 className="font-black uppercase tracking-widest text-xs">Essentials</h3>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Product Identity *</label>
                <input 
                  required 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} 
                  className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-4 font-black block outline-none focus:bg-white transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,0.1)] focus:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]" 
                  placeholder="e.g. Whey Protein Isolate"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Brief Description</label>
                <textarea 
                  rows={2} 
                  value={formData.description} 
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} 
                  className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-4 font-bold resize-none outline-none focus:bg-white" 
                  placeholder="Key features or details..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">SKU / Unique ID</label>
                  <input 
                    required 
                    type="text" 
                    value={formData.sku} 
                    onChange={e => setFormData(f => ({ ...f, sku: e.target.value }))} 
                    className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-4 font-mono font-bold text-sm outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Category</label>
                  <select 
                    required 
                    value={formData.category_id} 
                    onChange={e => setFormData(f => ({ ...f, category_id: e.target.value }))} 
                    className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-4 font-black outline-none"
                  >
                    <option value="">UNCATEGORIZED</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Brand Name</label>
                  <select 
                    required 
                    value={formData.brand_id} 
                    onChange={e => setFormData(f => ({ ...f, brand_id: e.target.value }))} 
                    className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-4 font-black outline-none"
                  >
                    <option value="">NO BRAND</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Sales Unit</label>
                  <select 
                    required 
                    value={formData.unit_id} 
                    onChange={e => setFormData(f => ({ ...f, unit_id: e.target.value }))} 
                    className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-4 font-black outline-none"
                  >
                    <option value="">KG / PC / BOX</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-8">
            <div className="flex items-center gap-2 pb-4 border-b-4 border-[#141414]">
              <IndianRupee size={20} />
              <h3 className="font-black uppercase tracking-widest text-xs">Pricing & Quantity</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase opacity-50">Purchase Price (₹)</label>
                <input 
                  required 
                  type="number" 
                  step="0.01"
                  value={formData.purchase_price} 
                  onChange={e => setFormData(f => ({ ...f, purchase_price: e.target.value }))} 
                  className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-4 font-black text-2xl outline-none focus:bg-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase opacity-50">Selling Price (₹)</label>
                <input 
                  required 
                  type="number" 
                  step="0.01"
                  value={formData.selling_price} 
                  onChange={e => setFormData(f => ({ ...f, selling_price: e.target.value }))} 
                  className="w-full bg-green-50 border-2 border-[#141414] p-4 font-black text-2xl text-green-700 outline-none focus:bg-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase opacity-50">Tax / GST (%)</label>
                <input 
                  type="number" 
                  value={formData.tax_percent} 
                  onChange={e => setFormData(f => ({ ...f, tax_percent: e.target.value }))} 
                  className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-4 font-black text-2xl outline-none" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase opacity-50">Opening Stock</label>
                <input 
                  required 
                  type="number" 
                  value={formData.total_quantity} 
                  onChange={e => setFormData(f => ({ ...f, total_quantity: e.target.value }))} 
                  className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-4 font-black text-2xl outline-none" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase opacity-50">Low Stock Alert</label>
                <input 
                  required 
                  type="number" 
                  value={formData.min_order_quantity} 
                  onChange={e => setFormData(f => ({ ...f, min_order_quantity: e.target.value }))} 
                  className="w-full bg-[#f5f5f5] border-2 border-red-600/30 p-4 font-black text-2xl text-red-600 outline-none" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
            <h3 className="text-xs font-black uppercase mb-4 tracking-widest border-b-2 border-[#141414] pb-2">Visual Asset</h3>
            <div className="relative group aspect-square border-4 border-dashed border-[#141414] bg-[#f5f5f5] overflow-hidden hover:border-solid hover:bg-white transition-all">
              {preview ? (
                <img src={preview} alt="Product" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center opacity-20">
                  <Camera size={48} />
                  <span className="text-[10px] font-black uppercase mt-2">Upload Display Photo</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) { setImage(file); setPreview(URL.createObjectURL(file)); }
                }} 
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
              {preview && (
                <button 
                  type="button"
                  onClick={() => { setImage(null); setPreview(null); setFormData(f => ({ ...f, image_url: '' })); }}
                  className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <p className="text-[9px] font-bold opacity-30 mt-4 leading-relaxed uppercase">Allowed: JPG, PNG, WEBP. Max 2MB recommended for fast loading.</p>
          </div>

          <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Visibility</label>
              <select 
                value={formData.status} 
                onChange={e => setFormData(f => ({ ...f, status: e.target.value }))} 
                className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-4 font-black uppercase tracking-widest text-[10px] outline-none appearance-none cursor-pointer"
              >
                <option value="Active">IN STOCK / ACTIVE</option>
                <option value="Inactive">OUT OF STOCK / HIDDEN</option>
              </select>
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-5 bg-[#141414] text-white font-black uppercase tracking-[0.3em] text-xs border-4 border-[#141414] hover:bg-white hover:text-[#141414] transition-all flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] active:shadow-none active:translate-x-1 active:translate-y-1 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  <Save size={18} />
                  {id ? 'Sync Changes' : 'Confirm Stock'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
