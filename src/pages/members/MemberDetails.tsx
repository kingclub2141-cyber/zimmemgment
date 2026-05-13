import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { 
  ArrowLeft, 
  Edit2, 
  User, 
  CreditCard, 
  Receipt, 
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  MoreVertical,
  History,
  DollarSign,
  Plus,
  FileText
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { cn, safeFormat } from '../../lib/utils';
import AssignPlanModal from '../../components/modals/AssignPlanModal';
import ChangeTrainerModal from '../../components/modals/ChangeTrainerModal';
import MemberServicePaymentModal from '../../components/modals/MemberServicePaymentModal';
import UpdateMembershipPaymentModal from '../../components/modals/UpdateMembershipPaymentModal';

export default function MemberDetails() {
  const { id } = useParams();
  const [member, setMember] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isTrainerModalOpen, setIsTrainerModalOpen] = useState(false);
  const [isServicePaymentModalOpen, setIsServicePaymentModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null);
  const [selectedServiceData, setSelectedServiceData] = useState<{ id: string, due: number } | null>(null);
  const [memberServices, setMemberServices] = useState<any[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMemberData();
    }
  }, [id]);

  async function fetchMemberData() {
    setLoading(true);
    try {
      const [
        { data: memberData },
        { data: plansData },
        { data: paymentsData },
        { data: attendanceData },
        { data: servicesData }
      ] = await Promise.all([
        supabase.from('members').select('*, batches(batch_name)').eq('id', id).single(),
        supabase.from('member_plans').select('*, plans(*)').eq('member_id', id).order('purchase_date', { ascending: false }),
        supabase.from('payments').select('*').eq('member_id', id).order('payment_date', { ascending: false }),
        supabase.from('attendance').select('*').eq('member_id', id).order('attendance_date', { ascending: false }).limit(30),
        supabase.from('member_services').select('*, services(*)').eq('member_id', id).order('purchase_date', { ascending: false })
      ]);

      setMember(memberData);
      setPlans(plansData || []);
      setPayments(paymentsData || []);
      setAttendance(attendanceData || []);
      setMemberServices(servicesData || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#141414] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-12 text-center">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-600 opacity-20" />
        <h2 className="text-xl font-black uppercase tracking-widest opacity-40">Member not found</h2>
        <Link to="/members" className="text-xs font-bold underline mt-4 inline-block">Back to members</Link>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'plans', label: 'Plans & Subs', icon: CreditCard },
    { id: 'payments', label: 'Payment History', icon: Receipt },
    { id: 'services', label: 'Add-on Services', icon: Zap },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 border-4 border-[#141414] bg-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            <User size={48} strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-4xl font-black tracking-tighter uppercase">{member.name}</h1>
              <span className={cn(
                "px-2 py-0.5 border text-[10px] font-black uppercase tracking-widest",
                member.status === 'Active' ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"
              )}>
                {member.status}
              </span>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-4">
              Member ID: {member.member_id} • Since {safeFormat(member.joining_date, 'MMM yyyy')}
            </p>
            <div className="flex gap-2">
              <Link 
                to="/members"
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#141414] text-[10px] font-black uppercase tracking-widest hover:bg-[#f5f5f5] transition-all"
              >
                <ArrowLeft size={14} /> Back
              </Link>
              <Link 
                to={`/members/${member.id}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white border-2 border-[#141414] text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] active:shadow-none active:translate-x-0.5 active:translate-y-0.5"
              >
                <Edit2 size={14} /> Update Profile
              </Link>
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-[#141414] text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,.1)]">
                  <MoreVertical size={14} /> More
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-white border-2 border-[#141414] shadow-[4px_4px_0px_0px_rgba(20,20,20,1)] z-50 hidden group-hover:block divide-y-2 divide-[#141414]">
                  <button onClick={() => setIsPaymentModalOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase hover:bg-gray-50 transition-all text-left">
                    <DollarSign size={14} /> Add Payment
                  </button>
                  <button onClick={() => setActiveTab('payments')} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase hover:bg-gray-50 transition-all text-left">
                    <History size={14} /> Payment Update History
                  </button>
                  <button onClick={() => setIsModalOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase hover:bg-gray-50 transition-all text-left">
                    <Zap size={14} /> Assign Plan
                  </button>
                   <Link to={`/members/${member.id}/services/add`} className="flex items-center gap-3 px-4 py-3 text-[10px] font-black uppercase hover:bg-gray-50 transition-all">
                    <Plus size={14} /> Add Service
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border-2 border-[#141414] p-4 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            <p className="text-[10px] font-bold uppercase opacity-40 mb-1">Remaining Balance</p>
            <p className="text-xl font-black text-red-600">
              ₹{plans.reduce((acc, p) => acc + (p.due_amount || 0), 0) + memberServices.reduce((acc, s) => acc + (s.due_amount || 0), 0)}
            </p>
          </div>
          <div className="bg-white border-2 border-[#141414] p-4 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
            <p className="text-[10px] font-bold uppercase opacity-40 mb-1">Attendance</p>
            <p className="text-xl font-black">{attendance.length} <span className="text-xs opacity-40 font-bold">/30d</span></p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-[#141414] overflow-x-auto whitespace-nowrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-8 py-4 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all border-t-4 border-x border-transparent",
              activeTab === tab.id 
                ? "bg-white border-x-[#141414] border-t-[#141414] text-[#141414]" 
                : "opacity-40 hover:opacity-100"
            )}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in slide-in-from-left-4 duration-300">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border-2 border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] space-y-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] border-b-2 border-[#141414] pb-4">Personal Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone size={16} className="mt-1 opacity-40" />
                  <div>
                    <p className="text-[10px] font-bold uppercase opacity-40">Phone Number</p>
                    <p className="text-sm font-bold">{member.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail size={16} className="mt-1 opacity-40" />
                  <div>
                    <p className="text-[10px] font-bold uppercase opacity-40">Email Address</p>
                    <p className="text-sm font-bold">{member.email || 'Not Provided'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar size={16} className="mt-1 opacity-40" />
                  <div>
                    <p className="text-[10px] font-bold uppercase opacity-40">Birth Date</p>
                    <p className="text-sm font-bold">
                      {safeFormat(member.date_of_birth, 'MMMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="mt-1 opacity-40" />
                  <div>
                    <p className="text-[10px] font-bold uppercase opacity-40">Address</p>
                    <p className="text-sm font-bold leading-relaxed">{member.address || 'No address saved.'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] space-y-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] border-b-2 border-[#141414] pb-4">Gym Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-40">Current Batch</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={16} className="opacity-40" />
                    <p className="text-sm font-bold">{member.batches?.batch_name || 'General'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-40">Gender</p>
                  <p className="text-sm font-bold mt-1 uppercase tracking-wider">{member.gender}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-40">Aadhar/ID</p>
                  <p className="text-sm font-bold mt-1">{member.aadhar_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-40">PAN Card</p>
                  <p className="text-sm font-bold mt-1">{member.pan_number || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="bg-white border-2 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
             <div className="p-6 border-b-2 border-[#141414] flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-[0.2em]">Active & Past Plans</h3>
              <div className="flex gap-2">
                <Link 
                  to={`/members/${id}/plans`}
                  className="px-4 py-2 border-2 border-[#141414] text-[10px] font-black uppercase tracking-widest hover:bg-[#f5f5f5] transition-all"
                >
                  Full History
                </Link>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-[#141414] text-white text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
                >
                  Assign New Plan
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f5f5f5] text-[10px] uppercase tracking-[0.2em] font-black opacity-50">
                    <th className="px-6 py-4 border-b-2 border-[#141414]">Plan Name</th>
                    <th className="px-6 py-4 border-b-2 border-[#141414]">Price</th>
                    <th className="px-6 py-4 border-b-2 border-[#141414]">Validity</th>
                    <th className="px-6 py-4 border-b-2 border-[#141414]">Balance</th>
                    <th className="px-6 py-4 border-b-2 border-[#141414]">Trainer</th>
                    <th className="px-6 py-4 border-b-2 border-[#141414]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#141414]">
                  {plans.length > 0 ? plans.map(p => (
                    <tr key={p.id} className="text-sm group">
                      <td className="px-6 py-4 font-bold uppercase">{p.plans?.plan_name}</td>
                      <td className="px-6 py-4 font-mono font-bold">₹{p.amount}</td>
                      <td className="px-6 py-4 text-xs font-bold opacity-60">
                        {safeFormat(p.start_date, 'MMM dd', '')} - {safeFormat(p.expiry_date, 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("font-bold text-xs", (p.due_amount || 0) > 0 ? "text-red-600" : "text-green-600")}>
                          ₹{p.due_amount || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => {
                            setSelectedPlanId(p.id);
                            setSelectedTrainerId(p.trainer_id);
                            setIsTrainerModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-2 py-1 border-2 border-transparent hover:border-[#141414] hover:bg-[#f5f5f5] transition-all font-black uppercase text-[10px]"
                        >
                          {p.trainer_id ? 'Coach Assigned' : 'No Coach'}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-0.5 border text-[10px] font-black uppercase tracking-widest",
                          p.status === 'Active' ? "bg-green-100 text-green-700 border-green-200" : "bg-red-50 opacity-50"
                        )}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center opacity-30 uppercase font-black tracking-widest text-xs">No plans assigned</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="bg-white border-2 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
            <div className="p-6 border-b-2 border-[#141414] flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-[0.2em]">Payment Update History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f5f5f5] text-[10px] uppercase tracking-[0.2em] font-black opacity-50">
                    <th className="px-6 py-4 border-b-2 border-[#141414]">Date</th>
                    <th className="px-6 py-4 border-b-2 border-[#141414]">Receipt #</th>
                    <th className="px-6 py-4 border-b-2 border-[#141414]">Amount</th>
                    <th className="px-6 py-4 border-b-2 border-[#141414]">Mode</th>
                    <th className="px-6 py-4 border-b-2 border-[#141414] text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#141414]">
                  {payments.length > 0 ? payments.map(p => (
                    <tr key={p.id} className="text-sm">
                      <td className="px-6 py-4 font-bold">{safeFormat(p.payment_date, 'MMM dd, yyyy')}</td>
                      <td className="px-6 py-4 font-mono text-xs opacity-60">{p.receipt_number || 'N/A'}</td>
                      <td className="px-6 py-4 font-black text-green-600">₹{p.amount}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-[#141414] text-white text-[10px] font-black uppercase tracking-widest">{p.payment_mode}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link 
                          to={`/payments/${p.id}/invoice`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border-2 border-[#141414] text-[10px] font-black uppercase tracking-widest hover:bg-[#141414] hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(20,20,20,1)] hover:shadow-none"
                        >
                          <FileText size={12} /> Invoice
                        </Link>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center opacity-30 uppercase font-black tracking-widest text-xs">No payments recorded</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-white border-2 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
              <div className="p-6 border-b-2 border-[#141414] flex justify-between items-center">
                <h3 className="text-sm font-black uppercase tracking-[0.2em]">Latest Punch-ins</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f5f5f5] text-[10px] uppercase tracking-[0.2em] font-black opacity-50">
                      <th className="px-6 py-4 border-b-2 border-[#141414]">Date</th>
                      <th className="px-6 py-4 border-b-2 border-[#141414]">Time</th>
                      <th className="px-6 py-4 border-b-2 border-[#141414]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[#141414]">
                    {attendance.length > 0 ? attendance.map(a => (
                      <tr key={a.id} className="text-sm">
                        <td className="px-6 py-4 font-bold">{safeFormat(a.attendance_date, 'MMM dd, yyyy')}</td>
                        <td className="px-6 py-4 font-mono text-xs">
                          {safeFormat(a.punch_in_time, 'hh:mm a')}
                        </td>
                        <td className="px-6 py-4">
                           <span className="px-2 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-black uppercase tracking-widest">
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center opacity-30 uppercase font-black tracking-widest text-xs">No attendance data</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border-2 border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] space-y-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] border-b-2 border-[#141414] pb-4">Monthly Stats</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <p className="text-[10px] font-bold uppercase opacity-40">Presence Rate</p>
                    <p className="text-2xl font-black">{Math.round((attendance.length / 30) * 100)}%</p>
                 </div>
                 <div className="w-full h-4 bg-[#f5f5f5] border-2 border-[#141414]">
                    <div className="h-full bg-blue-500 border-r-2 border-[#141414]" style={{ width: `${(attendance.length / 30) * 100}%` }}></div>
                 </div>
                 <p className="text-[10px] font-bold opacity-40 uppercase italic">Goal: 20 sessions / month</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="bg-white border-2 border-[#141414] shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]">
            <div className="p-6 border-b-2 border-[#141414] flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-[0.2em]">Add-on Services</h3>
              <Link
                to={`/members/${id}/services/add`}
                className="px-4 py-2 bg-[#141414] text-white text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
              >
                Assign Service
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f5f5f5] text-[10px] uppercase tracking-[0.2em] font-black opacity-50">
                    <th className="px-6 py-4 border-b-2 border-[#141414]">Service Name</th>
                    <th className="px-6 py-4 border-b-2 border-[#141414]">Purchase Date</th>
                    <th className="px-6 py-4 border-b-2 border-[#141414]">Amount</th>
                    <th className="px-6 py-4 border-b-2 border-[#141414]">Due</th>
                    <th className="px-6 py-4 border-b-2 border-[#141414]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#141414]">
                  {memberServices.length > 0 ? memberServices.map(ms => (
                    <tr key={ms.id} className="text-sm">
                      <td className="px-6 py-4 font-bold uppercase">{ms.services?.name}</td>
                      <td className="px-6 py-4 font-bold opacity-60">
                         {safeFormat(ms.purchase_date, 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 font-black">₹{ms.amount.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <button 
                          disabled={ms.due_amount <= 0}
                          onClick={() => {
                            setSelectedServiceData({ id: ms.id, due: ms.due_amount });
                            setIsServicePaymentModalOpen(true);
                          }}
                          className={cn(
                            "font-black text-xs hover:underline", 
                            (ms.due_amount || 0) > 0 ? "text-red-600" : "text-green-600 cursor-default"
                          )}
                        >
                          ₹{ms.due_amount || 0}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-0.5 border text-[10px] font-black uppercase tracking-widest",
                          ms.status === 'Active' ? "bg-green-100 text-green-700 border-green-200" : "bg-red-50 opacity-50"
                        )}>
                          {ms.status}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center opacity-30 uppercase font-black tracking-widest text-xs">No services assigned</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AssignPlanModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        memberId={id || ''}
        onSuccess={fetchMemberData}
      />

      <UpdateMembershipPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        memberId={id || ''}
        onSuccess={fetchMemberData}
      />

      {selectedPlanId && (
        <ChangeTrainerModal 
          isOpen={isTrainerModalOpen}
          onClose={() => setIsTrainerModalOpen(false)}
          memberPlanId={selectedPlanId}
          currentTrainerId={selectedTrainerId || undefined}
          onSuccess={fetchMemberData}
        />
      )}
      {selectedServiceData && (
        <MemberServicePaymentModal 
          isOpen={isServicePaymentModalOpen}
          onClose={() => setIsServicePaymentModalOpen(false)}
          serviceAssignmentId={selectedServiceData.id}
          currentDue={selectedServiceData.due}
          onSuccess={fetchMemberData}
        />
      )}
    </div>
  );
}
