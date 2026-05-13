import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Save, 
  Loader2, 
  Camera,
  Shield,
  CreditCard,
  Facebook,
  Instagram,
  Twitter,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

export default function GymProfile() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    gst_number: '',
    social_links: {
      facebook: '',
      instagram: '',
      twitter: ''
    }
  });

  useEffect(() => {
    if (gym) {
      setFormData({
        name: gym.name || '',
        address: gym.address || '',
        phone: gym.phone || '',
        email: gym.email || '',
        website: gym.website || '',
        gst_number: gym.gst_number || '',
        social_links: gym.social_links || { facebook: '', instagram: '', twitter: '' }
      });
    }
  }, [gym]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('gyms')
        .update(formData)
        .eq('id', gym.id);
      
      if (error) throw error;
      toast.success('Gym profile updated successfully');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-8 border-[#141414] pb-12">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter">Elite HQ Profile</h1>
          <p className="text-sm font-black uppercase tracking-[0.4em] opacity-40">Core organizational configuration</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="w-24 h-24 bg-[#141414] text-white flex flex-col items-center justify-center border-4 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,0.1)] relative group overflow-hidden">
              <Camera size={24} className="group-hover:scale-110 transition-transform" />
              <span className="text-[8px] font-black mt-1">UPLOAD</span>
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Basic Info */}
        <div className="lg:col-span-8 space-y-10">
           <div className="bg-white border-8 border-[#141414] p-12 shadow-[20px_20px_0px_0px_rgba(20,20,20,1)] space-y-8">
              <div className="flex items-center gap-3 border-b-2 border-[#141414] pb-6">
                 <Building2 className="opacity-40" />
                 <h2 className="text-xl font-black uppercase tracking-tight">Identity Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Organization Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#f5f5f5] border-3 border-[#141414] p-5 font-black uppercase text-xs outline-none"
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">GST Identification</label>
                    <input 
                      type="text" 
                      value={formData.gst_number}
                      onChange={e => setFormData({ ...formData, gst_number: e.target.value })}
                      className="w-full bg-[#f5f5f5] border-3 border-[#141414] p-5 font-black uppercase text-xs outline-none"
                      placeholder="Optional GSTIN"
                    />
                 </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Corporate Address</label>
                 <textarea 
                   value={formData.address}
                   onChange={e => setFormData({ ...formData, address: e.target.value })}
                   className="w-full bg-[#f5f5f5] border-3 border-[#141414] p-5 font-black uppercase text-xs outline-none min-h-[120px] resize-none"
                 />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Official Line</label>
                    <input 
                      type="text" 
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#f5f5f5] border-3 border-[#141414] p-5 font-black uppercase text-xs outline-none"
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Email Domain</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#f5f5f5] border-3 border-[#141414] p-5 font-black text-xs outline-none"
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Web Interface</label>
                    <input 
                      type="url" 
                      value={formData.website}
                      onChange={e => setFormData({ ...formData, website: e.target.value })}
                      className="w-full bg-[#f5f5f5] border-3 border-[#141414] p-5 font-black text-xs outline-none"
                    />
                 </div>
              </div>
           </div>

           <div className="bg-indigo-600 text-white border-8 border-[#141414] p-12 shadow-[20px_20px_0px_0px_rgba(20,20,20,1)] space-y-8">
              <div className="flex items-center gap-3 border-b-2 border-white/20 pb-6">
                 <Globe className="opacity-40" />
                 <h2 className="text-xl font-black uppercase tracking-tight text-white">Social Footprint</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="space-y-3">
                    <div className="flex items-center gap-2">
                       <Facebook size={16} className="opacity-40" />
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Facebook</label>
                    </div>
                    <input 
                      type="text" 
                      value={formData.social_links.facebook}
                      onChange={e => setFormData({ ...formData, social_links: { ...formData.social_links, facebook: e.target.value } })}
                      className="w-full bg-white/10 border-2 border-white/20 p-4 font-black text-xs outline-none focus:bg-white/20"
                    />
                 </div>
                 <div className="space-y-3">
                    <div className="flex items-center gap-2">
                       <Instagram size={16} className="opacity-40" />
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Instagram</label>
                    </div>
                    <input 
                      type="text" 
                      value={formData.social_links.instagram}
                      onChange={e => setFormData({ ...formData, social_links: { ...formData.social_links, instagram: e.target.value } })}
                      className="w-full bg-white/10 border-2 border-white/20 p-4 font-black text-xs outline-none focus:bg-white/20"
                    />
                 </div>
                 <div className="space-y-3">
                    <div className="flex items-center gap-2">
                       <Twitter size={16} className="opacity-40" />
                       <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Twitter</label>
                    </div>
                    <input 
                      type="text" 
                      value={formData.social_links.twitter}
                      onChange={e => setFormData({ ...formData, social_links: { ...formData.social_links, twitter: e.target.value } })}
                      className="w-full bg-white/10 border-2 border-white/20 p-4 font-black text-xs outline-none focus:bg-white/20"
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-4 space-y-10">
           <div className="bg-[#141414] text-white p-10 border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,0.1)] space-y-8">
              <h3 className="text-xl font-black uppercase tracking-tighter italic border-b border-white/10 pb-4">Sync Protocol</h3>
              <p className="text-xs font-bold opacity-40 leading-relaxed uppercase tracking-wider">
                All modifications to the core profile will be propagated across receipt headers, app identification and billing templates.
              </p>
              <button 
                type="submit"
                disabled={isSaving}
                className="w-full py-8 bg-white text-[#141414] font-black uppercase tracking-[0.4em] text-sm hover:invert transition-all shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]"
              >
                 {isSaving ? <Loader2 className="animate-spin" /> : 'COMMIT CHANGES'}
              </button>
           </div>

           <div className="bg-white border-4 border-[#141414] p-10 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-8">
              <div className="flex items-center gap-4">
                 <Shield size={24} className="opacity-20" />
                 <h3 className="text-xs font-black uppercase tracking-widest">Compliance Status</h3>
              </div>
              <div className="space-y-4">
                 {[
                   { label: 'Merchant ID', val: gym?.id?.substring(0, 12).toUpperCase(), ok: true },
                   { label: 'Security Level', val: 'TIER 1 (MAX)', ok: true },
                   { label: 'Auth Status', val: 'VERIFIED', ok: true }
                 ].map(item => (
                   <div key={item.label} className="flex justify-between items-center border-b border-[#141414]/5 pb-3">
                      <span className="text-[10px] font-black uppercase opacity-40">{item.label}</span>
                      <span className="text-[10px] font-black text-green-600 uppercase">{item.val}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </form>
    </div>
  );
}
