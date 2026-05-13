import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Camera, 
  Loader2,
  Lock,
  History
} from 'lucide-react';
import { toast } from 'sonner';
import bcrypt from 'bcryptjs';

export default function StaffProfile() {
  const { staff, gym, isOwner, user, refreshAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: staff?.name || gym?.name || '',
    phone: staff?.phone || gym?.phone || '',
    profile_picture: staff?.profile_picture || gym?.logo_url || ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (staff) {
        const { error } = await supabase
          .from('staff')
          .update({
            name: formData.name,
            phone: formData.phone,
            profile_picture: formData.profile_picture
          })
          .eq('id', staff.id);
        if (error) throw error;
      } else if (isOwner && gym) {
        const { error } = await supabase
          .from('gyms')
          .update({
            name: formData.name,
            phone: formData.phone,
            logo_url: formData.profile_picture
          })
          .eq('id', gym.id);
        if (error) throw error;
      }
      toast.success('Profile updated');
      refreshAuth();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New passwords do not match');
    }

    try {
      setLoading(true);
      
      // If it's a Supabase Auth user (Owner usually), use built-in update
      if (isOwner) {
        const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
        if (error) throw error;
      } else {
        // Staff - might need custom verification if using bcrypt
        // But since we use Supabase Auth for identity, we should still use auth.updateUser
        const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
        if (error) throw error;
        
        // Also update staff hash if we want to keep it in sync (redundant if using Supabase Auth)
        const hashedPassword = await bcrypt.hash(passwordData.newPassword, 10);
        await supabase.from('staff').update({ password_hash: hashedPassword }).eq('id', staff.id);
      }
      
      toast.success('Password changed successfully');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !gym) return;

    try {
      setLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `profiles/${gym.id}/${fileName}`;

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

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">My Account</h1>
          <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Manage your profile and security</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-8">
          <div className="bg-white border-4 border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] text-center space-y-6">
            <div className="relative w-32 h-32 mx-auto">
              <div className="w-full h-full border-4 border-[#141414] overflow-hidden bg-[#f5f5f5]">
                {formData.profile_picture ? (
                  <img src={formData.profile_picture} alt="Avatar" className="w-full h-full object-cover" />
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
              <h2 className="text-xl font-black uppercase tracking-tight">{formData.name}</h2>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">
                {isOwner ? 'Gym Owner' : staff?.roles?.name}
              </p>
            </div>
            <div className="pt-4 border-t-2 border-[#f0f0f0]">
               <div className="flex items-center gap-3 text-xs font-bold opacity-60">
                 <Mail size={14} /> {user?.email}
               </div>
            </div>
          </div>

          <div className="bg-[#141414] text-white border-4 border-[#141414] p-6 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
            <h3 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <Shield size={14} /> System Info
            </h3>
            <div className="space-y-4">
               <div>
                  <p className="text-[8px] uppercase opacity-40">Gym ID</p>
                  <p className="font-mono text-[10px] font-bold">{gym?.id}</p>
               </div>
               <div>
                  <p className="text-[8px] uppercase opacity-40">Member Since</p>
                  <p className="text-xs font-bold">{staff?.created_at ? new Date(staff.created_at).toLocaleDateString() : 'N/A'}</p>
               </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
           <form onSubmit={handleUpdateProfile} className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest border-b-2 border-[#f0f0f0] pb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest">Full Name</label>
                  <input 
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-bold outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest">Phone Number</label>
                  <input 
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                    className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-bold outline-none"
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-[#141414] text-white border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Update Profile'}
              </button>
           </form>

           <form onSubmit={handleChangePassword} className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest border-b-2 border-[#f0f0f0] pb-4 flex items-center gap-2">
                <Lock size={16} /> Change Password
              </h3>
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest">New Password</label>
                    <input 
                      required
                      type="password"
                      value={passwordData.newPassword}
                      onChange={e => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                      className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-bold outline-none"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest">Confirm New Password</label>
                    <input 
                      required
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={e => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                      className="w-full bg-[#f5f5f5] border-4 border-[#141414] p-4 font-bold outline-none"
                    />
                 </div>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="px-8 py-4 bg-[#141414] text-white border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Change Password'}
              </button>
           </form>
        </div>
      </div>
    </div>
  );
}
