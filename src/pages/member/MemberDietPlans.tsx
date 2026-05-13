import React, { useState, useEffect } from 'react';
import { Apple, Clock, Flame, Info, CheckCircle2, Trophy, ArrowRight, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';

export default function MemberDietPlans() {
  const { profile } = useAuth();
  const [dietPlan, setDietPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.member_id) {
      fetchDiet();
    }
  }, [profile]);

  const fetchDiet = async () => {
    try {
      const { data } = await supabase
        .from('member_diet_plans')
        .select('*')
        .eq('member_id', profile.member_id)
        .eq('status', 'Active')
        .single();
      
      setDietPlan(data);
    } catch (error) {
      console.error('Error fetching diet:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const demoPlan = {
    name: "Lean Muscle Gain (Special)",
    kcal: 2800,
    protein: "160g",
    carbs: "240g",
    fats: "70g",
    meals: [
      { time: "07:00 AM", title: "Pre-Workout", items: "1 Banana + 1 scoop Whey Protein" },
      { time: "09:30 AM", title: "Breakfast", items: "4 Egg Whites + 1 cup Oats with Almonds" },
      { time: "01:30 PM", title: "Lunch", items: "150g Grilled Chicken + 1 cup Brown Rice + Salad" },
      { time: "05:00 PM", title: "Eve Snack", items: "Greek Yogurt + Handful of Walnuts" },
      { time: "08:30 PM", title: "Dinner", items: "150g Paneer/Fish + Sauteed Vegetables" }
    ]
  };

  const plan = dietPlan || demoPlan;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Nutrition & Diet</h1>
          <p className="text-gray-500 font-medium italic">Fuel your transformation</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-[#E13D4B] rounded-xl border border-rose-100">
          <Flame size={18} className="animate-pulse" />
          <span className="text-xs font-black uppercase tracking-widest">{plan.kcal} kcal Daily Target</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Macros View */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-3 gap-4">
             <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-100 border border-gray-50 text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Protein</p>
                <p className="text-2xl font-black text-blue-600">{plan.protein}</p>
             </div>
             <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-100 border border-gray-50 text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Carbs</p>
                <p className="text-2xl font-black text-amber-600">{plan.carbs}</p>
             </div>
             <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-100 border border-gray-50 text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Fats</p>
                <p className="text-2xl font-black text-rose-600">{plan.fats}</p>
             </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-50 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                  <Apple size={18} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest">Daily Meal Plan</h3>
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Today's Schedule</span>
            </div>
            <div className="divide-y divide-gray-50">
              {plan.meals.map((meal, i) => (
                <div key={i} className="p-6 flex gap-6 hover:bg-gray-50 transition-all group">
                  <div className="text-center min-w-[70px]">
                    <p className="text-xs font-black text-gray-900 leading-tight">{meal.time.split(' ')[0]}</p>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{meal.time.split(' ')[1]}</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">{meal.title}</h4>
                      <div className="h-px bg-gray-100 flex-1" />
                    </div>
                    <p className="text-sm font-medium text-gray-600 leading-relaxed">{meal.items}</p>
                  </div>
                  <button className="w-8 h-8 rounded-full border-2 border-gray-100 flex items-center justify-center text-gray-300 group-hover:border-green-500 group-hover:text-green-500 transition-all">
                    <CheckCircle2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E13D4B] rounded-full -mr-16 -mt-16 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <h3 className="text-lg font-black leading-tight mb-4 uppercase tracking-tighter">Download PDF Receipt</h3>
            <p className="text-xs text-white/60 font-medium mb-6 leading-relaxed">Keep your diet reference offline for easy access anywhere.</p>
            <button className="w-full py-3 bg-[#E13D4B] text-white font-black rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#c93542] transition-all">
              Download Plan <ArrowRight size={14} />
            </button>
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-50 p-6">
             <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <Info size={16} />
              </div>
              <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Coaching Notes</h4>
             </div>
             <ul className="space-y-3">
               {[
                 "Drink at least 4L of water daily.",
                 "Avoid salt after 8:30 PM.",
                 "Prioritize sleep for muscle recovery.",
                 "Chew slowly and mindfully."
               ].map((note, i) => (
                 <li key={i} className="flex gap-3 text-xs font-medium text-gray-500 leading-relaxed">
                   <div className="w-1 h-1 bg-[#E13D4B] rounded-full mt-1.5 shrink-0" />
                   {note}
                 </li>
               ))}
             </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
