import React from 'react';
import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  ChevronRight, 
  ExternalLink,
  Book,
  Shield,
  LifeBuoy
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function MemberHelp() {
  const { gym } = useAuth();

  const faqs = [
    { q: "How do I renew my plan?", a: "You can renew your plan directly from the Dashboard 'Renew' button or by visiting the 'My Plans' section." },
    { q: "What should I do if I forget to punch in?", a: "Please inform the front desk staff immediately. They can manually adjust your attendance record." },
    { q: "Can I change my batch time?", a: "Yes, but it depends on slot availability. Please contact the manager to request a batch transfer." },
    { q: "How can I get a custom diet plan?", a: "If your membership includes diet counseling, your trainer will update it in the 'My Diet Plan' section. If not, you can purchase it as an add-on service." }
  ];

  return (
    <div className="space-y-10 pb-20">
      <div className="text-center py-12 px-4 bg-gray-900 -mx-8 -mt-8 text-white">
        <div className="w-16 h-16 bg-[#E13D4B] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-rose-500/20">
          <HelpCircle size={32} />
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 italic">Support Center</h1>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">How can we assist you today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto -mt-16">
         {/* Contact Cards */}
         <div className="bg-white border-4 border-[#141414] p-8 shadow-[12px_12px_0px_0px_rgba(225,61,75,1)]">
            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
              <MessageCircle size={24} className="text-[#E13D4B]" /> Get in Touch
            </h2>
            <div className="space-y-6">
               <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 bg-gray-50 flex items-center justify-center border-2 border-[#141414] group-hover:bg-[#141414] group-hover:text-white transition-all">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Call Us</p>
                    <p className="text-lg font-black">{gym?.phone || '+91 99999 99999'}</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 bg-gray-50 flex items-center justify-center border-2 border-[#141414] group-hover:bg-[#141414] group-hover:text-white transition-all">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Email Support</p>
                    <p className="text-lg font-black">{gym?.email || 'support@meragym.in'}</p>
                  </div>
               </div>
               <button className="w-full py-4 mt-4 bg-gray-900 text-white font-black uppercase text-xs tracking-widest hover:bg-[#E13D4B] transition-all flex items-center justify-center gap-2">
                 Chat with us on WhatsApp <ExternalLink size={14} />
               </button>
            </div>
         </div>

         {/* Resources */}
         <div className="bg-[#141414] text-white p-8 border-4 border-[#141414] shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]">
            <h2 className="text-xl font-black uppercase mb-6 flex items-center gap-2 text-[#E13D4B]">
              <Book size={24} /> Resources
            </h2>
            <div className="space-y-2">
               {[
                 { icon: Shield, label: 'Membership Agreement' },
                 { icon: LifeBuoy, label: 'Gym Rules & Etiquette' },
                 { icon: Shield, label: 'Privacy Policy' },
                 { icon: HelpCircle, label: 'Terms of Service' }
               ].map((item, idx) => (
                 <button key={idx} className="w-full flex items-center justify-between p-4 hover:bg-white/10 transition-all border-b border-white/10 last:border-0 group text-left">
                    <div className="flex items-center gap-3">
                      <item.icon size={18} className="text-gray-500" />
                      <span className="text-sm font-bold">{item.label}</span>
                    </div>
                    <ChevronRight size={16} className="text-[#E13D4B] group-hover:translate-x-1 transition-transform" />
                 </button>
               ))}
            </div>
         </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-2xl font-black uppercase text-center tracking-tighter">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white border-2 border-[#141414] p-6 hover:shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] transition-all">
              <h4 className="font-black text-sm uppercase mb-2 text-[#E13D4B]">{faq.q}</h4>
              <p className="text-xs font-bold text-gray-500 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
