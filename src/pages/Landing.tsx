import React from 'react';
import { 
  Search, 
  ShoppingCart, 
  User, 
  ChevronDown, 
  Phone, 
  Play, 
  ArrowRight,
  Dumbbell,
  CheckCircle2,
  Users,
  Zap,
  Globe,
  Clock,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const categories = [
  { name: 'GYM', icon: 'Dumbbell', color: 'bg-red-500', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=300&q=80' },
  { name: 'Yoga', icon: 'Circle', color: 'bg-blue-500', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=300&q=80' },
  { name: 'Work Out', icon: 'Move', color: 'bg-green-500', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=300&q=80' },
  { name: 'Cardio', icon: 'HeartPulse', color: 'bg-orange-500', image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?auto=format&fit=crop&w=300&q=80' },
  { name: 'Meditation', icon: 'Smile', color: 'bg-purple-500', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=300&q=80' },
  { name: 'Body Building', icon: 'Target', color: 'bg-indigo-500', image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=300&q=80' },
  { name: 'Zumba Dance', icon: 'Music', color: 'bg-pink-500', image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?auto=format&fit=crop&w=300&q=80' },
];

export default function Landing() {
  const { session } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const dashboardPath = "/dashboard";

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 scroll-smooth">
      {/* Top Banner */}
      <div className="bg-[#B91C1C] text-white py-1.5 px-4 text-center text-[10px] md:text-xs font-bold uppercase tracking-widest relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="hidden md:inline">Welcome to Mera Gym, Start your fitness journey with us.</span>
            <span className="md:hidden">Welcome to Mera Gym</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
              <Zap size={12} className="fill-current" />
              <span>Get Gym Software</span>
            </a>
            <Link to={session ? dashboardPath : "/login"} className="flex items-center gap-1 hover:opacity-80 transition-opacity">
              <User size={12} />
              <span>{session ? 'Dashboard' : 'Trainer Login'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-[#B91C1C]"
            >
              <Menu size={24} />
            </button>
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="bg-[#B91C1C] p-2 rounded-lg transform -rotate-12 group hover:rotate-0 transition-transform">
                <Dumbbell className="text-white" size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-[#B91C1C] uppercase tracking-tighter leading-none">Mera Gym</span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Software</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { label: 'Home', path: '/' },
              { label: 'Gyms', path: '#categories' },
              { label: 'Fitness Trainer', path: '/trainers' },
              { label: 'Shop', path: '/pos' },
              { label: 'Blog', path: '#' },
              { label: 'About Us', path: '#' },
              { label: 'Contact Us', path: '/help' }
            ].map((item) => (
              <a 
                key={item.label} 
                href={item.path}
                className="text-xs font-black uppercase tracking-widest text-gray-600 hover:text-[#B91C1C] transition-colors relative group py-2"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#B91C1C] transition-all group-hover:w-full"></span>
              </a>
            ))}
            <div className="relative group">
              <button className="flex items-center gap-1 text-xs font-black uppercase tracking-widest text-[#B91C1C] hover:opacity-80 transition-opacity py-2">
                Services <ChevronDown size={14} />
              </button>
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 rounded-xl overflow-hidden">
                {[
                  { label: 'Membership', path: '/members' },
                  { label: 'POS System', path: '/pos' },
                  { label: 'Diet CMS', path: '/diet' },
                  { label: 'Attendance', path: '/attendance' }
                ].map((s) => (
                  <Link key={s.label} to={s.path} className="block px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-[#B91C1C]">
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 md:gap-5 shrink-0">
            <button className="p-2 text-gray-500 hover:text-[#B91C1C] transition-colors hidden sm:block">
              <Search size={22} />
            </button>
            <Link to={session ? dashboardPath : "/login"} className="p-2 text-gray-500 hover:text-[#B91C1C] transition-colors">
              <User size={22} />
            </Link>
            <button className="p-2 text-gray-500 hover:text-[#B91C1C] transition-colors relative">
              <ShoppingCart size={22} />
              <span className="absolute -top-1 -right-1 bg-[#B91C1C] text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">2</span>
            </button>
            <Link 
              to={session ? dashboardPath : "/login"}
              className="hidden sm:flex items-center gap-2 bg-[#B91C1C] text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {session ? 'Go to Dashboard' : 'Sign In'}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1001]"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-[1002] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <Dumbbell className="text-[#B91C1C]" size={24} />
                  <span className="text-xl font-black text-[#B91C1C] uppercase tracking-tighter">Mera Gym</span>
                </Link>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-2">
                {[
                  { label: 'Home', path: '/' },
                  { label: 'Gyms', path: '#categories' },
                  { label: 'Fitness Trainer', path: '/trainers' },
                  { label: 'Shop', path: '/pos' },
                  { label: 'Diet System', path: '/diet' },
                  { label: 'About Us', path: '#' },
                  { label: 'Contact Us', path: '/help' }
                ].map((item) => (
                  <Link 
                    key={item.label} 
                    to={item.path} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-4 border-b border-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-[#B91C1C]"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-6 space-y-4">
                  <Link 
                    to={session ? dashboardPath : "/login"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-3 bg-[#B91C1C] text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg"
                  >
                    {session ? 'Dashboard' : 'Sign In'} <ArrowRight size={16} />
                  </Link>
                  <button className="w-full flex items-center justify-center gap-3 border-2 border-[#B91C1C] text-[#B91C1C] py-4 rounded-xl text-xs font-black uppercase tracking-widest">
                    <Phone size={16} /> Contact Support
                  </button>
                </div>
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Follow Us</p>
                <div className="flex items-center gap-4">
                  {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                    <a key={i} href="#" className="w-10 h-10 bg-white border border-gray-200 flex items-center justify-center rounded-lg hover:border-[#B91C1C] hover:text-[#B91C1C] transition-all">
                      <Icon size={18} />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-black">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1920&q=80" 
            alt="Gym background" 
            className="w-full h-full object-cover opacity-40 scale-105 animate-pulse-slow"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 w-full pt-20 pb-40 md:pb-32">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl space-y-8"
          >
            <div className="inline-flex items-center gap-2 bg-[#B91C1C]/10 border border-[#B91C1C]/30 text-[#B91C1C] px-4 py-2 rounded-full backdrop-blur-sm">
              <Users size={16} />
              <span className="text-xs font-black uppercase tracking-widest">Trusted by 5,000+ Gyms Across India</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-[0.85] drop-shadow-2xl">
              #1 Gym Management <span className="text-[#B91C1C]">Software</span>
              <br />
              <span className="bg-[#B91C1C] px-6 py-2 inline-block -rotate-2 mt-6 shadow-2xl">Automate. Grow. Succeed.</span>
            </h1>

            <p className="text-gray-200 text-lg md:text-2xl font-bold leading-relaxed max-w-2xl drop-shadow-md">
              All-in-one gym management software to handle memberships, automate billing, track attendance, and boost member retention — built for Indian gym owners.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link 
                to={session ? dashboardPath : "/login"} 
                className="flex items-center gap-3 bg-[#B91C1C] text-white px-8 py-5 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-white hover:text-[#B91C1C] transition-all group"
              >
                {session ? 'Go to Dashboard' : 'Start Free Trial'} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button 
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-5 rounded-xl text-sm font-black uppercase tracking-widest transition-all"
              >
                <Phone size={18} /> Call for Demo
              </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-white/10">
              {[
                { label: 'Gyms Onboarded', value: '5,000+' },
                { label: 'Members Managed', value: '2 Lakh+' },
                { label: 'Setup Cost', value: '₹0' },
                { label: 'Support', value: '24/7' },
              ].map((stat) => (
                <div key={stat.label} className="space-y-1">
                  <p className="text-2xl md:text-3xl font-black text-white">{stat.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Floating Search Bar */}
        <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2 z-20 px-4">
          <div className="max-w-4xl mx-auto bg-white p-4 rounded-2xl shadow-2xl border-4 border-[#B91C1C] flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="text" 
                placeholder="Enter your city or area to find gyms..." 
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-xl text-gray-800 font-bold focus:outline-none focus:ring-2 ring-[#B91C1C]/20"
              />
            </div>
            <button className="bg-[#B91C1C] text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="pt-40 md:pt-32 pb-20 px-4 md:px-6 bg-white overflow-hidden" id="categories">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#B91C1C]">Categories</p>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Explore <span className="italic">Fitness</span></h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6">
            {categories.map((cat, idx) => (
              <motion.div 
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group shrink-0"
              >
                <Link to="/login" className="block">
                  <div className="relative aspect-square rounded-full overflow-hidden mb-4 border-4 border-white shadow-lg group-hover:shadow-2xl transition-all group-hover:-translate-y-2 duration-300">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                  </div>
                  <p className="text-center text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-900 group-hover:text-[#B91C1C] transition-colors">{cat.name}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-24 bg-gray-50 border-y border-gray-100" id="gyms">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl relative z-10">
                <img 
                  src="https://images.unsplash.com/photo-1593079831268-3381b0db4a77?auto=format&fit=crop&w=800&q=80" 
                  alt="Feature illustration" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                  <div className="bg-[#B91C1C] text-white p-4 rounded-xl shadow-xl flex items-center gap-3">
                    <CheckCircle2 size={32} />
                    <div>
                      <p className="text-xl font-black">Verified</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">By 5,000+ Gyms</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#B91C1C]/10 rounded-full blur-3xl -z-0"></div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-black/5 rounded-full blur-3xl -z-0"></div>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <span className="bg-[#B91C1C] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Why Mera Gym</span>
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-gray-900">
                  The Best Gym Management Software for <span className="italic text-[#B91C1C]">Indian Businesses</span>
                </h2>
                <p className="text-gray-500 text-lg leading-relaxed pt-4 font-medium">
                  MeraGym Gym Management Software is an all-in-one platform built specifically for Indian gym owners. Whether you run a small studio or a multi-branch chain, our software gives you every tool to automate operations, retain members, and grow revenue — at an unmatched price.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 pt-4">
                {[
                  'Cost-effective with zero hidden charges',
                  'Simple interface — no tech skills required',
                  'Complete automation: billing, renewals, reminders',
                  'Real-time data insights and revenue reports',
                  'Works on mobile, tablet, and desktop',
                  'Boost member engagement and reduce dropout',
                  'Secure, cloud-based, always up to date'
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="bg-[#B91C1C]/10 p-1 rounded">
                      <CheckCircle2 className="text-[#B91C1C]" size={16} />
                    </div>
                    <span className="text-xs md:text-sm font-bold text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

            <div className="flex flex-wrap gap-4 pt-6">
              <Link to="/login" className="flex items-center gap-3 bg-[#B91C1C] text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl">
                Start Free Trial <ArrowRight size={16} />
              </Link>
              <a href="tel:6390008506" className="flex items-center gap-3 border-2 border-[#B91C1C] text-[#B91C1C] px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#B91C1C] hover:text-white transition-all">
                <Phone size={16} /> Call Now
              </a>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <Link to="/" className="flex items-center gap-2 group">
                <Dumbbell className="text-[#B91C1C]" size={32} />
                <span className="text-3xl font-black uppercase tracking-tighter">Mera <span className="text-[#B91C1C]">Gym</span></span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed">
                Mera Gym, is a place where you can find gym center or yoga center around you by searching in different cities. Explore top fitness centers and gyms near you on Meragym. Find the perfect workout facility to help you achieve your fitness goals.
              </p>
              <div className="flex items-center gap-4 pt-4">
                {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 bg-white/5 flex items-center justify-center rounded-lg hover:bg-[#B91C1C] transition-all group">
                    <Icon size={18} className="text-gray-400 group-hover:text-white" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-black uppercase tracking-widest mb-8 border-b border-white/10 pb-4">Useful Links</h4>
              <ul className="space-y-4">
                {[
                  { label: 'Pricing', path: '/plans' },
                  { label: 'Privacy Policy', path: '#' },
                  { label: 'Terms Of Use', path: '#' },
                  { label: 'About Us', path: '#' },
                  { label: 'Contact Us', path: '#' }
                ].map((item) => (
                  <li key={item.label}>
                    <Link to={item.path} className="text-gray-400 text-sm hover:text-white hover:translate-x-1 inline-block transition-all">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-black uppercase tracking-widest mb-8 border-b border-white/10 pb-4">Other Links</h4>
              <ul className="space-y-4">
                {[
                  { label: 'All Gyms', path: '#categories' },
                  { label: 'Find Trainer', path: '/trainers' },
                  { label: 'Diet System', path: '/diet' },
                  { label: 'Shop', path: '/pos' },
                  { label: 'Login', path: '/login' }
                ].map((item) => (
                  <li key={item.label}>
                    <Link to={item.path} className="text-gray-400 text-sm hover:text-white hover:translate-x-1 inline-block transition-all">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-black uppercase tracking-widest mb-8 border-b border-white/10 pb-4">Connect with us</h4>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="bg-[#B91C1C]/20 p-2 rounded-lg"><Globe size={20} className="text-[#B91C1C]" /></div>
                  <span className="text-gray-400 text-sm">support@meragym.com</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-[#B91C1C]/20 p-2 rounded-lg"><Phone size={20} className="text-[#B91C1C]" /></div>
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-400 text-sm tracking-widest">6390008506</span>
                    <span className="text-gray-400 text-sm tracking-widest">7267977827</span>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-[#B91C1C]/20 p-2 rounded-lg"><MapPin size={20} className="text-[#B91C1C]" /></div>
                  <span className="text-gray-400 text-sm leading-relaxed">
                    Varanasi : Kamachha, Varanasi | Noida : Sector 75, Noida
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">© 2024 Meragym. All Rights Reserved.</p>
            <div className="flex items-center gap-8">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Google_Play_Store_logo_%282022%29.svg/512px-Google_Play_Store_logo_%282022%29.svg.png" alt="Google Play" className="h-4 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/640px-Download_on_the_App_Store_Badge.svg.png" alt="App Store" className="h-4 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Buttons */}
      <div className="fixed bottom-8 left-8 z-[100]">
        <button className="bg-emerald-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all group overflow-hidden">
          <div className="absolute inset-0 bg-emerald-600 translate-y-full group-hover:translate-y-0 transition-transform"></div>
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
            <Globe className="relative z-10" />
          </motion.div>
        </button>
      </div>

      <div className="fixed bottom-8 right-8 z-[100] group">
        <div className="absolute bottom-full right-0 mb-4 scale-0 group-hover:scale-100 transition-transform origin-bottom-right">
           <div className="bg-white p-4 border-2 border-[#B91C1C] rounded-2xl shadow-2xl min-w-[200px]">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#B91C1C] mb-2">Need Help?</p>
              <button className="w-full bg-[#B91C1C] text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">Chat with Us</button>
           </div>
        </div>
        <button className="bg-gray-900 text-white p-5 rounded-3xl shadow-2xl hover:bg-[#B91C1C] transition-all flex items-center gap-2 group-hover:pr-10">
          <Clock className="animate-spin-slow" />
          <span className="hidden group-hover:inline text-[10px] font-black uppercase tracking-widest">Support</span>
        </button>
      </div>
    </div>
  );
}
