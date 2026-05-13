import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, Shield, Key, Bell, History, Save, 
  Loader2, Smartphone, Mail, Lock, CheckCircle2,
  AlertCircle, Cloud, LogOut
} from 'lucide-react';
import { toast } from 'sonner';

export default function UserProfile() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: user?.email || '',
    phone: profile?.phone || '',
    notifications: true
  });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { error } = await supabase
        .from('staff')
        .update({ name: formData.name, phone: formData.phone })
        .eq('id', profile.id);
      
      if (error) throw error;
      toast.success('Security profile updated');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="border-b-8 border-[#141414] pb-12">
        <h1 className="text-7xl font-black uppercase tracking-tighter">My Protocol</h1>
        <p className="text-sm font-black uppercase tracking-[1em] opacity-40">User identity & security clearance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
           <form onSubmit={handleUpdate} className="bg-white border-8 border-[#141414] p-12 shadow-[24px_24px_0px_0px_rgba(20,20,20,1)] space-y-12">
              <div className="flex items-center gap-4 border-b-4 border-[#141414] pb-6">
                 <User size={32} className="opacity-20" />
                 <h2 className="text-2xl font-black uppercase tracking-tight">Identity Matrix</h2>
              </div>
              
              <div className="space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Legal Name Identifier</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-[#f5f5f5] border-3 border-[#141414] p-5 font-black uppercase text-xs outline-none"
                    />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Communication Line</label>
                       <input 
                         type="tel" 
                         value={formData.phone}
                         onChange={e => setFormData({...formData, phone: e.target.value})}
                         className="w-full bg-[#f5f5f5] border-3 border-[#141414] p-5 font-black uppercase text-xs outline-none"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Auth Domain (Email)</label>
                       <input 
                         disabled
                         type="email" 
                         value={formData.email}
                         className="w-full bg-[#f5f5f5] border-3 border-[#141414] p-5 font-black text-xs outline-none opacity-50 cursor-not-allowed"
                       />
                    </div>
                 </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-8 bg-[#141414] text-white font-black uppercase tracking-[0.4em] text-sm hover:invert transition-all shadow-[10px_10px_0px_0px_rgba(20,20,20,0.1)]"
              >
                 {loading ? <Loader2 className="animate-spin" /> : 'COMMIT SECURITY UPDATE'}
              </button>
           </form>

           <div className="bg-[#141414] text-white p-12 border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,0.1)] space-y-12">
              <div className="flex items-center gap-4 border-b border-white/20 pb-6">
                 <Key size={32} className="opacity-40" />
                 <h2 className="text-2xl font-black uppercase tracking-tight italic">Security Encryption</h2>
              </div>
              <div className="space-y-8">
                 <p className="text-xs font-medium uppercase opacity-40 leading-relaxed tracking-widest">
                    Credential rotation is recommended every 90 days. Changing your password will invalidate all active sessions across desktop and mobile terminals.
                 </p>
                 <button className="px-10 py-5 bg-white text-[#141414] font-black uppercase tracking-[0.3em] text-xs hover:bg-transparent hover:text-white border-4 border-white transition-all">
                    Initiate Rotation
                 </button>
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-12 text-white">
           <div className="bg-indigo-600 border-8 border-[#141414] p-10 shadow-[12px_12px_0px_0px_rgba(79,70,229,0.2)] space-y-10">
              <div className="flex items-center gap-4 border-b border-white/20 pb-4">
                 <Shield size={24} className="opacity-40" />
                 <h3 className="text-sm font-black uppercase">Clearance Status</h3>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-[9px] font-black uppercase opacity-40">Role Matrix</span>
                    <span className="text-[10px] font-black uppercase italic bg-white text-indigo-600 px-2 py-0.5">{profile?.role?.name || 'ADMIN'}</span>
                 </div>
                 <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-[9px] font-black uppercase opacity-40">MFA Status</span>
                    <span className="text-[10px] font-black uppercase text-green-300">FULLY_ACTIVE</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase opacity-40">Session ID</span>
                    <span className="text-[10px] font-black uppercase opacity-40 font-mono">#{profile?.id?.substring(0,6)}</span>
                 </div>
              </div>
           </div>

           <div className="bg-[#141414] border-4 border-[#141414] p-10 shadow-[12px_12px_0px_0px_rgba(20,20,20,0.1)] space-y-10">
              <div className="flex items-center gap-4 text-rose-500">
                 <LogOut size={24} />
                 <h3 className="text-sm font-black uppercase text-white">Termination</h3>
              </div>
              <button 
                onClick={() => supabase.auth.signOut()}
                className="w-full py-5 border-2 border-rose-500/50 text-rose-500 font-black uppercase tracking-widest text-[10px] hover:bg-rose-500 hover:text-white transition-all"
              >
                 LOGOUT_SEQUENCE
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
