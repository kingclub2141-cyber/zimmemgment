import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  Lock,
  Mail,
  Phone,
  User,
  Camera,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import bcrypt from 'bcryptjs';

export default function StaffForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { gym } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(id ? true : false);
  const [showPassword, setShowPassword] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role_id: '',
    status: 'Active',
    password: '',
    confirm_password: '',
    profile_picture: ''
  });

  useEffect(() => {
    if (gym) fetchRoles();
  }, [gym]);

  const fetchRoles = async () => {
    const { data } = await supabase.from('roles').select('id, name').eq('gym_id', gym.id);
    setRoles(data || []);
    if (id) fetchStaff();
  };

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase.from('staff').select('*').eq('id', id).single();
      if (error) throw error;
      setFormData({
        ...formData,
        name: data.name,
        email: data.email,
        phone: data.phone,
        role_id: data.role_id,
        status: data.status,
        profile_picture: data.profile_picture || ''
      });
    } catch (error: any) {
      toast.error(error.message);
      navigate('/staff');
    } finally {
      setFetching(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !gym) return;

    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `staff/${gym.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, profile_picture: publicUrl }));
      toast.success('Picture uploaded');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym) return;

    if (formData.password !== formData.confirm_password) {
      return toast.error('Passwords do not match');
    }

    if (!id && formData.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    try {
      setLoading(true);
      
      let hashedPassword = undefined;
      if (formData.password) {
        hashedPassword = await bcrypt.hash(formData.password, 10);
      }

      const payload: any = {
        gym_id: gym.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role_id: formData.role_id,
        status: formData.status,
        profile_picture: formData.profile_picture
      };

      if (hashedPassword) {
        payload.password_hash = hashedPassword;
      }

      if (id) {
        const { error } = await supabase.from('staff').update(payload).eq('id', id);
        if (error) throw error;
        toast.success('Staff profile updated');
      } else {
        const { error } = await supabase.from('staff').insert([payload]);
        if (error) throw error;
        toast.success('Staff onboarded successfully');
      }
      navigate('/staff');
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
        <button onClick={() => navigate('/staff')} className="p-3 border-4 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">{id ? 'Mod Staff' : 'Add Staff'}</h1>
          <p className="text-xs font-black uppercase tracking-widest opacity-40">Assemble your team</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-8">
           <div className="bg-white border-4 border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] text-center space-y-6">
              <div className="relative w-32 h-32 mx-auto">
                 <div className="w-full h-full border-4 border-[#141414] overflow-hidden bg-[#f5f5f5]">
                    {formData.profile_picture ? (
                      <img src={formData.profile_picture} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-20">
                        <User size={64} />
                      </div>
                    )}
                 </div>
                 <label className="absolute -bottom-2 -right-2 p-2 bg-[#141414] text-white cursor-pointer hover:bg-white hover:text-[#141414] transition-all border-2 border-[#141414]">
                    <Camera size={16} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                 </label>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Staff Avatar</p>
                <p className="text-xs font-bold leading-relaxed mt-2 italic px-4">Upload professional photo for ID cards and portal.</p>
              </div>
           </div>

           <div className="bg-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest">Account Status</label>
              <div className="flex gap-2">
                {['Active', 'Inactive'].map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData(f => ({ ...f, status: s }))}
                    className={`flex-1 py-3 font-black uppercase tracking-widest text-[10px] border-4 border-[#141414] transition-all ${
                      formData.status === s ? 'bg-[#141414] text-white' : 'bg-white'
                    }`}
                  >{s}</button>
                ))}
              </div>
           </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          <div className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest border-b-2 border-[#f0f0f0] pb-4">Personal Details</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest">Full Legal Name</label>
                <input 
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-black outline-none"
                  placeholder="e.g. Johnathan Wick" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
                    <input 
                      required
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                      className="w-full bg-[#f5f5f5] border-4 border-[#141414] pl-12 pr-4 py-4 font-bold outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={20} />
                    <input 
                      required
                      type="text"
                      value={formData.phone}
                      onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                      className="w-full bg-[#f5f5f5] border-4 border-[#141414] pl-12 pr-4 py-4 font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest">Assigned Role</label>
                <select 
                  required
                  value={formData.role_id}
                  onChange={e => setFormData(f => ({ ...f, role_id: e.target.value }))}
                  className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-black outline-none"
                >
                  <option value="">SELECT ACCESS ROLE</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest border-b-2 border-[#f0f0f0] pb-4">Security Credentials</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    required={!id}
                    value={formData.password}
                    onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
                    className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-bold outline-none"
                    placeholder={id ? "Leave blank to keep" : "Minimum 6 chars"}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest">Confirm Password</label>
                <input 
                  type={showPassword ? "text" : "password"}
                  required={!id}
                  value={formData.confirm_password}
                  onChange={e => setFormData(f => ({ ...f, confirm_password: e.target.value }))}
                  className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-bold outline-none"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-[#141414] text-white border-4 border-[#141414] font-black uppercase tracking-[0.4em] text-sm hover:bg-white hover:text-[#141414] transition-all flex items-center justify-center gap-3 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] active:shadow-none translate-y-0 active:translate-y-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Deploy Staff Member</>}
          </button>
        </div>
      </form>
    </div>
  );
}
