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
import Chat from "./pages/Chat";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
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
