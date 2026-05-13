import React, { useState, useEffect } from 'react';
import { Apple, Clock, Flame, Info, CheckCircle2, Trophy, ArrowRight, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'motion/react';

export default function MemberDietPlans() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState(new Date().getDay() || 7);
  const [dietPlans, setDietPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.member_id) {
      fetchDiet();
    }
  }, [profile]);

  const fetchDiet = async () => {
    try {
      const { data } = await supabase
        .from('diet_plans')
        .select('*')
        .eq('member_id', profile.member_id)
        .order('day_number', { ascending: true });
      
      setDietPlans(data || []);
    } catch (error) {
      console.error('Error fetching diet:', error);
    } finally {
      setLoading(false);
    }
  };

  const days = [
    { num: 1, name: 'Monday' },
    { num: 2, name: 'Tuesday' },
    { num: 3, name: 'Wednesday' },
    { num: 4, name: 'Thursday' },
    { num: 5, name: 'Friday' },
    { num: 6, name: 'Saturday' },
    { num: 7, name: 'Sunday' }
  ];

  const currentPlan = dietPlans.find(d => d.day_number === activeTab);

  if (loading) return <div className="flex items-center justify-center h-64"><Clock className="animate-spin text-[#E13D4B]" /></div>;

  return (
    <div className="space-y-8">
      <div className="bg-[#141414] p-10 -mx-8 -mt-8 text-white">
        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Fuel Strategy</h1>
        <p className="text-rose-500 font-black uppercase tracking-widest text-[10px] mt-2">Personalized 7-Day Nutrition Protocol</p>
      </div>

      {/* Day Selector */}
      <div className="flex flex-wrap gap-2 mb-8">
        {days.map((day) => (
          <button
            key={day.num}
            onClick={() => setActiveTab(day.num)}
            className={`px-6 py-3 border-2 border-[#141414] text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === day.num 
                ? 'bg-[#141414] text-white shadow-[4px_4px_0px_0px_rgba(225,61,75,1)]' 
                : 'bg-white text-[#141414] hover:bg-gray-50'
            }`}
          >
            {day.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Meals View */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] overflow-hidden">
            <div className="p-6 border-b-4 border-[#141414] bg-[#fdfdfd] flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Apple size={18} className="text-green-500" /> {days.find(d => d.num === activeTab)?.name}'s Meals
              </h2>
              {currentPlan && (
                <div className="flex items-center gap-2 text-rose-500">
                  <Flame size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{currentPlan.total_calories || '--'} Kcal</span>
                </div>
              )}
            </div>
            
            {currentPlan ? (
              <div className="divide-y-2 divide-[#141414]">
                {[
                  { title: 'Breakfast', menu: currentPlan.breakfast, time: '08:30 AM' },
                  { title: 'Lunch', menu: currentPlan.lunch, time: '01:30 PM' },
                  { title: 'Evening Snacks', menu: currentPlan.snacks, time: '05:30 PM' },
                  { title: 'Dinner', menu: currentPlan.dinner, time: '09:00 PM' }
                ].map((meal, idx) => (
                  <div key={idx} className="p-8 flex gap-8 group hover:bg-rose-50 transition-colors">
                    <div className="w-24 shrink-0">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{meal.time}</p>
                      <h4 className="text-xs font-black uppercase tracking-tighter group-hover:text-[#E13D4B] transition-colors">{meal.title}</h4>
                    </div>
                    <div className="flex-1 flex items-start gap-4">
                      <div className="w-1 self-stretch bg-[#141414] opacity-10 group-hover:opacity-100 transition-all rounded-full" />
                      <p className="text-sm font-bold text-gray-700 leading-relaxed py-1">{meal.menu || 'Not specified for today.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-20 text-center">
                 <div className="w-16 h-16 bg-gray-50 border-2 border-dashed border-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Apple size={24} className="opacity-20" />
                 </div>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No diet plan uploaded for this day</p>
              </div>
            )}
          </div>
        </div>

        {/* Support Info */}
        <div className="space-y-6">
          <div className="bg-[#141414] text-white p-8 border-4 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
             <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 text-rose-500">Coach Guidance</h3>
             <ul className="space-y-4">
                {[
                  "Stay hydrated throughout the day.",
                  "Avoid processed sugars entirely.",
                  "Try to have dinner 2 hours before bed.",
                  "Include fiber in every major meal."
                ].map((tip, i) => (
                  <li key={i} className="flex gap-3 text-xs font-bold leading-relaxed group">
                    <div className="w-4 h-4 rounded bg-[#E13D4B] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                      <CheckCircle2 size={10} className="text-white" />
                    </div>
                    <span className="opacity-70 group-hover:opacity-100 transition-opacity">{tip}</span>
                  </li>
                ))}
             </ul>
          </div>

          <div className="bg-white border-4 border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
             <h3 className="text-sm font-black uppercase tracking-widest mb-4">Macros Overview</h3>
             {currentPlan ? (
                <div className="space-y-4">
                   <div>
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                        <span className="text-blue-500">Protein</span>
                        <span>{currentPlan.protein || '--'}g</span>
                     </div>
                     <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[60%]" />
                     </div>
                   </div>
                   <div>
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                        <span className="text-amber-500">Carbs</span>
                        <span>{currentPlan.carbs || '--'}g</span>
                     </div>
                     <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 w-[45%]" />
                     </div>
                   </div>
                   <div>
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                        <span className="text-rose-500">Fats</span>
                        <span>{currentPlan.fats || '--'}g</span>
                     </div>
                     <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 w-[30%]" />
                     </div>
                   </div>
                </div>
             ) : (
                <p className="text-[10px] font-bold text-gray-400 italic">No macro data available.</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
