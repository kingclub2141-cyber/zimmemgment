import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MemberList from './pages/members/MemberList';
import MemberAdd from './pages/members/MemberAdd';
import MemberEdit from './pages/members/MemberEdit';
import MemberDetails from './pages/members/MemberDetails';
import MemberPlans from './pages/members/MemberPlans';
import PaymentList from './pages/payments/PaymentList';
import AddPayment from './pages/payments/AddPayment';
import InvoiceView from './pages/payments/InvoiceView';
import DueReport from './pages/reports/DueReport';
import CollectionReport from './pages/reports/CollectionReport';
import Attendance from './pages/attendance/Attendance';
import AttendanceHistory from './pages/attendance/AttendanceHistory';
import AttendanceReport from './pages/reports/AttendanceReport';

// Expenses
import ExpenseList from './pages/expenses/ExpenseList';
import ExpenseForm from './pages/expenses/ExpenseForm';
import ExpenseCategories from './pages/expenses/ExpenseCategories';
import ExpenseReport from './pages/reports/ExpenseReport';

// Services
import ServiceList from './pages/services/ServiceList';
import ServiceForm from './pages/services/ServiceForm';
import MemberServiceAdd from './pages/members/MemberServiceAdd';

// Store & POS
import CategoryList from './pages/store/CategoryList';
import BrandList from './pages/store/BrandList';
import UnitList from './pages/store/UnitList';
import ProductList from './pages/store/ProductList';
import ProductForm from './pages/store/ProductForm';
import POS from './pages/store/POS';
import OrderList from './pages/store/OrderList';
import OrderDetails from './pages/store/OrderDetails';
import SalesReport from './pages/reports/SalesReport';

// Trainers
import TrainerList from './pages/trainers/TrainerList';
import TrainerForm from './pages/trainers/TrainerForm';
import TrainerDetails from './pages/trainers/TrainerDetails';
import TrainerPayment from './pages/trainers/TrainerPayment';
import TrainerAttendance from './pages/trainers/TrainerAttendance';
import TrainerDashboard from './pages/trainers/TrainerDashboard';
import TrainerAttendancePage from './pages/trainer/TrainerAttendancePage';

// Staff & Roles
import RoleList from './pages/staff/RoleList';
import RoleForm from './pages/staff/RoleForm';
import StaffList from './pages/staff/StaffList';
import StaffForm from './pages/staff/StaffForm';
import StaffProfile from './pages/staff/StaffProfile';
import ActivityLog from './pages/staff/ActivityLog';

// CRM / Leads
import LeadSources from './pages/crm/LeadSources';
import LeadCategories from './pages/crm/LeadCategories';
import LeadsList from './pages/crm/LeadsList';
import AddLead from './pages/crm/AddLead';
import LeadDetails from './pages/crm/LeadDetails';
import LeadDashboard from './pages/crm/LeadDashboard';

// Diet Plans
import DietTemplates from './pages/diet/DietTemplates';
import DietManagement from './pages/diet/DietManagement';
// POS / Stock
import ProductCategoryList from './pages/pos/ProductCategories';
import ProductManagement from './pages/pos/ProductManagement';
import POSBilling from './pages/pos/POSBilling';
import OrderHistory from './pages/pos/OrderHistory';

// SMS & Notifications
import SMSSettings from './pages/sms/SMSSettings';
import SMSSend from './pages/sms/SMSSend';
import SMSBulk from './pages/sms/SMSBulk';
import SMSHistory from './pages/sms/SMSHistory';
import SMSTemplates from './pages/sms/SMSTemplates';
import AutoSMSSettings from './pages/settings/AutoSMSSettings';
// Reports
import ReportsDashboard from './pages/reports/ReportsDashboard';
import ExpiryReport from './pages/reports/ExpiryReport';
import GSTReport from './pages/reports/GSTReport';
import MemberReport from './pages/reports/MemberReport';
import TrainerReport from './pages/reports/TrainerReport';
import StockReport from './pages/reports/StockReport';
import CustomReportBuilder from './pages/reports/CustomReportBuilder';
import VisitorAnalytics from './pages/reports/VisitorAnalytics';

// Visitors
import VisitorsList from './pages/visitors/VisitorsList';
import AddVisitor from './pages/visitors/AddVisitor';
import VisitorDetails from './pages/visitors/VisitorDetails';

// Global & Profile
import GlobalSearch from './pages/GlobalSearch';
import UserProfile from './pages/UserProfile';
import HelpSupport from './pages/HelpSupport';

