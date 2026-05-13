import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Search, 
  Plus, 
  Filter, 
  Edit2, 
  Trash2, 
  Loader2,
  Calendar as CalendarIcon,
  Download,
  IndianRupee
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Expense {
  id: string;
  expense_date: string;
  category: string;
  amount: number;
  description: string;
  created_by: string;
  staff: {
    name: string;
  } | null;
}

export default function ExpenseList() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    from: format(new Date().setDate(1), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    if (gym) {
      fetchCategories();
      fetchExpenses();
    }
  }, [gym]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('expense_categories')
      .select('name')
      .eq('is_active', true);
    if (data) setCategories(data.map(c => c.name));
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('expenses')
        .select(`
          *,
          staff:created_by (name)
        `)
        .eq('gym_id', gym.id)
        .gte('expense_date', filters.from)
        .lte('expense_date', filters.to)
        .order('expense_date', { ascending: false });

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.search) {
        query = query.ilike('description', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setExpenses(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this expense?')) return;
    
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
      toast.success('Expense deleted');
      fetchExpenses();
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Expense Ledger</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Track your gym operations costs</p>
        </div>
        <div className="flex gap-4">
          <Link 
            to="/expenses/categories"
            className="px-6 py-3 border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-[#141414] hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-none active:translate-x-1 active:translate-y-1"
          >
            Manage Categories
          </Link>
          <Link 
            to="/expenses/add"
            className="flex items-center gap-2 px-6 py-3 bg-[#141414] text-white border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all shadow-[6px_6px_0px_0px_rgba(20,20,20,1)] hover:shadow-none active:translate-x-1 active:translate-y-1"
          >
            <Plus size={16} />
            Add Expense
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
            <input 
              type="text"
              placeholder="Search description..."
              value={filters.search}
              onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-12 pr-4 py-3 font-bold outline-none focus:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] transition-all"
            />
          </div>
          <select 
            value={filters.category}
            onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
            className="bg-[#f5f5f5] border-2 border-[#141414] px-4 py-3 font-bold outline-none cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <input 
              type="date"
              value={filters.from}
              onChange={(e) => setFilters(f => ({ ...f, from: e.target.value }))}
              className="flex-1 bg-[#f5f5f5] border-2 border-[#141414] px-4 py-3 font-bold outline-none"
            />
            <span className="font-black">-</span>
            <input 
              type="date"
              value={filters.to}
              onChange={(e) => setFilters(f => ({ ...f, to: e.target.value }))}
              className="flex-1 bg-[#f5f5f5] border-2 border-[#141414] px-4 py-3 font-bold outline-none"
            />
          </div>
          <button 
            onClick={fetchExpenses}
            className="bg-[#141414] text-white font-black uppercase tracking-widest text-xs h-full"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#141414] text-white">
                <th className="p-4 font-black uppercase tracking-widest text-xs">Date</th>
                <th className="p-4 font-black uppercase tracking-widest text-xs">Category</th>
                <th className="p-4 font-black uppercase tracking-widest text-xs">Description</th>
                <th className="p-4 font-black uppercase tracking-widest text-xs">Amount</th>
                <th className="p-4 font-black uppercase tracking-widest text-xs">Staff</th>
                <th className="p-4 font-black uppercase tracking-widest text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-[#141414] hidden md:table-row-group">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <Loader2 className="animate-spin inline-block mr-2" />
                    <span className="font-black uppercase tracking-widest text-xs">Loading ledger...</span>
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center">
                    <p className="font-black opacity-20 uppercase tracking-[0.2em] text-sm">No expenses found</p>
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-[#f5f5f5] transition-colors group">
                    <td className="p-4 font-bold text-sm">
                      {format(new Date(expense.expense_date), 'MMM dd, yyyy')}
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-[#141414] text-white text-[10px] font-black uppercase tracking-widest">
                        {expense.category}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-sm">
                      {expense.description || '-'}
                    </td>
                    <td className="p-4">
                      <span className="font-black text-lg tracking-tighter">₹{expense.amount.toLocaleString()}</span>
                    </td>
                    <td className="p-4 text-xs font-bold uppercase opacity-40">
                      {expense.staff?.name || 'Unknown'}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link 
                          to={`/expenses/${expense.id}/edit`}
                          className="p-2 border-2 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
                        >
                          <Edit2 size={14} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(expense.id)}
                          className="p-2 border-2 border-[#141414] text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {!loading && expenses.length > 0 && (
              <tfoot className="bg-[#f5f5f5] border-t-4 border-[#141414]">
                <tr>
                  <td colSpan={3} className="p-6 text-right font-black uppercase tracking-widest text-xs">Total Expenses</td>
                  <td colSpan={3} className="p-6">
                    <div className="flex items-center gap-2">
                      <IndianRupee size={20} className="stroke-[3]" />
                      <span className="text-4xl font-black tracking-tighter">{totalAmount.toLocaleString()}</span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y-2 divide-[#141414]">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="animate-spin inline-block mx-auto" />
              </div>
            ) : expenses.length === 0 ? (
              <div className="p-12 text-center opacity-20 italic font-black uppercase tracking-widest text-[10px]">No expenses found</div>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{expense.category}</p>
                      <p className="text-xs font-bold">{expense.description || 'No description'}</p>
                    </div>
                    <span className="text-lg font-black tracking-tighter">₹{expense.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="opacity-40">{format(new Date(expense.expense_date), 'MMM dd, yyyy')}</span>
                    <div className="flex gap-2">
                      <Link to={`/expenses/${expense.id}/edit`} className="p-2 border border-[#141414]">
                        <Edit2 size={12} />
                      </Link>
                      <button onClick={() => handleDelete(expense.id)} className="p-2 border border-red-600 text-red-600">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
