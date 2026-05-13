import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  Upload,
  X,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ExpenseForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { gym, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [categories, setCategories] = useState<string[]>([]);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    expense_date: format(new Date(), 'yyyy-MM-dd'),
    category: '',
    amount: '',
    description: '',
    bill_image_url: ''
  });

  useEffect(() => {
    if (gym) {
      fetchCategories();
      if (id) fetchExpense();
    }
  }, [gym, id]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('expense_categories')
      .select('name')
      .eq('is_active', true);
    
    if (data && data.length > 0) {
      setCategories(data.map(c => c.name));
    } else {
      setCategories([
        'Rent/Mortgage',
        'Salary/Payroll',
        'Equipment/Maintenance',
        'Marketing/Ads',
        'Other'
      ]);
    }
  };

  const fetchExpense = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setFormData({
        expense_date: data.expense_date,
        category: data.category,
        amount: data.amount.toString(),
        description: data.description || '',
        bill_image_url: data.bill_image_url || ''
      });
      setReceiptUrl(data.bill_image_url);
    } catch (error) {
      toast.error('Failed to fetch expense details');
      navigate('/expenses');
    } finally {
      setFetching(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `receipts/${gym.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gym_assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('gym_assets')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      toast.error('Failed to upload receipt');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym || !user) return;

    try {
      setLoading(true);
      let billImageUrl = formData.bill_image_url;

      if (receipt) {
        const uploadedUrl = await handleFileUpload(receipt);
        if (uploadedUrl) billImageUrl = uploadedUrl;
      }

      const expenseData = {
        gym_id: gym.id,
        expense_date: formData.expense_date,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description,
        bill_image_url: billImageUrl,
        created_by: user.id
      };

      if (id) {
        const { error } = await supabase
          .from('expenses')
          .update(expenseData)
          .eq('id', id);
        if (error) throw error;
        toast.success('Expense updated');
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert([expenseData]);
        if (error) throw error;
        toast.success('Expense added');
      }

      navigate('/expenses');
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#141414]" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/expenses')}
          className="p-3 border-4 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">
            {id ? 'Edit Expense' : 'Add New Expense'}
          </h1>
          <p className="text-xs font-black uppercase tracking-widest opacity-40">Documentation of outgoing funds</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest">Expense Date</label>
            <input 
              required
              type="date"
              value={formData.expense_date}
              onChange={(e) => setFormData(f => ({ ...f, expense_date: e.target.value }))}
              className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-bold outline-none focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest">Category</label>
            <select 
              required
              value={formData.category}
              onChange={(e) => setFormData(f => ({ ...f, category: e.target.value }))}
              className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-bold outline-none focus:bg-white transition-all cursor-pointer"
            >
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest">Amount (₹)</label>
            <input 
              required
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData(f => ({ ...f, amount: e.target.value }))}
              className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-black text-2xl outline-none focus:bg-white transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-widest">Receipt / Bill</label>
            <div className="relative group">
              <input 
                type="file"
                accept="image/*"
                onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                className="hidden"
                id="receipt-upload"
              />
              <label 
                htmlFor="receipt-upload"
                className="flex items-center justify-center gap-3 w-full h-[68px] border-4 border-dashed border-[#141414] bg-[#f5f5f5] font-black uppercase tracking-widest text-[10px] cursor-pointer group-hover:bg-white transition-all"
              >
                <Upload size={16} />
                {receipt ? receipt.name : 'Upload Bill'}
              </label>
              {receiptUrl && !receipt && (
                <div className="mt-2 flex items-center gap-2 p-2 bg-[#f5f5f5] border-2 border-[#141414]">
                  <FileText size={14} />
                  <span className="text-[10px] font-bold flex-1 truncate">Current Bill Image</span>
                  <button 
                    type="button" 
                    onClick={() => setReceiptUrl(null)}
                    className="p-1 hover:bg-red-100 text-red-600 rounded"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-black uppercase tracking-widest">Description</label>
          <textarea 
            rows={4}
            placeholder="Add details about the expense..."
            value={formData.description}
            onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))}
            className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-bold outline-none focus:bg-white transition-all resize-none"
          ></textarea>
        </div>

        <div className="pt-4">
          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-[#141414] text-white border-4 border-[#141414] font-black uppercase tracking-[0.3em] text-sm hover:bg-white hover:text-[#141414] transition-all flex items-center justify-center gap-3 shadow-[8px_8px_0px_0px_rgba(20,20,20,0.1)] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Save size={20} />
                {id ? 'Update Expense' : 'Save Expense'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
