import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, Phone, Loader2, ArrowRight, ShieldCheck, Dumbbell } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      return toast.error('Please enter both Email/Phone and Password');
    }

    setLoading(true);
    try {
      const { role } = await signIn(identifier, password);
      toast.success('Login Successful! Welcome back.');
      
      // Role-based redirects as requested
      if (role === 'admin' || role === 'admin2') {
        navigate('/dashboard');
      } else if (role === 'staff') {
        navigate('/staff');
      } else if (role === 'trainer') {
        navigate('/trainer/dashboard');
      } else if (role === 'member') {
        navigate('/member/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 selection:bg-[#E13D4B] selection:text-white">
      <div className="w-full max-w-[440px] space-y-8">
        {/* Branding */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 rounded-[24px] shadow-2xl shadow-gray-200 mb-2">
            <Dumbbell className="text-[#E13D4B]" size={32} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic">Mera Gym<span className="text-[#E13D4B]">.</span></h1>
          <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em]">Premium Gym Management Suite</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-[100px] -mr-16 -mt-16 opacity-50" />
          
          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Email or Phone Number</label>
              <div className="relative group">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#E13D4B] focus:bg-white transition-all font-bold text-gray-700"
                  placeholder="name@email.com or 9999999999"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E13D4B] transition-colors">
                  {identifier.includes('@') ? <Mail size={20} /> : <Phone size={20} />}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
                <button type="button" className="text-[10px] font-black text-[#E13D4B] uppercase tracking-widest hover:underline">Forgot?</button>
              </div>
              <div className="relative group">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#E13D4B] focus:bg-white transition-all font-bold text-gray-700"
                  placeholder="••••••••"
                />
                <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E13D4B] transition-colors" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-gray-900 text-white font-black rounded-2xl text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-gray-300 hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>SIGN IN TO PANEL <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          {/* Social Proof / Security */}
          <div className="mt-10 pt-8 border-t border-gray-50 flex items-center justify-center gap-4 text-gray-400">
            <ShieldCheck size={16} />
            <span className="text-[9px] font-black uppercase tracking-widest">Secure AES-256 Encryption Locked</span>
          </div>
        </div>

        {/* Support Link */}
        <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Authorized Access Only • <button className="text-[#E13D4B] hover:underline">Contact Admin</button>
        </p>
      </div>
    </div>
  );
}