// Settings
import GymProfile from './pages/settings/GymProfile';
import MembershipSettings from './pages/settings/MembershipSettings';
import BatchManagement from './pages/settings/BatchManagement';
import ActivityManagement from './pages/settings/ActivityManagement';
import InvoiceSettings from './pages/settings/InvoiceSettings';
import AdditionalCharges from './pages/settings/AdditionalCharges';
import AttendanceSettings from './pages/settings/AttendanceSettings';
import NotificationSettings from './pages/settings/NotificationSettings';
import BackupRestore from './pages/settings/BackupRestore';
import GeneralSettings from './pages/settings/GeneralSettings';

import PlanList from './pages/plans/PlanList';
import PlanAdd from './pages/plans/PlanAdd';
import PlanEdit from './pages/plans/PlanEdit';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import { isSupabaseConfigured } from './lib/supabase';
import { AlertCircle } from 'lucide-react';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E4E3E0]">
        <Loader2 className="animate-spin text-[#141414]" size={48} />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

// Member Pages
import MemberDashboard from './pages/member/MemberDashboard';
import MemberProfile from './pages/member/MemberProfile';
import MemberAttendancePage from './pages/member/MemberAttendance';
import MemberPlansPage from './pages/member/MemberPlans';
import MemberDietPlans from './pages/member/MemberDietPlans';
import NotificationsList from './pages/member/NotificationsList';
import MemberServices from './pages/member/MemberServices';
import MemberHelp from './pages/member/MemberHelp';
import MemberPayments from './pages/member/MemberPayments';
import StaffDashboard from './pages/staff/StaffDashboard';
import LoginGenerator from './pages/staff/LoginGenerator';

import AddUser from './pages/admin/AddUser';

import Landing from './pages/Landing';

