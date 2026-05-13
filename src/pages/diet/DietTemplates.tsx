import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Plus, 
  Trash2, 
  Loader2,
  Utensils,
  Search,
  ChevronDown,
  ChevronUp,
  Save,
  ArrowLeft,
  SearchIcon,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';

export default function DietTemplates() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    meals: [
      { name: 'Breakfast', time: '08:00 AM', items: '' },
      { name: 'Mid-Morning Snack', time: '11:00 AM', items: '' },
      { name: 'Lunch', time: '01:30 PM', items: '' },
      { name: 'Evening Snack', time: '05:00 PM', items: '' },
      { name: 'Dinner', time: '08:30 PM', items: '' }
    ]
  });

  useEffect(() => {
    if (gym) fetchTemplates();
  }, [gym]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('diet_templates')
        .select('*')
        .eq('gym_id', gym.id);
      if (error) throw error;
      setTemplates(data || []);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      meals: [
        { name: 'Breakfast', time: '08:00 AM', items: '' },
        { name: 'Mid-Morning Snack', time: '11:00 AM', items: '' },
        { name: 'Lunch', time: '01:30 PM', items: '' },
        { name: 'Evening Snack', time: '05:00 PM', items: '' },
        { name: 'Dinner', time: '08:30 PM', items: '' }
      ]
    });
    setEditingTemplate(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = { 
        gym_id: gym.id, 
        name: formData.name, 
        description: formData.description, 
        meals: formData.meals 
      };

      if (editingTemplate) {
        const { error } = await supabase.from('diet_templates').update(data).eq('id', editingTemplate.id);
        if (error) throw error;
        toast.success('Template updated');
      } else {
        const { error } = await supabase.from('diet_templates').insert([data]);
        if (error) throw error;
        toast.success('Template saved');
      }
      setIsFormOpen(false);
      resetForm();
      fetchTemplates();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('Permanent deletion?')) return;
    try {
      const { error } = await supabase.from('diet_templates').delete().eq('id', id);
      if (error) throw error;
      toast.success('Template removed');
      fetchTemplates();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isFormOpen) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-8 duration-500 pb-20">
        <div className="flex items-center gap-4">
          <button onClick={() => { setIsFormOpen(false); resetForm(); }} className="p-3 border-4 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">{editingTemplate ? 'Modify Diet Pattern' : 'Blueprint New Diet'}</h1>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
           <div className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest">Template Label</label>
                 <input 
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-black outline-none uppercase"
                  placeholder="e.g. MASS GAIN - ADVANCED" 
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest">Brief Description</label>
                 <textarea 
                  value={formData.description}
                  onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                  className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-bold outline-none resize-none"
                  placeholder="High protein, calorie dense plan for muscle building..." 
                  rows={2}
                 />
              </div>
           </div>

           <div className="space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                 <Utensils size={18} /> Daily Meal Cycles
              </h3>
              {formData.meals.map((meal, index) => (
                <div key={index} className="bg-white border-4 border-[#141414] overflow-hidden shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] flex group">
                   <div className="bg-[#141414] text-white p-6 flex flex-col items-center justify-center min-w-[140px] gap-2">
                      <span className="text-[8px] font-black uppercase opacity-40">Meal Time</span>
                      <input 
                        type="text" 
                        value={meal.time}
                        onChange={e => {
                          const newMeals = [...formData.meals];
                          newMeals[index].time = e.target.value;
                          setFormData(f => ({ ...f, meals: newMeals }));
                        }}
                        className="bg-transparent text-center font-black uppercase text-xs w-full focus:outline-none"
                      />
                   </div>
                   <div className="flex-1 p-6 space-y-4">
                      <input 
                        type="text"
                        value={meal.name}
                        onChange={e => {
                          const newMeals = [...formData.meals];
                          newMeals[index].name = e.target.value;
                          setFormData(f => ({ ...f, meals: newMeals }));
                        }}
                        className="text-lg font-black uppercase tracking-tight focus:outline-none"
                      />
                      <textarea 
                        required
                        value={meal.items}
                        onChange={e => {
                          const newMeals = [...formData.meals];
                          newMeals[index].items = e.target.value;
                          setFormData(f => ({ ...f, meals: newMeals }));
                        }}
                        rows={3}
                        className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-4 font-bold text-sm outline-none resize-none"
                        placeholder="List items separated by commas... (e.g. 4 Egg Whites, 1 Bowl Oats)"
                      />
                   </div>
                   <div className="p-4 flex items-center justify-center border-l-2 border-[#141414] opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        type="button" 
                        onClick={() => {
                          const newMeals = formData.meals.filter((_, i) => i !== index);
                          setFormData(f => ({ ...f, meals: newMeals }));
                        }}
                        className="p-2 hover:bg-red-500 hover:text-white transition-all text-red-500"
                      >
                         <Trash2 size={18} />
                      </button>
                   </div>
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => setFormData(f => ({ ...f, meals: [...f.meals, { name: 'New Meal', time: '00:00 AM', items: '' }] }))}
                className="w-full py-4 border-4 border-dashed border-[#141414] font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
              >
                 <Plus size={16} /> Add Another Nutrition Window
              </button>
           </div>

           <button 
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-[#141414] text-white border-4 border-[#141414] font-black uppercase tracking-[0.4em] text-sm hover:bg-white hover:text-[#141414] transition-all flex items-center justify-center gap-3 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Deploy Diet Blueprint</>}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Nutritional Blueprints</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Standardize your gym's diet plans</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="flex items-center justify-center gap-3 bg-[#141414] text-white px-8 py-4 border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]"
        >
          <Plus size={18} /> Construct Blueprint
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-3 py-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>
        ) : templates.length === 0 ? (
          <div className="col-span-3 py-20 bg-white border-4 border-dashed border-[#141414] text-center opacity-40 font-black uppercase tracking-widest text-xs">
            Build your library of diet templates here
          </div>
        ) : (
          templates.map((t) => (
            <div key={t.id} className="bg-white border-4 border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] space-y-6 group relative">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 border-2 border-[#141414] text-red-600">
                     <Utensils size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter leading-none">{t.name}</h3>
                    <p className="text-[10px] font-bold opacity-40 mt-1 uppercase tracking-widest">{t.meals?.length || 0} Meal Phases</p>
                  </div>
               </div>
               <p className="text-sm font-bold opacity-60 line-clamp-2 italic leading-relaxed">
                 {t.description || "No specific instructions provided for this pattern."}
               </p>
               <div className="flex gap-4 pt-4 border-t-2 border-[#f0f0f0]">
                  <button 
                    onClick={() => { setEditingTemplate(t); setFormData({ name: t.name, description: t.description, meals: t.meals }); setIsFormOpen(true); }}
                    className="flex-1 py-2 bg-white border-2 border-[#141414] font-black uppercase tracking-widest text-[9px] hover:bg-[#141414] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
                  >
                    Modify
                  </button>
                  <button 
                    onClick={() => deleteTemplate(t.id)}
                    className="p-2 border-2 border-[#141414] text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
