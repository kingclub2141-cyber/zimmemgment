import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Calendar, Lock, Shield, Save, Loader2, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

export default function MemberProfile() {
  const { profile, refreshAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    address: profile?.members?.address || '',
    dob: profile?.members?.date_of_birth || '',
    gender: profile?.members?.gender || ''
  });

  const [passwords, setPasswords] = useState({
    old: '',
    new: '',
    confirm: ''
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error: userError } = await supabase
        .from('users')
        .update({
          name: formData.name,
          email: formData.email
        })
        .eq('id', profile.id);

      if (userError) throw userError;

      if (profile.member_id) {
        const { error: memberError } = await supabase
          .from('members')
          .update({
            name: formData.name,
            email: formData.email,
            address: formData.address,
            gender: formData.gender,
            date_of_birth: formData.dob
          })
          .eq('id', profile.member_id);
        
        if (memberError) throw memberError;
      }

      toast.success('Profile updated successfully');
      await refreshAuth();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return toast.error('Passwords do not match');
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });
      if (error) throw error;
      toast.success('Password updated successfully');
      setPasswords({ old: '', new: '', confirm: '' });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-50 overflow-hidden">
        <div className="h-32 bg-gray-900 relative">
          <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-2xl shadow-xl">
            <div className="w-24 h-24 bg-rose-50 rounded-xl flex items-center justify-center text-[#E13D4B] relative group">
              {profile?.profile_picture ? (
                <img src={profile.profile_picture} alt="" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <User size={40} />
              )}
              <button className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-all rounded-xl flex items-center justify-center">
                <Camera size={20} />
              </button>
            </div>
          </div>
        </div>
        <div className="pt-16 pb-8 px-8">
          <h1 className="text-2xl font-black text-gray-900">{profile?.name}</h1>
          <p className="text-[10px] font-black text-[#E13D4B] uppercase tracking-widest mt-1">Gym Member since {new Date(profile?.created_at).getFullYear()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Basic Info */}
        <div className="lg:col-span-2">
          <form onSubmit={handleUpdateProfile} className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-50 p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center text-[#E13D4B]">
                <Shield size={18} />
              </div>
              <h2 className="font-black text-sm uppercase tracking-widest">Personal Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-[#E13D4B] focus:bg-white transition-all font-bold text-gray-700"
                  />
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-[#E13D4B] focus:bg-white transition-all font-bold text-gray-700"
                  />
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    readOnly
                    value={formData.phone}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none opacity-60 font-bold text-gray-700 cursor-not-allowed"
                  />
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-[#E13D4B] focus:bg-white transition-all font-bold text-gray-700"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Address</label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-[#E13D4B] focus:bg-white transition-all font-bold text-gray-700 resize-none"
                  />
                  <MapPin size={16} className="absolute left-3.5 top-3 text-gray-400" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gray-900 text-white font-black rounded-xl text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Update Profile
            </button>
          </form>
        </div>

        {/* Password Info */}
        <div className="space-y-6">
          <form onSubmit={handleChangePassword} className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-50 p-8 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                <Lock size={18} />
              </div>
              <h2 className="font-black text-sm uppercase tracking-widest">Security</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">New Password</label>
                <input
                  type="password"
                  required
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-[#E13D4B] focus:bg-white transition-all font-bold text-gray-700"
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-[#E13D4B] focus:bg-white transition-all font-bold text-gray-700"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-rose-50 text-[#E13D4B] font-black rounded-xl text-xs uppercase tracking-widest hover:bg-rose-100 transition-all"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'Change Password'}
            </button>
          </form>

          {/* Verification Status */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-50 p-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Verification Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600">Identity (Aadhar)</span>
                <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full">Verified</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600">Email Address</span>
                <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full">Verified</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600">Phone Number</span>
                <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full">Verified</span>
              </div>
            </div>
          </div>

          {/* View Documents */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-100 border border-gray-50 p-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Identification Documents</h3>
            <div className="space-y-4">
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Aadhar Card</p>
                  <p className="text-sm font-black text-gray-800 tracking-wider">
                    {profile?.members?.aadhar_number ? `XXXX-XXXX-${profile.members.aadhar_number.slice(-4)}` : 'Not Uploaded'}
                  </p>
               </div>
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">PAN Card</p>
                  <p className="text-sm font-black text-gray-800 tracking-wider">
                    {profile?.members?.pan_number ? `${profile.members.pan_number.slice(0, 5)}XXXX${profile.members.pan_number.slice(-1)}` : 'Not Uploaded'}
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