export default function App() {
  return (
    <AuthProvider>
      <Toaster 
        position={window.innerWidth < 768 ? "bottom-center" : "top-right"} 
        expand={false} 
        richColors 
      />
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          
          {/* Admin Unified Add User */}
          <Route path="/users/add" element={<ProtectedRoute><AddUser /></ProtectedRoute>} />
          
          {/* Member Specific Routes */}
          <Route path="/member/dashboard" element={<ProtectedRoute><MemberDashboard /></ProtectedRoute>} />
          <Route path="/member/profile" element={<ProtectedRoute><MemberProfile /></ProtectedRoute>} />
          <Route path="/member/attendance" element={<ProtectedRoute><MemberAttendancePage /></ProtectedRoute>} />
          <Route path="/member/my-plans" element={<ProtectedRoute><MemberPlansPage /></ProtectedRoute>} />
          <Route path="/member/diet" element={<ProtectedRoute><MemberDietPlans /></ProtectedRoute>} />
          <Route path="/member/payments" element={<ProtectedRoute><MemberPayments /></ProtectedRoute>} />
          <Route path="/member/services" element={<ProtectedRoute><MemberServices /></ProtectedRoute>} />
          <Route path="/member/notifications" element={<ProtectedRoute><NotificationsList /></ProtectedRoute>} />
          <Route path="/member/help" element={<ProtectedRoute><MemberHelp /></ProtectedRoute>} />
          <Route path="/payments/:paymentId/invoice" element={<ProtectedRoute><InvoiceView /></ProtectedRoute>} />

        {/* Placeholder routes for menus in Sidebar */}
        <Route 
          path="/members" 
          element={
            <ProtectedRoute>
              <MemberList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/members/blocked" 
          element={
            <ProtectedRoute>
              <MemberList initialStatus="Blocked" />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/members/add" 
          element={
            <ProtectedRoute>
              <MemberAdd />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/members/:id" 
          element={
            <ProtectedRoute>
              <MemberDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/members/:id/plans" 
          element={
            <ProtectedRoute>
              <MemberPlans />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/members/:id/edit" 
          element={
            <ProtectedRoute>
              <MemberEdit />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/plans" 
          element={
            <ProtectedRoute>
              <PlanList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/plans/add" 
          element={
            <ProtectedRoute>
              <PlanAdd />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/plans/:id/edit" 
          element={
            <ProtectedRoute>
              <PlanEdit />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/payments" 
          element={
            <ProtectedRoute>
              <PaymentList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/members/:memberId/add-payment" 
          element={
            <ProtectedRoute>
              <AddPayment />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/attendance" 
          element={
            <ProtectedRoute>
              <Attendance />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/attendance/history" 
          element={
            <ProtectedRoute>
              <AttendanceHistory />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports/due" 
          element={
            <ProtectedRoute>
              <DueReport />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports/collection" 
          element={
            <ProtectedRoute>
              <CollectionReport />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports/attendance" 
          element={
            <ProtectedRoute>
              <AttendanceReport />
            </ProtectedRoute>
          } 
        />

        {/* Expenses */}
        <Route 
          path="/expenses" 
          element={
            <ProtectedRoute>
              <ExpenseList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/expenses/add" 
          element={
            <ProtectedRoute>
              <ExpenseForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/expenses/:id/edit" 
          element={
            <ProtectedRoute>
              <ExpenseForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/expenses/categories" 
          element={
            <ProtectedRoute>
              <ExpenseCategories />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports/expense" 
          element={
            <ProtectedRoute>
              <ExpenseReport />
            </ProtectedRoute>
          } 
        />

        {/* Services */}
        <Route 
          path="/services" 
          element={
            <ProtectedRoute>
              <ServiceList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/services/add" 
          element={
            <ProtectedRoute>
              <ServiceForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/services/:id/edit" 
          element={
            <ProtectedRoute>
              <ServiceForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/members/:memberId/services/add" 
          element={
            <ProtectedRoute>
              <MemberServiceAdd />
            </ProtectedRoute>
          } 
        />

        {/* Store & POS */}
        <Route 
          path="/pos" 
          element={
            <ProtectedRoute>
              <POS />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/products" 
          element={
            <ProtectedRoute>
              <ProductList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/products/add" 
          element={
            <ProtectedRoute>
              <ProductForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/products/:id/edit" 
          element={
            <ProtectedRoute>
              <ProductForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/categories" 
          element={
            <ProtectedRoute>
              <CategoryList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/brands" 
          element={
            <ProtectedRoute>
              <BrandList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/units" 
          element={
            <ProtectedRoute>
              <UnitList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders" 
          element={
            <ProtectedRoute>
              <OrderList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orders/:id" 
          element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports/sales" 
          element={
            <ProtectedRoute>
              <SalesReport />
            </ProtectedRoute>
          } 
        />

        {/* Trainers */}
        <Route 
          path="/trainer/dashboard" 
          element={
            <ProtectedRoute>
              <TrainerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/trainers" 
          element={
            <ProtectedRoute>
              <TrainerList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/trainers/add" 
          element={
            <ProtectedRoute>
              <TrainerForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/trainers/:id/edit" 
          element={
            <ProtectedRoute>
              <TrainerForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/trainers/:id" 
          element={
            <ProtectedRoute>
              <TrainerDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/trainers/:id/payments" 
          element={
            <ProtectedRoute>
              <TrainerPayment />
            </ProtectedRoute>
          } 
        />
        <Route path="/trainer/attendance" element={<ProtectedRoute><TrainerAttendancePage /></ProtectedRoute>} />
        <Route path="/trainers/attendance" element={<ProtectedRoute><TrainerAttendance /></ProtectedRoute>} />

        {/* Staff & Roles */}
        <Route path="/roles" element={<ProtectedRoute><RoleList /></ProtectedRoute>} />
        <Route path="/roles/add" element={<ProtectedRoute><RoleForm /></ProtectedRoute>} />
        <Route path="/roles/:id/edit" element={<ProtectedRoute><RoleForm /></ProtectedRoute>} />
        <Route path="/staff/dashboard" element={<ProtectedRoute><StaffDashboard /></ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute><StaffList /></ProtectedRoute>} />
        <Route path="/staff/login-generator" element={<ProtectedRoute><LoginGenerator /></ProtectedRoute>} />
        <Route path="/staff/add" element={<ProtectedRoute><StaffForm /></ProtectedRoute>} />
        <Route path="/staff/:id/edit" element={<ProtectedRoute><StaffForm /></ProtectedRoute>} />
        <Route path="/staff/profile" element={<ProtectedRoute><StaffProfile /></ProtectedRoute>} />
        <Route path="/staff/activity-log" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />

        {/* CRM / Leads */}
        <Route path="/crm" element={<ProtectedRoute><LeadDashboard /></ProtectedRoute>} />
        <Route path="/leads" element={<ProtectedRoute><LeadsList /></ProtectedRoute>} />
        <Route path="/leads/add" element={<ProtectedRoute><AddLead /></ProtectedRoute>} />
        <Route path="/leads/:id" element={<ProtectedRoute><LeadDetails /></ProtectedRoute>} />
        <Route path="/leads/:id/edit" element={<ProtectedRoute><AddLead /></ProtectedRoute>} />
        <Route path="/lead-sources" element={<ProtectedRoute><LeadSources /></ProtectedRoute>} />
        <Route path="/lead-categories" element={<ProtectedRoute><LeadCategories /></ProtectedRoute>} />

        {/* Diet System */}
        <Route path="/diet" element={<ProtectedRoute><DietManagement /></ProtectedRoute>} />
        <Route path="/diet-templates" element={<ProtectedRoute><DietTemplates /></ProtectedRoute>} />

        {/* POS / Store */}
        <Route path="/pos/billing" element={<ProtectedRoute><POSBilling /></ProtectedRoute>} />
        <Route path="/pos/products" element={<ProtectedRoute><ProductManagement /></ProtectedRoute>} />
        <Route path="/pos/categories" element={<ProtectedRoute><ProductCategoryList /></ProtectedRoute>} />
        <Route path="/pos/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />

        {/* SMS & Notifications */}
        <Route path="/sms/send" element={<ProtectedRoute><SMSSend /></ProtectedRoute>} />
        <Route path="/sms/bulk" element={<ProtectedRoute><SMSBulk /></ProtectedRoute>} />
        <Route path="/sms/history" element={<ProtectedRoute><SMSHistory /></ProtectedRoute>} />
        <Route path="/sms/templates" element={<ProtectedRoute><SMSTemplates /></ProtectedRoute>} />

        {/* Visitors */}
        <Route path="/visitors" element={<ProtectedRoute><VisitorsList /></ProtectedRoute>} />
        <Route path="/visitors/add" element={<ProtectedRoute><AddVisitor /></ProtectedRoute>} />
        <Route path="/visitors/:id" element={<ProtectedRoute><VisitorDetails /></ProtectedRoute>} />
        <Route path="/visitors/:id/edit" element={<ProtectedRoute><AddVisitor /></ProtectedRoute>} />

        {/* Reports */}
        <Route path="/reports" element={<ProtectedRoute><ReportsDashboard /></ProtectedRoute>} />
        <Route path="/reports/collection" element={<ProtectedRoute><CollectionReport /></ProtectedRoute>} />
        <Route path="/reports/due" element={<ProtectedRoute><DueReport /></ProtectedRoute>} />
        <Route path="/reports/expiry" element={<ProtectedRoute><ExpiryReport /></ProtectedRoute>} />
        <Route path="/reports/attendance" element={<ProtectedRoute><AttendanceReport /></ProtectedRoute>} />
        <Route path="/reports/sales" element={<ProtectedRoute><SalesReport /></ProtectedRoute>} />
        <Route path="/reports/expense" element={<ProtectedRoute><ExpenseReport /></ProtectedRoute>} />
        <Route path="/reports/gst" element={<ProtectedRoute><GSTReport /></ProtectedRoute>} />
        <Route path="/reports/members" element={<ProtectedRoute><MemberReport /></ProtectedRoute>} />
        <Route path="/reports/trainers" element={<ProtectedRoute><TrainerReport /></ProtectedRoute>} />
        <Route path="/reports/stock" element={<ProtectedRoute><StockReport /></ProtectedRoute>} />
        <Route path="/reports/builder" element={<ProtectedRoute><CustomReportBuilder /></ProtectedRoute>} />
        <Route path="/reports/visitors" element={<ProtectedRoute><VisitorAnalytics /></ProtectedRoute>} />

        {/* Settings */}
        <Route path="/settings/profile" element={<ProtectedRoute><GymProfile /></ProtectedRoute>} />
        <Route path="/settings/membership" element={<ProtectedRoute><MembershipSettings /></ProtectedRoute>} />
        <Route path="/settings/batches" element={<ProtectedRoute><BatchManagement /></ProtectedRoute>} />
        <Route path="/settings/activities" element={<ProtectedRoute><ActivityManagement /></ProtectedRoute>} />
        <Route path="/settings/invoice" element={<ProtectedRoute><InvoiceSettings /></ProtectedRoute>} />
        <Route path="/settings/charges" element={<ProtectedRoute><AdditionalCharges /></ProtectedRoute>} />
        <Route path="/settings/attendance" element={<ProtectedRoute><AttendanceSettings /></ProtectedRoute>} />
        <Route path="/settings/notifications" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
        <Route path="/settings/sms" element={<ProtectedRoute><SMSSettings /></ProtectedRoute>} />
        <Route path="/settings/auto-sms" element={<ProtectedRoute><AutoSMSSettings /></ProtectedRoute>} />
        <Route path="/settings/backup" element={<ProtectedRoute><BackupRestore /></ProtectedRoute>} />
        <Route path="/settings/general" element={<ProtectedRoute><GeneralSettings /></ProtectedRoute>} />

        {/* Global Access */}
        <Route path="/search" element={<ProtectedRoute><GlobalSearch /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><HelpSupport /></ProtectedRoute>} />
      </Routes>
    </Router>
    </AuthProvider>
  );
}
