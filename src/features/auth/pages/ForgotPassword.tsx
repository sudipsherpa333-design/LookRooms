import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Map as MapIcon, Mail, Phone, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck, Lock, ArrowRight } from "lucide-react";
import OTPInput from "../../../components/auth/OTPInput";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../../../api/axiosInstance";

type Channel = 'email' | 'phone';
type Step = 1 | 2 | 3;

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>(1);
  const [channel, setChannel] = useState<Channel>('email');
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  
  const navigate = useNavigate();

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/auth/forgot-password/send-otp", { identifier, channel });
      setStep(2);
      setSuccess(res.data.message);
      setResendTimer(60);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return setError("Please enter the 6-digit code");
    
    setError("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/auth/forgot-password/verify-otp", { identifier, otp, channel });
      setResetToken(res.data.resetToken);
      setStep(3);
      setSuccess("OTP verified! Now set your new password.");
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setError("Passwords do not match");
    if (newPassword.length < 8) return setError("Password must be at least 8 characters");

    setError("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/auth/forgot-password/reset", { resetToken, newPassword });
      setSuccess("Password reset successful!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setError("");
    setLoading(true);
    try {
      const res = await axiosInstance.post("/auth/forgot-password/resend-otp", { identifier, channel });
      setSuccess("OTP resent successfully");
      setResendTimer(60);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 group"
          >
            <div className="bg-emerald-600 p-2.5 rounded-2xl shadow-lg shadow-emerald-600/20 group-hover:scale-110 transition-transform duration-300">
              <MapIcon className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-black text-stone-900 tracking-tighter uppercase">
              LookRooms
            </span>
          </Link>
          <h2 className="mt-8 text-3xl font-black text-stone-900 tracking-tight">
            Reset Password
          </h2>
          <p className="mt-3 text-stone-500 font-medium">
            Regain access to your account
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-2xl border border-white p-8 sm:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
          
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-6 bg-emerald-50 border border-emerald-100 text-emerald-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p>{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 1: Identifier Entry */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex p-1.5 bg-stone-100/50 rounded-2xl mb-8">
                <button
                  onClick={() => { setChannel('email'); setIdentifier(""); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${channel === 'email' ? 'bg-white shadow-sm text-emerald-600' : 'text-stone-400'}`}
                >
                  <Mail className="w-4 h-4" /> Email
                </button>
                <button
                  onClick={() => { setChannel('phone'); setIdentifier(""); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${channel === 'phone' ? 'bg-white shadow-sm text-emerald-600' : 'text-stone-400'}`}
                >
                  <Phone className="w-4 h-4" /> Phone
                </button>
              </div>

              <form onSubmit={handleSendOTP} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">
                    {channel === 'email' ? 'Email Address' : 'Phone Number'}
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      {channel === 'email' ? (
                        <Mail className="h-5 w-5 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
                      ) : (
                        <Phone className="h-5 w-5 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
                      )}
                    </div>
                    <input
                      type={channel === 'email' ? 'email' : 'text'}
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="block w-full pl-11 pr-4 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-stone-900 font-bold placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all sm:text-sm"
                      placeholder={channel === 'email' ? 'example@mail.com' : '98XXXXXXXX'}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full group relative flex items-center justify-center py-4 px-4 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-stone-900/20 disabled:bg-stone-400 transition-all active:scale-[0.98] overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? "Sending..." : "Send Reset Code"}
                    {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </form>
            </motion.div>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[1.5rem] mb-6 shadow-sm">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-stone-900 tracking-tight">Verify Identity</h3>
                <p className="text-stone-500 font-medium mt-2">
                  We've sent a 6-digit code to your {channel}
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-8">
                <OTPInput value={otp} onChange={setOtp} />

                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full group relative flex items-center justify-center py-4 px-4 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-stone-900/20 disabled:bg-stone-400 transition-all active:scale-[0.98] overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {loading ? "Verifying..." : "Verify Code"}
                      {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendTimer > 0 || loading}
                      className="text-xs font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 disabled:text-stone-300 transition-colors"
                    >
                      {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend Code"}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[1.5rem] mb-6 shadow-sm">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-stone-900 tracking-tight">Set New Password</h3>
                <p className="text-stone-500 font-medium mt-2">
                  Choose a strong password
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">New Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full pl-11 pr-4 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-stone-900 font-bold placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all sm:text-sm"
                        placeholder="At least 8 characters"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">Confirm Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="block w-full pl-11 pr-4 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-stone-900 font-bold placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all sm:text-sm"
                        placeholder="Repeat new password"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full group relative flex items-center justify-center py-4 px-4 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-stone-900/20 disabled:bg-stone-400 transition-all active:scale-[0.98] overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? "Updating..." : "Update Password"}
                    {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </form>
            </motion.div>
          )}

          <div className="mt-8 pt-8 border-t border-stone-100">
            <Link to="/login" className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-stone-400 hover:text-stone-600 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
