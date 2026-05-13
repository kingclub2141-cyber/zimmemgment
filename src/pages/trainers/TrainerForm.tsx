import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ArrowLeft, 
  Save, 
  Loader2,
  Camera,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function TrainerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { gym } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!id);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: 'Male',
    address: '',
    dob: '',
    joining_date: format(new Date(), 'yyyy-MM-dd'),
    monthly_amount: '0',
    daily_amount: '0',
    status: 'Active',
    photo_url: ''
  });

  useEffect(() => {
    if (id && gym) fetchTrainer();
  }, [id, gym]);

  const fetchTrainer = async () => {
    try {
      const { data, error } = await supabase
        .from('trainers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setFormData({
        name: data.name,
        phone: data.phone,
        gender: data.gender,
        address: data.address || '',
        dob: data.dob || '',
        joining_date: data.joining_date,
        monthly_amount: data.monthly_amount.toString(),
        daily_amount: data.daily_amount.toString(),
        status: data.status,
        photo_url: data.photo_url || ''
      });
      setPhotoPreview(data.photo_url);
    } catch (error) {
      toast.error('Failed to fetch trainer details');
      navigate('/trainers');
    } finally {
      setFetching(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const uploadPhoto = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `trainers/${gym.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gym_assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('gym_assets')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      toast.error('Photo upload failed');
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym) return;

    try {
      setLoading(true);
      let photoUrl = formData.photo_url;

      if (photo) {
        const uploadedUrl = await uploadPhoto(photo);
        if (uploadedUrl) photoUrl = uploadedUrl;
      }

      const trainerData = {
        gym_id: gym.id,
        name: formData.name,
        phone: formData.phone,
        gender: formData.gender,
        address: formData.address,
        dob: formData.dob || null,
        joining_date: formData.joining_date,
        monthly_amount: parseFloat(formData.monthly_amount),
        daily_amount: parseFloat(formData.daily_amount),
        status: formData.status,
        photo_url: photoUrl
      };

      if (id) {
        const { error } = await supabase
          .from('trainers')
          .update(trainerData)
          .eq('id', id);
        if (error) throw error;
        toast.success('Trainer details updated');
      } else {
        const { error } = await supabase
          .from('trainers')
          .insert([trainerData]);
        if (error) throw error;
        toast.success('New trainer onboarded');
      }

      navigate('/trainers');
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-[#141414]" size={40} /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/trainers')}
          className="p-3 border-4 border-[#141414] hover:bg-[#141414] hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">
            {id ? 'Refine Trainer Profile' : 'Onboard New Trainer'}
          </h1>
          <p className="text-xs font-black uppercase tracking-widest opacity-40">Registration of certified gym staff</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] space-y-8">
        {/* Profile Photo */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="w-32 h-32 border-4 border-[#141414] object-cover" />
            ) : (
              <div className="w-32 h-32 bg-[#f5f5f5] border-4 border-[#141414] flex items-center justify-center text-[#141414] opacity-20">
                <Camera size={40} />
              </div>
            )}
            <input 
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
              id="photo-upload"
            />
            <label 
              htmlFor="photo-upload"
              className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-all font-black uppercase text-[10px] tracking-widest"
            >
              Update Photo
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-black uppercase tracking-widest text-[10px] pb-2 border-b-2 border-[#141414]">Personal Information</h3>
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase">Full Name</label>
              <input 
                required
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-3 font-bold outline-none focus:bg-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase">Phone Number</label>
              <input 
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))}
                className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-3 font-bold outline-none focus:bg-white transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase">Gender</label>
                <select 
                  value={formData.gender}
                  onChange={(e) => setFormData(f => ({ ...f, gender: e.target.value }))}
                  className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-3 font-bold outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase">Date of Birth</label>
                <input 
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData(f => ({ ...f, dob: e.target.value }))}
                  className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-3 font-bold outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-black uppercase tracking-widest text-[10px] pb-2 border-b-2 border-[#141414]">Employment & Pay</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase">Joining Date</label>
                <input 
                  required
                  type="date"
                  value={formData.joining_date}
                  onChange={(e) => setFormData(f => ({ ...f, joining_date: e.target.value }))}
                  className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-3 font-bold outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black uppercase">Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData(f => ({ ...f, status: e.target.value }))}
                  className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-3 font-bold outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase">Monthly Amount (₹)</label>
              <input 
                required
                type="number"
                min="0"
                value={formData.monthly_amount}
                onChange={(e) => setFormData(f => ({ ...f, monthly_amount: e.target.value }))}
                className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-3 font-black text-xl outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black uppercase">Daily Amount (₹)</label>
              <input 
                required
                type="number"
                min="0"
                value={formData.daily_amount}
                onChange={(e) => setFormData(f => ({ ...f, daily_amount: e.target.value }))}
                className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-3 font-black text-xl outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase">Address</label>
          <textarea 
            rows={3}
            value={formData.address}
            onChange={(e) => setFormData(f => ({ ...f, address: e.target.value }))}
            className="w-full bg-[#f5f5f5] border-2 border-[#141414] p-3 font-bold outline-none resize-none"
          ></textarea>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-[#141414] text-white border-4 border-[#141414] font-black uppercase tracking-[0.3em] text-sm hover:bg-white hover:text-[#141414] transition-all flex items-center justify-center gap-3 shadow-[8px_8px_0px_0px_rgba(20,20,20,0.1)] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <Save size={20} />
              {id ? 'Update Trainer' : 'Onboard Trainer'}
            </>
          )}
        </button>
      </form>
    </div>
  );
}
