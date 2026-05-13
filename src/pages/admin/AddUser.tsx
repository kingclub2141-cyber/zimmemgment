import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Shield, 
  User as UserIcon, 
  Phone, 
  Mail, 
  Key, 
  Building2, 
  ChevronRight, 
  CheckCircle2, 
  Loader2,
  Lock,
  ArrowRight,
  Info,
  CreditCard,
  Calendar,
  MapPin,
  Stethoscope,
  Briefcase,
  Dumbbell
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Create a separate client for signup to avoid logging out the admin
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || 'https://rtoscuhyfcsyuuoukrkw.supabase.co').trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_o4qVms-jOW4Te4294R_aZA_KLvgstEy').trim();
const authClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false }
});

import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type UserType = 'admin' | 'admin2' | 'staff' | 'trainer' | 'member';

export default function AddUser() {
  const { gym } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<UserType>('member');
  const [loading, setLoading] = useState(false);
  
  // Basic Info
  const [baseData, setBaseData] = useState({
    name: '',
    phone: '',
    email: '',
    password: Math.random().toString(36).slice(-8)
  });

  // Member Specific
  const [memberData, setMemberData] = useState({
    aadhar: '',
    pan: '',
    dob: '',
    gender: 'Male',
    address: '',
    plan_id: '',
    batch_id: '',
    paid_amount: '0',
    start_date: new Date().toISOString().split('T')[0]
  });

  // Trainer Specific
  const [trainerData, setTrainerData] = useState({
    monthly_amount: '',
    daily_amount: '',
    joining_date: new Date().toISOString().split('T')[0],
    address: '',
    specialization: ''
  });

  // Staff Specific
  const [staffData, setStaffData] = useState({
    role_name: 'Reception',
    permissions: [] as string[]
  });

  // Fetch plans and batches for member selection
  const [plans, setPlans] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);

  useEffect(() => {
    if (gym?.id) {
      fetchPlansAndBatches();
    }
  }, [gym]);

  const fetchPlansAndBatches = async () => {
    const [{ data: pData }, { data: bData }] = await Promise.all([
      supabase.from('plans').select('*').eq('gym_id', gym.id).eq('is_active', true),
      supabase.from('batches').select('*').eq('gym_id', gym.id).eq('is_active', true)
    ]);
    setPlans(pData || []);
    setBatches(bData || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseData.name || !baseData.phone) {
      toast.error('Name and Phone are required');
      return;
    }

    setLoading(true);
    try {
      const syntheticEmail = baseData.email || `${baseData.phone}@merazim.com`;

      // 1. Create Login Account in Supabase Auth
      const { data: authData, error: authError } = await authClient.auth.signUp({
        email: syntheticEmail,
        password: baseData.password,
      });

      if (authError && authError.message !== 'User already registered') throw authError;

      // 2. Create or Update in 'users' table
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .upsert({
          id: authData.user?.id,
          name: baseData.name,
          phone: baseData.phone,
          email: syntheticEmail,
          password: baseData.password,
          role: userType,
          gym_id: gym.id,
          is_active: true
        })
        .select()
        .single();

      if (userError) throw userError;

      // 2. Conditional insertions
      if (userType === 'member') {
        const { data: member, error: mError } = await supabase
          .from('members')
          .insert({
            gym_id: gym.id,
            name: baseData.name,
            phone: baseData.phone,
            email: syntheticEmail,
            gender: memberData.gender,
            date_of_birth: memberData.dob,
            aadhar_number: memberData.aadhar,
            pan_number: memberData.pan,
            address: memberData.address,
            batch_id: memberData.batch_id || null,
            joining_date: memberData.start_date,
            status: 'Active'
          })
          .select()
          .single();
        if (mError) throw mError;
        
        // Link member_id back to user
        await supabase.from('users').update({ member_id: member.id }).eq('id', newUser.id);

        // Add member plan if selected
        if (memberData.plan_id) {
          const selectedPlan = plans.find(p => p.id === memberData.plan_id);
          const expiryDate = new Date(memberData.start_date);
          // Simple expiry logic for now
          expiryDate.setMonth(expiryDate.getMonth() + (selectedPlan?.duration_value || 1));

          await supabase.from('member_plans').insert({
            member_id: member.id,
            plan_id: memberData.plan_id,
            purchase_date: new Date().toISOString().split('T')[0],
            start_date: memberData.start_date,
            expiry_date: expiryDate.toISOString().split('T')[0],
            amount: selectedPlan?.amount || 0,
            paid_amount: Number(memberData.paid_amount),
            due_amount: (selectedPlan?.amount || 0) - Number(memberData.paid_amount),
            status: 'Active'
          });
        }
      } else if (userType === 'trainer') {
        const { data: trainer, error: tError } = await supabase
          .from('trainers')
          .insert({
            gym_id: gym.id,
            name: baseData.name,
            phone: baseData.phone,
            address: trainerData.address,
            joining_date: trainerData.joining_date,
            monthly_amount: Number(trainerData.monthly_amount) || 0,
            daily_amount: Number(trainerData.daily_amount) || 0,
            status: 'Active'
          })
          .select()
          .single();
        if (tError) throw tError;
        await supabase.from('users').update({ trainer_id: trainer.id }).eq('id', newUser.id);
      } else if (userType === 'staff') {
         // Create role first or find existing
         const { data: staff, error: sError } = await supabase
           .from('staff')
           .insert({
             gym_id: gym.id,
             name: baseData.name,
             phone: baseData.phone,
             email: syntheticEmail,
             status: 'Active'
           })
           .select()
           .single();
         if (sError) throw sError;
         await supabase.from('users').update({ staff_id: staff.id }).eq('id', newUser.id);
      }

      toast.success(`${userType.toUpperCase()} user created successfully! Credentials sent.`);
      navigate('/staff'); // Or dashboard
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">ADD NEW USER</h1>
          <p className="text-gray-500 font-medium italic">Instantly create and grant access to team members or customers</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        {/* User Type Selection */}
        <div className="p-8 border-b border-gray-50 bg-gray-50/30">
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 pl-1 flex items-center gap-2">
            <Shield size={14} className="text-[#E13D4B]" /> 1. Select User Role
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {(['admin', 'admin2', 'staff', 'trainer', 'member'] as UserType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setUserType(type)}
                className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 flex flex-col items-center gap-3 ${
                  userType === type 
                    ? 'bg-gray-900 border-gray-900 text-white shadow-xl shadow-gray-200' 
                    : 'bg-white border-gray-100 text-gray-400 hover:border-rose-100 hover:text-rose-500'
                }`}
              >
                {type === 'member' && <UserIcon size={24} />}
                {type === 'trainer' && <Dumbbell size={24} />}
                {type === 'staff' && <Briefcase size={24} />}
                {type === 'admin2' && <Shield size={24} />}
                {type === 'admin' && <Lock size={24} />}
                <span>{type === 'admin2' ? 'Sub Admin' : type}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-12">
          {/* Section 1: Basic Login Details */}
          <section className="space-y-6">
            <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-6">
              <Key size={16} className="text-[#E13D4B]" /> {userType.toUpperCase()} LOGIN DETAILS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={baseData.name}
                    onChange={(e) => setBaseData({...baseData, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#E13D4B] focus:bg-white transition-all font-bold text-gray-700"
                    placeholder="Enter full name"
                  />
                  <UserIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Phone Number (LOGIN ID)</label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={baseData.phone}
                    onChange={(e) => setBaseData({...baseData, phone: e.target.value})}
                    className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#E13D4B] focus:bg-white transition-all font-bold text-gray-700"
                    placeholder="10-digit number"
                  />
                  <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] pl-1">Login Gmail / Email ID</label>
                <div className="relative">
                  <input
                    type="email"
                    value={baseData.email}
                    onChange={(e) => setBaseData({...baseData, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-3.5 bg-rose-50/30 border-2 border-rose-100/50 rounded-2xl outline-none focus:border-[#E13D4B] focus:bg-white transition-all font-bold text-gray-700"
                    placeholder="Enter login email/gmail"
                  />
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E13D4B]" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] pl-1">Assign Login Password</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={baseData.password}
                    onChange={(e) => setBaseData({...baseData, password: e.target.value})}
                    className="w-full pl-10 pr-24 py-3.5 bg-rose-50/30 border-2 border-rose-100/50 rounded-2xl outline-none focus:border-[#E13D4B] focus:bg-white transition-all font-black text-[#E13D4B] tracking-widest"
                    placeholder="Set password"
                  />
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E13D4B]" />
                  <button 
                    type="button"
                    onClick={() => setBaseData({...baseData, password: Math.random().toString(36).slice(-8)})}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 hover:text-[#E13D4B] uppercase tracking-widest"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Role Specific Details */}
          {userType === 'member' && (
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-6">
                <UserIcon size={16} className="text-[#E13D4B]" /> MEMBER PROFILE DETAILS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Aadhar Number (Required)</label>
                  <input
                    type="text"
                    required
                    maxLength={12}
                    value={memberData.aadhar}
                    onChange={(e) => setMemberData({...memberData, aadhar: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#E13D4B] focus:bg-white transition-all font-bold text-gray-700"
                    placeholder="1234 5678 9012"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">PAN Number (Optional)</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={memberData.pan}
                    onChange={(e) => setMemberData({...memberData, pan: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#E13D4B] focus:bg-white transition-all font-bold text-gray-700"
                    placeholder="ABCDE1234F"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Date of Birth</label>
                  <input
                    type="date"
                    value={memberData.dob}
                    onChange={(e) => setMemberData({...memberData, dob: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#E13D4B] focus:bg-white transition-all font-bold text-gray-700"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Gender</label>
                  <select
                    value={memberData.gender}
                    onChange={(e) => setMemberData({...memberData, gender: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#E13D4B] focus:bg-white transition-all font-bold text-gray-700"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Residential Address</label>
                  <input
                    type="text"
                    value={memberData.address}
                    onChange={(e) => setMemberData({...memberData, address: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#E13D4B] focus:bg-white transition-all font-bold text-gray-700"
                    placeholder="Enter full address"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Select Membership Plan</label>
                  <select
                    value={memberData.plan_id}
                    onChange={(e) => setMemberData({...memberData, plan_id: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#E13D4B] focus:bg-white transition-all font-bold text-gray-700"
                  >
                    <option value="">No Plan Selected</option>
                    {plans.map(p => <option key={p.id} value={p.id}>{p.plan_name} - ₹{p.amount}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Preferred Batch</label>
                  <select
                    value={memberData.batch_id}
                    onChange={(e) => setMemberData({...memberData, batch_id: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#E13D4B] focus:bg-white transition-all font-bold text-gray-700"
                  >
                    <option value="">No Batch Assigned</option>
                    {batches.map(b => <option key={b.id} value={b.id}>{b.batch_name} ({b.start_time})</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Paid Amount (₹)</label>
                  <input
                    type="number"
                    value={memberData.paid_amount}
                    onChange={(e) => setMemberData({...memberData, paid_amount: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#E13D4B] focus:bg-white transition-all font-bold text-gray-700 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Joining Date</label>
                  <input
                    type="date"
                    value={memberData.start_date}
                    onChange={(e) => setMemberData({...memberData, start_date: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#E13D4B] focus:bg-white transition-all font-bold text-gray-700"
                  />
                </div>
              </div>
            </section>
          )}

          {userType === 'trainer' && (
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-6">
                <Dumbbell size={16} className="text-[#E13D4B]" /> TRAINER PROFESSIONAL DETAILS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Monthly Fix Salary (₹)</label>
                  <input
                    type="number"
                    value={trainerData.monthly_amount}
                    onChange={(e) => setTrainerData({...trainerData, monthly_amount: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#E13D4B] focus:bg-white transition-all font-bold text-gray-700"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Daily Wage / PT Share (₹)</label>
                  <input
                    type="number"
                    value={trainerData.daily_amount}
                    onChange={(e) => setTrainerData({...trainerData, daily_amount: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#E13D4B] focus:bg-white transition-all font-bold text-gray-700"
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Joining Date</label>
                  <input
                    type="date"
                    value={trainerData.joining_date}
                    onChange={(e) => setTrainerData({...trainerData, joining_date: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#E13D4B] focus:bg-white transition-all font-bold text-gray-700"
                  />
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Area of Specialization</label>
                  <input
                    type="text"
                    value={trainerData.specialization}
                    onChange={(e) => setTrainerData({...trainerData, specialization: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#E13D4B] focus:bg-white transition-all font-bold text-gray-700"
                    placeholder="e.g. Bodybuilding, Yoga, Crossfit"
                  />
                </div>
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Permanent Address</label>
                  <input
                    type="text"
                    value={trainerData.address}
                    onChange={(e) => setTrainerData({...trainerData, address: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#E13D4B] focus:bg-white transition-all font-bold text-gray-700"
                    placeholder="Enter full address"
                  />
                </div>
              </div>
            </section>
          )}

          {userType === 'staff' && (
            <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-6">
                <Briefcase size={16} className="text-[#E13D4B]" /> STAFF ROLE & PERMISSIONS
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Operational Role</label>
                  <select
                    value={staffData.role_name}
                    onChange={(e) => setStaffData({...staffData, role_name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#E13D4B] focus:bg-white transition-all font-bold text-gray-700"
                  >
                    <option>Reception</option>
                    <option>Accountant</option>
                    <option>Store Manager</option>
                    <option>Cleaner</option>
                  </select>
                </div>
              </div>
              <div className="bg-blue-50 p-6 rounded-3xl flex gap-4 border border-blue-100">
                 <Info className="text-blue-500 shrink-0" size={20} />
                 <p className="text-xs text-blue-700 font-medium leading-relaxed">
                   Permission tuning for staff can be managed from the **Roles & Permissions** section after the user is created. 
                   By default, they will have access based on their selected role.
                 </p>
              </div>
            </section>
          )}

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="bg-amber-50 px-6 py-4 rounded-2xl border border-amber-100 flex items-center gap-3">
               <Info className="text-amber-500" size={18} />
               <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wide">User will receive login credentials via SMS</p>
             </div>
             <div className="flex gap-4 w-full md:w-auto">
               <button
                 type="button"
                 onClick={() => navigate(-1)}
                 className="flex-1 md:flex-none px-8 py-4 bg-gray-100 text-gray-600 font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-gray-200 transition-all"
               >
                 Cancel
               </button>
               <button
                type="submit"
                disabled={loading}
                className="flex-1 md:flex-none px-12 py-4 bg-[#E13D4B] text-white font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-rose-100 group"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Create {userType} User <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
              </button>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
}
