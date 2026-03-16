import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import ListingDetails from "./pages/ListingDetails";
import AddListing from "./pages/AddListing";
import Dashboard from "./pages/Dashboard";
import Saved from "./pages/Saved";
import Applications from "./pages/Applications";
import PaymentSuccess from "./pages/PaymentSuccess";
import AdminDashboard from "./pages/AdminDashboard";
import AgentLayout from "./components/AgentLayout";
import AgentDashboard from "./pages/agent/AgentDashboard";
import AgentListings from "./pages/agent/AgentListings";
import AgentCRM from "./pages/agent/AgentCRM";
import AgentBookings from "./pages/agent/AgentBookings";
import AgentFees from "./pages/agent/AgentFees";
import AgentAnalytics from "./pages/agent/AgentAnalytics";
import AgentProfile from "./pages/agent/AgentProfile";
import AgentReviews from "./pages/agent/AgentReviews";
import AgentSubscription from "./pages/agent/AgentSubscription";
import AgentSettings from "./pages/agent/AgentSettings";
import AgentRegistration from "./pages/agent/AgentRegistration";
import AgentPublicProfile from "./pages/agent/AgentPublicProfile";
import Chat from "./pages/Chat";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import ForgotPassword from "./features/auth/pages/ForgotPassword";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import MaintenanceRequests from "./pages/MaintenanceRequests";
import TenantManagement from "./pages/TenantManagement";
import MyMaintenance from "./pages/MyMaintenance";
import PaymentStatusPage from "./pages/PaymentStatusPage";
import ContactSupportForm from "./components/Support/ContactSupportForm";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { ChatProvider } from "./context/ChatContext";
import { LanguageProvider } from "./context/LanguageContext";
import { OnboardingWizard } from "./components/Onboarding/OnboardingWizard";
import { useState, useEffect } from "react";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Login /></motion.div>} />
        <Route path="/register" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Register /></motion.div>} />
        <Route path="/forgot-password" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ForgotPassword /></motion.div>} />
        <Route path="/" element={<Layout />}>
          <Route index element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Home /></motion.div>} />
          <Route path="listing/:id" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><ListingDetails /></motion.div>} />
          <Route path="add-listing" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><AddListing /></motion.div>} />
          <Route path="dashboard" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Dashboard /></motion.div>} />
          <Route path="saved" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Saved /></motion.div>} />
          <Route path="profile" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Profile /></motion.div>} />
          <Route path="chat" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Chat /></motion.div>} />
          <Route path="applications" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Applications /></motion.div>} />
          <Route path="support" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Support /></motion.div>} />
          <Route path="payment-success" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><PaymentSuccess /></motion.div>} />
          <Route path="payment/verify" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><PaymentStatusPage /></motion.div>} />
          <Route path="payment-status" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><PaymentStatusPage /></motion.div>} />
          <Route path="maintenance" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><MaintenanceRequests /></motion.div>} />
          <Route path="tenant-management" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><TenantManagement /></motion.div>} />
          <Route path="my-maintenance" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><MyMaintenance /></motion.div>} />
          <Route path="admin" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><AdminDashboard /></motion.div>} />
          <Route path="agent/register" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><AgentRegistration /></motion.div>} />
          <Route path="agent/:slug" element={<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><AgentPublicProfile /></motion.div>} />
        </Route>
        
        {/* Agent Routes */}
        <Route path="/agent" element={<AgentLayout />}>
          <Route path="dashboard" element={<AgentDashboard />} />
          <Route path="listings" element={<AgentListings />} />
          <Route path="crm" element={<AgentCRM />} />
          <Route path="bookings" element={<AgentBookings />} />
          <Route path="fees" element={<AgentFees />} />
          <Route path="analytics" element={<AgentAnalytics />} />
          <Route path="profile" element={<AgentProfile />} />
          <Route path="reviews" element={<AgentReviews />} />
          <Route path="subscription" element={<AgentSubscription />} />
          <Route path="settings" element={<AgentSettings />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  return (
    <LanguageProvider>
      <AuthProvider>
        <SocketProvider>
          <ChatProvider>
            <BrowserRouter>
              {showOnboarding && <OnboardingWizard onComplete={handleOnboardingComplete} />}
              <AnimatedRoutes />
              <ContactSupportForm />
            </BrowserRouter>
          </ChatProvider>
        </SocketProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
