import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Hash,
  Clock,
  Heart,
  ShieldAlert,
  Dumbbell,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { addMonths, addDays, format, parseISO, isValid } from 'date-fns';
import { cn } from '../../lib/utils';

interface MemberFormProps {
  mode: 'add' | 'edit';
}

export default function MemberForm({ mode }: MemberFormProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { gym } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(mode === 'edit');
  
  const [batches, setBatches] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    // Registration
    member_id: '',
    batch_id: '',
    joining_date: new Date().toISOString().split('T')[0],
    
    // Personal
    name: '',
    phone: '',
    email: '',
    gender: 'Male',
    date_of_birth: '',
    
    // Documents
    aadhar_number: '',
    pan_number: '',
    address: '',
    password: '',
    
    // Health (Optional)
    blood_group: '',
    fitness_goal: '',
    medical_condition: '',
    
    // Emergency (Optional)
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    
    status: 'Active'
  });

  // Membership initialization (only for Add mode)
  const [membershipData, setMembershipData] = useState({
    plan_id: '',
    plan_amount: 0,
    discount_type: 'None', // None, Percent, Amount
    discount_value: 0,
    paid_amount: 0,
    due_amount: 0,
    start_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    trainer_id: ''
  });

  useEffect(() => {
    if (gym?.id) {
       fetchMeta();
    }
    if (mode === 'edit' && id) {
      fetchMemberDetails();
    } else {
      generateMemberId();
      if (location.state?.prefill) {
        setFormData(prev => ({
          ...prev,
          ...location.state.prefill
        }));
      }
    }
  }, [id, mode, location.state, gym?.id]);

  async function fetchMeta() {
    if (!gym?.id) return;
    const [bRes, pRes, tRes] = await Promise.all([
      supabase.from('batches').select('*').eq('gym_id', gym.id),
      supabase.from('plans').select('*').eq('gym_id', gym.id).eq('is_active', true),
      supabase.from('trainers').select('*').eq('gym_id', gym.id).eq('status', 'Active')
    ]);
    setBatches(bRes.data || []);
    setPlans(pRes.data || []);
    setTrainers(tRes.data || []);
  }

  async function generateMemberId() {
    if (!gym?.id) return;
    try {
      const { count } = await supabase
        .from('members')
        .select('id', { count: 'exact', head: true })
        .eq('gym_id', gym.id);
      
      const nextId = (count || 0) + 1;
      const formattedId = `MEM${nextId.toString().padStart(3, '0')}`;
      setFormData(prev => ({ ...prev, member_id: formattedId }));
    } catch (err) {
      console.error('Error generating ID:', err);
    }
  }

  async function fetchMemberDetails() {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*, member_plans(*)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      if (data) {
        setFormData({
          member_id: data.member_id || '',
          batch_id: data.batch_id || '',
          joining_date: data.joining_date || '',
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          gender: data.gender || 'Male',
          date_of_birth: data.date_of_birth || '',
          aadhar_number: data.aadhar_number || '',
          pan_number: data.pan_number || '',
          address: data.address || '',
          blood_group: data.blood_group || '',
          fitness_goal: data.fitness_goal || '',
          medical_condition: data.medical_condition || '',
          emergency_contact_name: data.emergency_contact_name || '',
          emergency_contact_phone: data.emergency_contact_phone || '',
          emergency_contact_relation: data.emergency_contact_relation || '',
          status: data.status || 'Active'
        });

        // Find active plan if exists
        const activePlan = (data.member_plans || []).find((p: any) => p.status === 'Active');
        if (activePlan) {
          setMembershipData({
            plan_id: activePlan.plan_id,
            plan_amount: activePlan.amount,
            discount_type: activePlan.discount_type || 'None',
            discount_value: activePlan.discount_value || 0,
            paid_amount: activePlan.paid_amount || 0,
            due_amount: activePlan.due_amount || 0,
            start_date: activePlan.start_date,
            expiry_date: activePlan.expiry_date,
            trainer_id: activePlan.trainer_id || ''
          });
        }
      }
    } catch (error: any) {
      toast.error(error.message);
      navigate('/members');
    } finally {
      setFetching(false);
    }
  }

  // Handle Plan Change
  const handlePlanChange = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      const start = parseISO(membershipData.start_date);
      if (!isValid(start)) return;
      
      let expiry = '';
      if (plan.duration_type === 'Months') {
        const expiryDate = addMonths(start, plan.duration);
        expiry = isValid(expiryDate) ? format(expiryDate, 'yyyy-MM-dd') : '';
      } else {
        const expiryDate = addDays(start, plan.duration);
        expiry = isValid(expiryDate) ? format(expiryDate, 'yyyy-MM-dd') : '';
      }

      setMembershipData(prev => ({
        ...prev,
        plan_id: planId,
        plan_amount: plan.amount,
        paid_amount: plan.amount,
        expiry_date: expiry,
        due_amount: 0
      }));
    } else {
       setMembershipData(prev => ({
        ...prev,
        plan_id: '',
        plan_amount: 0,
        paid_amount: 0,
        expiry_date: '',
        due_amount: 0
      }));
    }
  };

  // Recalculate Due and Expiry
  useEffect(() => {
    if (!membershipData.plan_id) return;

    const plan = plans.find(p => p.id === membershipData.plan_id);
    if (!plan) return;

    // Recalculate Expiry if start date changes
    const start = parseISO(membershipData.start_date);
    if (!isValid(start)) return;
    
    let expiry = '';
    if (plan.duration_type === 'Months') {
      const expiryDate = addMonths(start, plan.duration);
      expiry = isValid(expiryDate) ? format(expiryDate, 'yyyy-MM-dd') : '';
    } else {
      const expiryDate = addDays(start, plan.duration);
      expiry = isValid(expiryDate) ? format(expiryDate, 'yyyy-MM-dd') : '';
    }

    // Recalculate Due
    let total = membershipData.plan_amount;
    if (membershipData.discount_type === 'Percent') {
      total = total - (total * (membershipData.discount_value / 100));
    } else if (membershipData.discount_type === 'Amount') {
      total = total - membershipData.discount_value;
    }
    const due = Math.max(0, total - membershipData.paid_amount);

    setMembershipData(prev => ({
      ...prev,
      expiry_date: expiry,
      due_amount: due
    }));
  }, [
    membershipData.plan_id, 
    membershipData.start_date, 
    membershipData.discount_type, 
    membershipData.discount_value, 
    membershipData.paid_amount
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym?.id) return;
    setLoading(true);

    try {
        if (mode === 'add') {
          const email = formData.email || `${formData.phone}@meragym.com`;
          const password = formData.password || Math.random().toString(36).slice(-8);

          // 1. Create Auth Account
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password
          });

          if (authError && authError.message !== 'User already registered') throw authError;

          // 2. Create Member
          const { data: member, error: memberError } = await supabase
            .from('members')
            .insert([{ ...formData, email, gym_id: gym.id }])
            .select()
            .single();
        
          if (memberError) throw memberError;

          // 3. Create User Profile for Login (with the correct ID from auth)
          if (member) {
            const { error: userError } = await supabase
              .from('users')
              .upsert({
                id: authData?.user?.id || member.id, // Use auth uid if available
                name: formData.name,
                phone: formData.phone,
                email: email,
                password: password,
                role: 'member',
                gym_id: gym.id,
                member_id: member.id,
                is_active: true
              });
            
            if (userError) throw userError;
          }

        // 3. Create Initial Plan if selected
        if (membershipData.plan_id && member) {
          const { error: planError } = await supabase
            .from('member_plans')
            .insert([{
              gym_id: gym.id,
              member_id: member.id,
              plan_id: membershipData.plan_id,
              trainer_id: membershipData.trainer_id || null,
              amount: membershipData.plan_amount,
              discount_type: membershipData.discount_type === 'None' ? null : membershipData.discount_type,
              discount_value: membershipData.discount_value,
              paid_amount: membershipData.paid_amount,
              due_amount: membershipData.due_amount,
              start_date: membershipData.start_date,
              expiry_date: membershipData.expiry_date,
              purchase_date: new Date().toISOString().split('T')[0],
              status: 'Active'
            }]);
          
          if (planError) throw planError;

          // 3. Create Payment record
          if (membershipData.paid_amount > 0) {
             await supabase.from('payments').insert([{
               gym_id: gym.id,
               member_id: member.id,
               amount: membershipData.paid_amount,
               payment_date: new Date().toISOString(),
               payment_mode: 'Cash',
               notes: 'Initial Plan Payment'
             }]);
          }
        }
        
        toast.success('Member added successfully!');
      } else {
        // 1. Update Member
        const { error } = await supabase
          .from('members')
          .update(formData)
          .eq('id', id);
        
        if (error) throw error;

        // 2. Update Active Plan if plan_id exists
        if (membershipData.plan_id) {
          // Find active plan first to update it
          const { data: currentPlans } = await supabase
            .from('member_plans')
            .select('id')
            .eq('member_id', id)
            .eq('status', 'Active');
          
          if (currentPlans && currentPlans.length > 0) {
            const activePlanId = currentPlans[0].id;
            const { error: planUpdateError } = await supabase
              .from('member_plans')
              .update({
                plan_id: membershipData.plan_id,
                trainer_id: membershipData.trainer_id || null,
                amount: membershipData.plan_amount,
                discount_type: membershipData.discount_type === 'None' ? null : membershipData.discount_type,
                discount_value: membershipData.discount_value,
                paid_amount: membershipData.paid_amount,
                due_amount: membershipData.due_amount,
                start_date: membershipData.start_date,
                expiry_date: membershipData.expiry_date
              })
              .eq('id', activePlanId);
            
            if (planUpdateError) throw planUpdateError;
          } else if (mode === 'edit') {
            // If no active plan exists but one is being selected now
             await supabase
              .from('member_plans')
              .insert([{
                gym_id: gym.id,
                member_id: id,
                plan_id: membershipData.plan_id,
                trainer_id: membershipData.trainer_id || null,
                amount: membershipData.plan_amount,
                discount_type: membershipData.discount_type === 'None' ? null : membershipData.discount_type,
                discount_value: membershipData.discount_value,
                paid_amount: membershipData.paid_amount,
                due_amount: membershipData.due_amount,
                start_date: membershipData.start_date,
                expiry_date: membershipData.expiry_date,
                purchase_date: new Date().toISOString().split('T')[0],
                status: 'Active'
              }]);
          }
        }

        toast.success('Member updated successfully!');
      }
      navigate('/members');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin text-[#141414]" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to="/members"
            className="p-2 border-2 border-[#141414] hover:bg-white transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] active:translate-x-0.5 active:translate-y-0.5"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">
              {mode === 'add' ? 'Add New Member' : 'Edit Member'}
            </h1>
            <p className="text-xs font-bold uppercase opacity-40 tracking-widest">
              Registration Portal • {formData.member_id || 'Generating ID...'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="bg-white border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] divide-y-4 divide-[#141414]">
          
          {/* REGISTRATION */}
          <div className="p-8 bg-[#f5f5f5]/50 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <Hash size={16} /> Registration Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Member ID</label>
                <input
                  disabled
                  value={formData.member_id}
                  className="w-full px-4 py-3 bg-white border-2 border-[#141414] text-sm font-bold opacity-50 outline-none"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Preferred Batch</label>
                  <button type="button" onClick={() => navigate('/settings/batches')} className="text-[9px] font-black text-[#E13D4B] uppercase tracking-widest hover:underline">+ Batch</button>
                </div>
                <select
                  required
                  name="batch_id"
                  value={formData.batch_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border-2 border-[#141414] text-sm font-bold focus:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] transition-all outline-none"
                >
                  <option value="">Select Batch</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.batch_name} ({b.start_time} - {b.end_time})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Joining Date</label>
                <input
                  required
                  type="date"
                  name="joining_date"
                  value={formData.joining_date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white border-2 border-[#141414] text-sm font-bold outline-none"
                />
              </div>
            </div>
          </div>

          {/* PERSONAL */}
          <div className="p-8 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <User size={16} /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Full Name *</label>
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#f5f5f5] border-2 border-[#141414] text-sm font-bold focus:bg-white transition-all outline-none"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Mobile Number *</label>
                <input
                  required
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#f5f5f5] border-2 border-[#141414] text-sm font-bold focus:bg-white transition-all outline-none"
                  placeholder="10 digit number"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Email Address (Login ID) *</label>
                <input
                  required
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#f5f5f5] border-2 border-[#141414] text-sm font-bold focus:bg-white transition-all outline-none"
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Login Password *</label>
                <input
                  required
                  name="password"
                  type="text"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#f5f5f5] border-2 border-[#141414] text-sm font-bold focus:bg-white transition-all outline-none"
                  placeholder="Create a password"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Gender</label>
                <div className="flex gap-4 pt-2">
                  {['Male', 'Female', 'Other'].map(g => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="gender" 
                        value={g} 
                        checked={formData.gender === g}
                        onChange={handleChange}
                        className="w-4 h-4 accent-[#141414]"
                      />
                      <span className="text-xs font-bold uppercase group-hover:opacity-100 opacity-60 transition-opacity">{g}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#f5f5f5] border-2 border-[#141414] text-sm font-bold outline-none"
                />
              </div>
            </div>
          </div>

          {/* DOCUMENTS */}
          <div className="p-8 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <CreditCard size={16} /> Identity Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Aadhar Number *</label>
                <input
                  required
                  name="aadhar_number"
                  value={formData.aadhar_number}
                  onChange={handleChange}
                  maxLength={12}
                  className="w-full px-4 py-3 bg-[#f5f5f5] border-2 border-[#141414] text-sm font-bold outline-none"
                  placeholder="1234 5678 9012"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">PAN Card Number</label>
                <input
                  name="pan_number"
                  value={formData.pan_number}
                  onChange={handleChange}
                  maxLength={10}
                  className="w-full px-4 py-3 bg-[#f5f5f5] border-2 border-[#141414] text-sm font-bold outline-none uppercase"
                  placeholder="ABCDE1234F"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Residential Address *</label>
                <textarea
                  required
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#f5f5f5] border-2 border-[#141414] text-sm font-bold outline-none resize-none"
                  placeholder="House No, Area, City, PIN"
                />
              </div>
            </div>
          </div>

          {/* MEMBERSHIP */}
          <div className="p-8 bg-black/5 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <Dumbbell size={16} /> {mode === 'add' ? 'Starting Membership' : 'Current Membership'}
            </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Select Plan</label>
                    <button type="button" onClick={() => navigate('/settings/plans')} className="text-[9px] font-black text-[#E13D4B] uppercase tracking-widest hover:underline">+ Plan</button>
                  </div>
                  <select
                    value={membershipData.plan_id}
                    onChange={(e) => handlePlanChange(e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-[#141414] text-sm font-bold outline-none"
                  >
                    <option value="">Choose a Plan</option>
                    {plans.map(p => <option key={p.id} value={p.id}>{p.plan_name} (₹{p.amount})</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Assign Trainer (Optional)</label>
                  <select
                    value={membershipData.trainer_id}
                    onChange={(e) => setMembershipData(prev => ({ ...prev, trainer_id: e.target.value }))}
                    className="w-full px-4 py-3 bg-white border-2 border-[#141414] text-sm font-bold outline-none"
                  >
                    <option value="">No Personal Trainer</option>
                    {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              {membershipData.plan_id && (
                <div className="space-y-4 animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Start Date</label>
                        <input
                          type="date"
                          value={membershipData.start_date}
                          onChange={(e) => setMembershipData(prev => ({ ...prev, start_date: e.target.value }))}
                          className="w-full px-4 py-3 bg-white border-2 border-[#141414] text-sm font-bold outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-30">Expiry Date</label>
                        <div className="w-full px-4 py-3 bg-gray-100 border-2 border-[#141414] text-sm font-bold opacity-40">
                          {membershipData.expiry_date || 'Calculated automatically'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Discount Type</label>
                        <div className="flex bg-white border-2 border-[#141414]">
                          {['None', 'Amount', 'Percent'].map(t => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setMembershipData(prev => ({ ...prev, discount_type: t, discount_value: 0 }))}
                              className={`flex-1 py-3 text-[10px] font-black uppercase ${membershipData.discount_type === t ? 'bg-[#141414] text-white' : 'hover:bg-gray-100'}`}
                            >{t}</button>
                          ))}
                        </div>
                      </div>
                      {membershipData.discount_type !== 'None' && (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Discount Value</label>
                          <input
                            type="number"
                            value={membershipData.discount_value}
                            onChange={(e) => setMembershipData(prev => ({ ...prev, discount_value: parseFloat(e.target.value) || 0 }))}
                            className="w-full px-4 py-3 bg-white border-2 border-[#141414] text-sm font-bold outline-none"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Net Payable Amount</label>
                        <div className="w-full px-4 py-3 bg-[#E13D4B]/5 border-2 border-[#E13D4B] text-lg font-black text-[#E13D4B]">
                          ₹{(() => {
                            let total = membershipData.plan_amount;
                            if (membershipData.discount_type === 'Percent') total *= (1 - membershipData.discount_value / 100);
                            else if (membershipData.discount_type === 'Amount') total -= membershipData.discount_value;
                            return Math.max(0, total);
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#E13D4B]">Enter Paid Amount (₹) *</label>
                        <input
                          required
                          type="number"
                          value={membershipData.paid_amount}
                          onChange={(e) => setMembershipData(prev => ({ ...prev, paid_amount: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-4 py-3 bg-white border-2 border-[#141414] text-sm font-black outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Unpaid/Due Amount (₹)</label>
                        <div className="w-full px-4 py-3 bg-rose-50 border-2 border-rose-500 text-sm font-black text-rose-600">
                          ₹{membershipData.due_amount}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-30">Remaining Status</label>
                        <div className={cn(
                          "w-full px-4 py-3 border-2 text-[10px] font-black uppercase tracking-widest",
                          membershipData.due_amount > 0 ? 'bg-red-50 text-red-600 border-red-600' : 'bg-green-50 text-green-600 border-green-600'
                        )}>
                          {membershipData.due_amount > 0 ? 'Dues Pending' : 'Fully Paid'}
                        </div>
                      </div>
                    </div>
                  </div>
           )}
            </div>

          {/* HEALTH (OPTIONAL) */}
          <div className="p-8 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <Heart size={16} /> Health Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Blood Group</label>
                <select 
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#f5f5f5] border-2 border-[#141414] text-sm font-bold outline-none"
                >
                  <option value="">Select</option>
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Fitness Goal</label>
                <select 
                  name="fitness_goal"
                  value={formData.fitness_goal}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#f5f5f5] border-2 border-[#141414] text-sm font-bold outline-none"
                >
                  <option value="">Select Goal</option>
                  {['Weight Loss', 'Weight Gain', 'Muscle Building', 'General Fitness', 'Endurance'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Medical Condition</label>
                <input
                  name="medical_condition"
                  value={formData.medical_condition}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#f5f5f5] border-2 border-[#141414] text-sm font-bold outline-none"
                  placeholder="None / Asthama etc."
                />
              </div>
            </div>
          </div>

          {/* EMERGENCY (OPTIONAL) */}
          <div className="p-8 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2 flex items-center gap-2">
              <ShieldAlert size={16} /> Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Contact Name</label>
                <input
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#f5f5f5] border-2 border-[#141414] text-sm font-bold outline-none"
                />
              </div>
               <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Contact Mobile</label>
                <input
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#f5f5f5] border-2 border-[#141414] text-sm font-bold outline-none"
                />
              </div>
               <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Relationship</label>
                <input
                  name="emergency_contact_relation"
                  value={formData.emergency_contact_relation}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#f5f5f5] border-2 border-[#141414] text-sm font-bold outline-none"
                  placeholder="Parent / Spouse"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
           <button
            type="button"
            onClick={() => navigate('/members')}
            className="px-12 py-4 border-4 border-[#141414] text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-3 px-12 py-4 bg-[#141414] text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-[#141414] border-4 border-[#141414] transition-all shadow-[8px_8px_0px_0px_rgba(20,20,20,0.3)] active:shadow-none active:translate-x-2 active:translate-y-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {mode === 'add' ? 'Confirm Registration' : 'Save Update'}
          </button>
        </div>
      </form>
    </div>
  );
}
