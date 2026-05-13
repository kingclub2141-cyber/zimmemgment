import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  User, 
  CreditCard, 
  CheckCircle2,
  Loader2,
  Package,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  tax_percent: number;
}

export default function POS() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [customer, setCustomer] = useState<{ id?: string, name: string, phone: string }>({ name: '', phone: '' });
  const [paymentType, setPaymentType] = useState('Cash');
  const [activeTab, setActiveTab] = useState<'products' | 'checkout'>('products');

  useEffect(() => {
    if (gym) fetchProducts();
  }, [gym]);

  const fetchProducts = async () => {
    try {
      const { data } = await supabase
        .from('products')
        .select(`*, product_categories(name)`)
        .eq('gym_id', gym.id)
        .eq('status', 'Active')
        .gt('total_quantity', 0);
      setProducts(data || []);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.total_quantity) {
        toast.error('Insufficient stock');
        return;
      }
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { 
        id: product.id, 
        name: product.name, 
        price: product.selling_price, 
        quantity: 1, 
        stock: product.total_quantity,
        tax_percent: product.tax_percent || 0
      }]);
    }
  };

  const updateQty = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty > item.stock) { toast.error('Stock limit reached'); return item; }
        if (newQty < 1) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => setCart(cart.filter(i => i.id !== id));

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = cart.reduce((sum, item) => sum + (item.price * item.quantity * (item.tax_percent / 100)), 0);
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error('Cart is empty');
    if (!customer.name || !customer.phone) return toast.error('Customer info required');

    try {
      setLoading(true);
      // 1. Create Order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          gym_id: gym.id,
          member_id: customer.id || null,
          customer_name: customer.name,
          customer_phone: customer.phone,
          subtotal,
          tax,
          total,
          payment_mode: paymentType,
          status: 'Completed'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create Order Items & Update Stock
      const itemPromises = cart.map(async item => {
        await supabase.from('order_items').insert([{
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          price: item.price,
          tax: item.price * item.quantity * (item.tax_percent / 100),
          total: item.price * item.quantity
        }]);

        const { data: p } = await supabase.from('products').select('total_quantity').eq('id', item.id).single();
        await supabase.from('products').update({ total_quantity: (p?.total_quantity || 0) - item.quantity }).eq('id', item.id);
      });

      await Promise.all(itemPromises);
      
      toast.success('Order placed successfully!');
      setCart([]);
      setCustomer({ name: '', phone: '' });
      setActiveTab('products');
      fetchProducts();
    } catch (error) {
      toast.error('Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const searchMember = async () => {
    const { data } = await supabase.from('members').select('id, name, phone').ilike('phone', `%${memberSearch}%`).single();
    if (data) {
      setCustomer({ id: data.id, name: data.name, phone: data.phone });
      toast.success(`Member found: ${data.name}`);
    } else {
      toast.error('No member found');
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
      {/* Left Column: Products */}
      <div className={`flex-1 flex flex-col gap-6 ${activeTab === 'checkout' ? 'hidden lg:flex' : ''}`}>
        <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
            <input 
              type="text" 
              placeholder="Search items..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-12 pr-4 py-3 font-black outline-none" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
          {products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map(product => (
            <button 
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white border-4 border-[#141414] p-4 shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all text-left flex flex-col gap-3 group"
            >
              <div className="aspect-square bg-[#f5f5f5] border-2 border-[#141414] overflow-hidden flex items-center justify-center">
                {product.image_url ? (
                  <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Package size={40} className="opacity-10" />
                )}
              </div>
              <div>
                <h4 className="font-black uppercase tracking-tight text-[10px] h-8 line-clamp-2">{product.name}</h4>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-black text-sm">₹{product.selling_price}</span>
                  <span className="text-[10px] font-bold opacity-40 uppercase">Stock: {product.total_quantity}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Cart */}
      <div className={`w-full lg:w-[450px] flex flex-col bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] ${activeTab === 'products' ? 'hidden lg:flex' : ''}`}>
        <div className="p-6 border-b-4 border-[#141414] bg-[#141414] text-white flex items-center justify-between">
          <h2 className="font-black uppercase tracking-widest text-xs">Checkout Cart</h2>
          <span className="bg-white text-[#141414] px-2 py-0.5 font-black text-[10px]">{cart.length} ITEMS</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y-2 divide-[#141414]">
          {cart.length === 0 ? (
            <div className="p-10 text-center opacity-20 font-black uppercase tracking-widest text-[10px]">Your bag is empty</div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="p-4 flex flex-col gap-2 bg-white">
                <div className="flex items-center justify-between">
                  <h5 className="font-black uppercase tracking-tight text-[10px] truncate w-40">{item.name}</h5>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-600"><Trash2 size={14}/></button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border-2 border-[#141414]">
                    <button onClick={() => updateQty(item.id, -1)} className="px-2 py-1"><Minus size={10}/></button>
                    <span className="px-3 font-black text-xs">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="px-2 py-1"><Plus size={10}/></button>
                  </div>
                  <span className="font-black text-sm">₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-6 bg-[#f5f5f5] border-t-4 border-[#141414] space-y-4">
          <div className="space-y-4">
             <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Find Member by Phone" 
                value={memberSearch}
                onChange={e => setMemberSearch(e.target.value)}
                className="flex-1 bg-white border-2 border-[#141414] px-3 py-2 text-xs font-bold" 
              />
              <button onClick={searchMember} className="px-4 bg-[#141414] text-white text-[10px] font-black uppercase">Find</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="text" 
                placeholder="Cust. Name" 
                value={customer.name}
                onChange={e => setCustomer({ ...customer, name: e.target.value })}
                className="bg-white border-2 border-[#141414] px-3 py-2 text-xs font-bold" 
              />
              <input 
                type="text" 
                placeholder="Cust. Phone" 
                value={customer.phone}
                onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                className="bg-white border-2 border-[#141414] px-3 py-2 text-xs font-bold" 
              />
            </div>
          </div>

          <div className="space-y-1 border-t-2 border-dashed border-[#141414] pt-4">
             <div className="flex justify-between text-xs font-black uppercase">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-2xl font-black tracking-tighter">
              <span>TOTAL</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
          </div>

          <button 
            disabled={loading || cart.length === 0}
            onClick={handleCheckout}
            className="w-full py-4 bg-[#141414] text-white font-black uppercase tracking-widest text-xs border-4 border-[#141414] hover:bg-white hover:text-[#141414] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Complete Order <ArrowRight size={18}/></>}
          </button>
        </div>
      </div>
    </div>
  );
}
