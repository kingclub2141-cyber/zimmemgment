import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  Share2,
  Calendar,
  User,
  Phone,
  Mail,
  Type,
  Tag
} from 'lucide-react';
import { toast } from 'sonner';

export default function AddLead() {
  const navigate = useNavigate();
  const { gym, staff } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [sources, setSources] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    source_id: '',
    category_id: '',
    status: 'Pending',
    next_followup_date: '',
    notes: '',
    interested_in: [] as string[]
  });

  const INTEREST_OPTIONS = [
    'Membership',
    'Personal Training',
    'Zumba/Yoga',
    'MMA/Boxing',
    'Diet Plans',
    'Supplements'
  ];

  useEffect(() => {
    if (gym) fetchData();
  }, [gym]);

  const fetchData = async () => {
    const [sourcesRes, categoriesRes] = await Promise.all([
      supabase.from('lead_sources').select('*').eq('gym_id', gym.id).eq('is_active', true),
      supabase.from('lead_categories').select('*').eq('gym_id', gym.id)
    ]);
    setSources(sourcesRes.data || []);
    setCategories(categoriesRes.data || []);
    setFetching(false);
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interested_in: prev.interested_in.includes(interest)
        ? prev.interested_in.filter(i => i !== interest)
        : [...prev.interested_in, interest]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym) return;

    try {
      setLoading(true);
      const { error } = await supabase.from('leads').insert([{
        gym_id: gym.id,
        created_by: staff?.id,
        ...formData
      }]);

      if (error) throw error;
      toast.success('New prospect added');
      navigate('/leads');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/leads')} className="p-3 border-4 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Onboard Prospect</h1>
          <p className="text-xs font-black uppercase tracking-widest opacity-40">Capture new interest</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest border-b-2 border-[#f0f0f0] pb-4 flex items-center gap-2">
              <User size={16} /> Contact Details
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest">Full Name</label>
                 <input 
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-black outline-none"
                  placeholder="e.g. Bruce Wayne" 
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest">Phone Number</label>
                 <div className="relative">
                   <Phone className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={18} />
                   <input 
                    required
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                    className="w-full bg-[#f5f5f5] border-4 border-[#141414] pl-12 pr-4 py-4 font-bold outline-none"
                    placeholder="91XXXXXXXXX" 
                   />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest">Email (Optional)</label>
                 <div className="relative">
                   <Mail className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={18} />
                   <input 
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                    className="w-full bg-[#f5f5f5] border-4 border-[#141414] pl-12 pr-4 py-4 font-bold outline-none"
                   />
                 </div>
              </div>
            </div>
          </div>

          <div className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest border-b-2 border-[#f0f0f0] pb-4 flex items-center gap-2">
              <Tag size={16} /> Categorization
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest">Lead Source</label>
                 <select 
                  required
                  value={formData.source_id}
                  onChange={e => setFormData(f => ({ ...f, source_id: e.target.value }))}
                  className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-black outline-none"
                 >
                   <option value="">HOW DID THEY FIND US?</option>
                   {sources.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest">Prospect Category</label>
                 <select 
                  required
                  value={formData.category_id}
                  onChange={e => setFormData(f => ({ ...f, category_id: e.target.value }))}
                  className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-black outline-none"
                 >
                   <option value="">SELECT INTEREST LEVEL</option>
                   {categories.map(c => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
                 </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-6">
             <h3 className="text-sm font-black uppercase tracking-widest border-b-2 border-[#f0f0f0] pb-4 flex items-center gap-2">
               <Calendar size={16} /> Next Follow-up
             </h3>
             <div className="space-y-4">
               <input 
                type="date"
                value={formData.next_followup_date}
                onChange={e => setFormData(f => ({ ...f, next_followup_date: e.target.value }))}
                className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-black outline-none"
               />
               <textarea 
                value={formData.notes}
                onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
                rows={4}
                placeholder="Talk details, requirements, objections..."
                className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-bold outline-none resize-none"
               />
             </div>
           </div>

           <div className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-6">
             <h3 className="text-sm font-black uppercase tracking-widest border-b-2 border-[#f0f0f0] pb-4">Area of Interest</h3>
             <div className="flex flex-wrap gap-2">
               {INTEREST_OPTIONS.map(opt => {
                 const isSelected = formData.interested_in.includes(opt);
                 return (
                   <button
                    key={opt}
                    type="button"
                    onClick={() => toggleInterest(opt)}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-2 border-[#141414] transition-all ${
                      isSelected ? 'bg-[#141414] text-white' : 'bg-white text-[#141414] hover:bg-gray-100'
                    }`}
                   >
                     {opt}
                   </button>
                 );
               })}
             </div>
           </div>

           <button 
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-[#141414] text-white border-4 border-[#141414] font-black uppercase tracking-[0.4em] text-sm hover:bg-white hover:text-[#141414] transition-all flex items-center justify-center gap-3 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] active:shadow-none translate-y-0 active:translate-y-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Register Prospect</>}
          </button>
        </div>
      </form>
    </div>
  );
}
