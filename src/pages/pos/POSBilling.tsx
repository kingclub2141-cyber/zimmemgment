import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Loader2,
  Plus,
  Minus,
  User,
  CreditCard,
  Banknote,
  Smartphone,
  Save,
  Printer,
  X,
  Package
} from 'lucide-react';
import { toast } from 'sonner';

export default function POSBilling() {
  const { gym, staff } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [cart, setCart] = useState<any[]>([]);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (gym) fetchData();
  }, [gym]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        supabase.from('products').select('*').eq('gym_id', gym.id).gt('stock_quantity', 0).order('name'),
        supabase.from('product_categories').select('*').eq('gym_id', gym.id)
      ]);
      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock_quantity) {
        return toast.error('Out of stock');
      }
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const product = products.find(p => p.id === id);
        const newQty = item.quantity + delta;
        if (newQty > 0 && newQty <= (product?.stock_quantity || 0)) {
          return { ...item, quantity: newQty };
        }
      }
      return item;
    }));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal; // Can add tax logic later

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error('Cart is empty');
    if (!customerInfo.name || !customerInfo.phone) return toast.error('Customer info required');

    try {
      setIsProcessing(true);
      const receiptNo = `POS-${Date.now()}`;
      
      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          gym_id: gym.id,
          created_by: staff?.id,
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          total_amount: total,
          payment_mode: paymentMode,
          receipt_number: receiptNo,
          status: 'Completed'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create order items & update stock
      const itemsPayload = cart.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_sale: item.price
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(itemsPayload);
      if (itemsError) throw itemsError;

      // Update stock quantities sequentially to be safe
      for (const item of cart) {
        const { error: stockError } = await supabase.rpc('update_stock', {
          p_id: item.id,
          qty: item.quantity
        });
        if (stockError) {
          // Fallback if RPC is not defined
          const product = products.find(p => p.id === item.id);
          await supabase.from('products').update({ stock_quantity: product.stock_quantity - item.quantity }).eq('id', item.id);
        }
      }

      toast.success('Transaction Successful!');
      setCart([]);
      setCustomerInfo({ name: '', phone: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!activeCategory || p.category_id === activeCategory)
  );

  return (
    <div className="flex h-[calc(100vh-140px)] gap-8 animate-in slide-in-from-bottom-8 duration-500 overflow-hidden pr-4 pb-4">
      {/* Product Selection Area */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="bg-white border-4 border-[#141414] p-4 flex gap-4 items-center shadow-[6px_6px_0px_0px_rgba(20,20,20,1)]">
           <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={18} />
              <input 
                type="text" 
                placeholder="Find item or scan..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-10 pr-4 py-2 font-black uppercase text-sm outline-none" 
              />
           </div>
           <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              <button 
                onClick={() => setActiveCategory('')}
                className={`px-4 py-2 border-2 border-[#141414] font-black uppercase text-[9px] transition-all whitespace-nowrap ${
                  activeCategory === '' ? 'bg-[#141414] text-white' : 'bg-white hover:bg-gray-50'
                }`}
              >
                ALL
              </button>
              {categories.map(c => (
                <button 
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-4 py-2 border-2 border-[#141414] font-black uppercase text-[9px] transition-all whitespace-nowrap ${
                    activeCategory === c.id ? 'bg-[#141414] text-white' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  {c.name}
                </button>
              ))}
           </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 pr-4">
           {loading ? (
             <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>
           ) : filteredProducts.map(p => (
             <button 
              key={p.id}
              onClick={() => addToCart(p)}
              className="bg-white border-4 border-[#141414] p-6 text-left shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] hover:shadow-none translate-y-0 active:translate-y-2 transition-all flex flex-col justify-between group h-fit min-h-[160px]"
             >
                <div className="space-y-2">
                   <div className="flex justify-between items-start">
                      <div className="p-2 bg-indigo-50 border border-[#141414] text-indigo-700">
                         <Package size={16} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Qty: {p.stock_quantity}</span>
                   </div>
                   <h3 className="font-black uppercase tracking-tighter text-sm line-clamp-2">{p.name}</h3>
                </div>
                <div className="pt-4 flex justify-between items-end">
                   <p className="text-xl font-black">₹{p.price}</p>
                   <div className="w-8 h-8 rounded-full border-2 border-[#141414] flex items-center justify-center group-hover:bg-[#141414] group-hover:text-white transition-all">
                      <Plus size={16} />
                   </div>
                </div>
             </button>
           ))}
        </div>
      </div>

      {/* Cart & Billing Area */}
      <div className="w-[400px] bg-[#141414] text-white flex flex-col shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
        <div className="p-6 border-b-2 border-white/10 flex justify-between items-center">
           <div className="flex items-center gap-3">
              <ShoppingCart size={24} />
              <h2 className="text-xl font-black uppercase tracking-widest">Active Order</h2>
           </div>
           <span className="text-[10px] font-black bg-white text-[#141414] px-2 py-1 rounded-sm">{cart.length} ITEMS</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
           {cart.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center opacity-20 text-center p-8">
                <ShoppingCart size={64} className="mb-4" />
                <p className="text-sm font-black uppercase tracking-[0.2em]">Bucket is empty</p>
             </div>
           ) : (
             cart.map(item => (
               <div key={item.id} className="bg-white/5 border border-white/10 p-4 space-y-3">
                  <div className="flex justify-between items-start">
                     <p className="text-xs font-black uppercase tracking-tight line-clamp-1">{item.name}</p>
                     <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-300">
                        <X size={14} />
                     </button>
                  </div>
                  <div className="flex justify-between items-end">
                     <div className="flex items-center gap-4 bg-white/10 px-2 py-1">
                        <button onClick={() => updateQuantity(item.id, -1)} className="hover:text-amber-400"><Minus size={14}/></button>
                        <span className="text-sm font-black w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="hover:text-green-400"><Plus size={14}/></button>
                     </div>
                     <p className="font-black">₹{item.price * item.quantity}</p>
                  </div>
               </div>
             ))
           )}
        </div>

        <div className="p-6 bg-white/5 border-t-2 border-white/10 space-y-6">
           <div className="space-y-3">
              <div className="relative">
                 <User className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={14} />
                 <input 
                  type="text" 
                  placeholder="Customer Name"
                  value={customerInfo.name}
                  onChange={e => setCustomerInfo(c => ({ ...c, name: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 pl-10 pr-4 py-2 text-[10px] font-bold outline-none focus:border-white/40"
                 />
              </div>
              <div className="relative">
                 <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={14} />
                 <input 
                  type="text" 
                  placeholder="Phone Number"
                  value={customerInfo.phone}
                  onChange={e => setCustomerInfo(c => ({ ...c, phone: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 pl-10 pr-4 py-2 text-[10px] font-bold outline-none focus:border-white/40"
                 />
              </div>
           </div>

           <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'Cash', icon: <Banknote size={14}/> },
                { id: 'UPI', icon: <Smartphone size={14}/> },
                { id: 'Card', icon: <CreditCard size={14}/> }
              ].map(mode => (
                <button 
                  key={mode.id}
                  onClick={() => setPaymentMode(mode.id)}
                  className={`py-2 border-2 flex flex-col items-center gap-1 transition-all ${
                    paymentMode === mode.id ? 'bg-white text-[#141414] border-white' : 'border-white/20 text-white/40 hover:border-white/40'
                  }`}
                >
                   {mode.icon}
                   <span className="text-[8px] font-black uppercase">{mode.id}</span>
                </button>
              ))}
           </div>

           <div className="space-y-2 pt-2">
              <div className="flex justify-between text-white/60 text-xs font-bold uppercase tracking-widest">
                 <span>Subtotal</span>
                 <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-2xl font-black">
                 <span>TOTAL</span>
                 <span>₹{total}</span>
              </div>
           </div>

           <button 
            disabled={isProcessing}
            onClick={handleCheckout}
            className="w-full py-4 bg-white text-[#141414] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 hover:bg-gray-200 transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] active:shadow-none"
           >
              {isProcessing ? <Loader2 className="animate-spin" /> : <><Save size={18}/> Pay & Finalize</>}
           </button>
        </div>
      </div>
    </div>
  );
}
