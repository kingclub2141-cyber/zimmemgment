import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, 
  Key, 
  Mail, 
  ShieldCheck, 
  CreditCard,
  ArrowRight,
  Printer
} from 'lucide-react';
import { toast } from 'sonner';

export default function LoginGenerator() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [generatedCard, setGeneratedCard] = useState<any>(null);

  useEffect(() => {
    if (gym) fetchMembers();
  }, [gym]);

  const fetchMembers = async () => {
    const { data } = await supabase
      .from('members')
      .select('id, name, phone, email, member_id')
      .eq('gym_id', gym.id)
      .order('name');
    setMembers(data || []);
  };

  const handleCreateLogin = async () => {
    if (!selectedMember || !password || !email) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      // Create Auth Account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'member',
            gym_id: gym.id,
            member_id: selectedMember.id,
            display_name: selectedMember.name
          }
        }
      });

      if (authError) throw authError;

      // Update member record with the email if it was changed
      await supabase
        .from('members')
        .update({ email: email })
        .eq('id', selectedMember.id);

      setGeneratedCard({
        name: selectedMember.name,
        member_id: selectedMember.member_id,
        email,
        password,
        gym_name: gym.name
      });

      toast.success('Login credentials created successfully!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const printCard = () => {
    window.print();
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tighter">Login Generator</h1>
        <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Create member portal access</p>
      </div>

      <div className="bg-white border-4 border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Select Member</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={18} />
              <select 
                className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-12 pr-4 py-3 font-bold outline-none"
                value={selectedMember?.id || ''}
                onChange={(e) => {
                  const member = members.find(m => m.id === e.target.value);
                  setSelectedMember(member);
                  setEmail(member?.email || `${member?.phone}@meragym.com`);
                }}
              >
                <option value="">SELECT A MEMBER</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.member_id})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Login Email (Username)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={18} />
              <input 
                type="email"
                placeholder="email@example.com"
                className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-12 pr-4 py-3 font-bold outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Set Password</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={18} />
              <input 
                type="text"
                placeholder="Min 6 characters"
                className="w-full bg-[#f5f5f5] border-2 border-[#141414] pl-12 pr-4 py-3 font-bold outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        <button 
          onClick={handleCreateLogin}
          disabled={loading || !selectedMember}
          className="w-full flex items-center justify-center gap-3 bg-[#141414] text-white py-4 border-4 border-[#141414] font-black uppercase tracking-widest text-xs hover:bg-white hover:text-[#141414] transition-all"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <ShieldCheck size={18} /> Create Login Account
            </>
          )}
        </button>
      </div>

      {generatedCard && (
        <div className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)] animate-in slide-in-from-top-4 print:shadow-none print:border-2">
          <div className="border-b-4 border-[#141414] pb-6 mb-6 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter">Member Login Card</h2>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{generatedCard.gym_name}</p>
            </div>
            <CreditCard size={32} className="opacity-10" />
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[8px] font-black uppercase opacity-40 tracking-widest leading-none mb-1">Member Name</p>
                <p className="font-black border-2 border-[#141414] px-4 py-2 bg-gray-50">{generatedCard.name}</p>
              </div>
              <div>
                <p className="text-[8px] font-black uppercase opacity-40 tracking-widest leading-none mb-1">Member ID</p>
                <p className="font-black border-2 border-[#141414] px-4 py-2 bg-gray-50 uppercase">{generatedCard.member_id}</p>
              </div>
            </div>

            <div className="p-6 bg-yellow-50 border-4 border-dashed border-yellow-200 space-y-4">
              <div>
                <p className="text-[8px] font-black uppercase opacity-40 tracking-widest leading-none mb-1 text-yellow-800">Login Email</p>
                <p className="font-mono text-sm font-bold truncate">{generatedCard.email}</p>
              </div>
              <div>
                <p className="text-[8px] font-black uppercase opacity-40 tracking-widest leading-none mb-1 text-yellow-800">Your Password</p>
                <p className="font-mono text-sm font-bold border-b-2 border-yellow-300 pb-1">{generatedCard.password}</p>
              </div>
            </div>

            <div className="flex gap-4 print:hidden">
              <button 
                onClick={printCard}
                className="flex-1 flex items-center justify-center gap-3 bg-blue-600 text-white py-3 border-4 border-[#141414] font-black uppercase tracking-widest text-[10px] hover:opacity-90 transition-all shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
              >
                <Printer size={16} /> Print Card
              </button>
              <button 
                className="flex items-center gap-2 px-4 py-3 bg-[#141414] text-white text-[10px] font-black uppercase tracking-widest"
                onClick={() => setGeneratedCard(null)}
              >
                Done <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
