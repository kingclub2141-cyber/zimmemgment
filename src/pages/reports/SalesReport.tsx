import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  TrendingUp, 
  Search, 
  Download, 
  Loader2,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { toast } from 'sonner';

export default function SalesReport() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    avgOrder: 0,
    totalTax: 0
  });
  const [pieData, setPieData] = useState<any[]>([]);
  const [barData, setBarData] = useState<any[]>([]);

  useEffect(() => {
    if (gym) fetchReport();
  }, [gym]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const start = startOfMonth(new Date());
      const end = endOfMonth(new Date());

      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('gym_id', gym.id)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString());

      if (orders) {
        const total = orders.reduce((sum, o) => sum + o.total, 0);
        const tax = orders.reduce((sum, o) => sum + o.tax, 0);
        setStats({
          totalSales: total,
          totalOrders: orders.length,
          avgOrder: orders.length ? total / orders.length : 0,
          totalTax: tax
        });

        // Payment Mode Data
        const modes: any = {};
        orders.forEach(o => {
          modes[o.payment_mode] = (modes[o.payment_mode] || 0) + o.total;
        });
        setPieData(Object.keys(modes).map(k => ({ name: k, value: modes[k] })));
      }

      // Best selling products (Mocking logic for now as it requires complex joins/aggregations)
      const { data: items } = await supabase
        .from('order_items')
        .select('product_id, quantity, products(name)')
        .limit(100);
      
      const prodStats: any = {};
      items?.forEach(item => {
        // Handle both object and array response for the relation
        const productData: any = Array.isArray(item.products) ? item.products[0] : item.products;
        const name = productData?.name || 'Unknown';
        prodStats[name] = (prodStats[name] || 0) + item.quantity;
      });
      setBarData(Object.keys(prodStats).map(k => ({ name: k, qty: prodStats[k] })).sort((a,b) => b.qty - a.qty).slice(0, 5));

    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#141414', '#3b82f6', '#10b981', '#f59e0b', '#ee4444'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Store Sales Analytics</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Performance report for {format(new Date(), 'MMMM yyyy')}</p>
        </div>
        <button onClick={fetchReport} className="flex items-center gap-2 px-8 py-4 bg-[#141414] text-white border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Net Revenue', value: `₹${stats.totalSales.toLocaleString()}`, color: 'bg-blue-100', icon: <TrendingUp size={20}/> },
          { label: 'Total Orders', value: stats.totalOrders, color: 'bg-green-100', icon: <PieIcon size={20}/> },
          { label: 'Avg Order Value', value: `₹${stats.avgOrder.toFixed(0)}`, color: 'bg-yellow-100', icon: <BarChart3 size={20}/> },
          { label: 'Tax Collected', value: `₹${stats.totalTax.toLocaleString()}`, color: 'bg-red-100', icon: <Download size={20}/> },
        ].map((stat, i) => (
          <div key={i} className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
            <div className={`w-10 h-10 ${stat.color} flex items-center justify-center mb-4 border-2 border-[#141414]`}>
              {stat.icon}
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{stat.label}</p>
            <p className="text-2xl font-black tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales by Movement */}
        <div className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
          <h3 className="text-sm font-black uppercase tracking-widest mb-8 border-b-2 border-[#141414] pb-2">Sales by Payment Mode</h3>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={pieData}
                   innerRadius={60}
                   outerRadius={100}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {pieData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
             {pieData.map((d, i) => (
               <div key={i} className="flex items-center gap-2">
                 <div className="w-3 h-3" style={{ background: COLORS[i % COLORS.length] }}></div>
                 <span className="text-[10px] font-bold uppercase">{d.name}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
           <h3 className="text-sm font-black uppercase tracking-widest mb-8 border-b-2 border-[#141414] pb-2">Hottest Moving Products</h3>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={barData} layout="vertical">
                 <XAxis type="number" hide />
                 <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fontWeight: 'bold' }} stroke="#141414" />
                 <Tooltip />
                 <Bar dataKey="qty" fill="#141414" radius={[0, 4, 4, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
}
