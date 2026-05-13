import React from 'react';
import { 
  HelpCircle, BookOpen, Video, MessageSquare, 
  FileText, ExternalLink, Mail, Smartphone,
  Zap, Shield, Database, ChevronRight, Search
} from 'lucide-react';

export default function HelpSupport() {
  const sections = [
    {
      title: "Core Operations",
      items: ["Member Enrollment Protocol", "Billing & Receipt Logic", "Attendance Management"],
      icon: <Zap className="text-amber-500" />
    },
    {
      title: "Security & Clearance",
      items: ["Role-Based Access (RBAC)", "Activity Log Forensics", "Data Redundancy Policies"],
      icon: <Shield className="text-indigo-500" />
    },
    {
      title: "Advanced Matrix",
      items: ["Visitor Conversion Flow", "Lead Lifecycle Analysis", "Inventory Reconciliation"],
      icon: <Database className="text-rose-500" />
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-16 animate-in slide-in-from-bottom-8 duration-500 pb-20">
      <div className="border-b-8 border-[#141414] pb-12 flex items-center justify-between">
        <div>
           <h1 className="text-7xl font-black uppercase tracking-tighter">Terminal Help</h1>
           <p className="text-sm font-black uppercase tracking-[1em] opacity-40">System documentation & support matrix</p>
        </div>
        <HelpCircle size={80} className="opacity-10 hidden md:block" />
      </div>

      {/* Quick Search */}
      <div className="bg-white border-8 border-[#141414] p-10 shadow-[20px_20px_0px_0px_rgba(20,20,20,1)] relative">
         <Search className="absolute left-16 top-1/2 -translate-y-1/2 opacity-20" size={32} />
         <input 
           type="text" 
           placeholder="SCAN DOCUMENTATION FOR PHRASES..."
           className="w-full bg-[#f5f5f5] border-4 border-[#141414] py-8 pl-32 pr-8 text-2xl font-black uppercase italic outline-none placeholder:opacity-10"
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {sections.map((section, idx) => (
           <div key={idx} className="bg-white border-8 border-[#141414] p-10 shadow-[16px_16px_0px_0px_rgba(20,20,20,1)] space-y-10 group hover:-translate-y-2 transition-all">
              <div className="flex items-center gap-4 border-b-2 border-[#141414] pb-6">
                 {section.icon}
                 <h3 className="text-xl font-black uppercase tracking-tight italic">{section.title}</h3>
              </div>
              <ul className="space-y-6">
                 {section.items.map((item, i) => (
                    <li key={i} className="flex items-center justify-between group/item cursor-pointer">
                       <span className="text-xs font-black uppercase opacity-40 group-hover/item:opacity-100 transition-opacity tracking-widest">{item}</span>
                       <ChevronRight size={16} className="opacity-0 group-hover/item:opacity-100 transition-opacity" />
                    </li>
                 ))}
              </ul>
              <button className="w-full py-4 border-2 border-[#141414] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-4 hover:bg-[#141414] hover:text-white transition-all">
                 <BookOpen size={16} /> Load Module
              </button>
           </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
         <div className="bg-[#141414] text-white p-12 border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,0.1)] space-y-8">
            <h3 className="text-3xl font-black uppercase italic tracking-tighter border-b border-white/10 pb-6">Technical Corps</h3>
            <div className="space-y-8">
               <div className="flex items-center gap-8">
                  <div className="w-16 h-16 bg-white/10 border-2 border-white/20 flex items-center justify-center"><Mail size={32}/></div>
                  <div>
                     <p className="text-[10px] font-black uppercase opacity-40">System Support Line</p>
                     <p className="text-xl font-black lowercase tracking-tight">ops@zimmer-protocol.com</p>
                  </div>
               </div>
               <div className="flex items-center gap-8">
                  <div className="w-16 h-16 bg-white/10 border-2 border-white/20 flex items-center justify-center"><Smartphone size={32}/></div>
                  <div>
                     <p className="text-[10px] font-black uppercase opacity-40">Emergency Uplink</p>
                     <p className="text-xl font-black tracking-tight">+91 999 111 2222</p>
                  </div>
               </div>
            </div>
         </div>

         <div className="bg-indigo-600 text-white p-12 border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(79,70,229,0.2)] space-y-8">
            <div className="flex items-center gap-4 text-indigo-200">
               <Video size={40} />
               <h3 className="text-3xl font-black uppercase italic tracking-tighter">Visual Intelligence</h3>
            </div>
            <p className="text-xs font-medium uppercase opacity-60 leading-relaxed tracking-widest border-l-4 border-white pl-6">
               Access step-by-step video forensics for core system workflows. Recommended for new operational staff during induction cycles.
            </p>
            <button className="w-full py-8 bg-white text-[#141414] font-black uppercase tracking-[0.4em] text-sm hover:invert transition-all">
               Access Video Ops
            </button>
         </div>
      </div>
    </div>
  );
}
