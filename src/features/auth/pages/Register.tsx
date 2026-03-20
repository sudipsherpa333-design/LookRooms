import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Eye, EyeOff, User, Phone, Lock, ArrowRight, Home, UserCircle, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { motion } from "framer-motion";
import { Logo } from "../../../components/Logo";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"user" | "homeowner">("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await register(name, email, phone, password, role);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Left Side - Visual/Hero */}
      <div className="hidden md:flex md:w-1/2 bg-stone-900 relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=2070" 
            alt="Modern Apartment" 
            className="w-full h-full object-cover opacity-40 scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Logo size="xl" variant="white" className="mb-8" />
            <h1 className="text-5xl font-black text-white leading-tight tracking-tighter mb-6">
              Join the <span className="text-emerald-400">Future</span> of Living.
            </h1>
            <p className="text-stone-300 text-lg font-medium mb-10 leading-relaxed">
              Whether you're looking for a room or listing one, LookRooms provides the most seamless experience in Nepal.
            </p>

            <div className="space-y-4">
              {[
                "Instant Room Matching",
                "Verified User Profiles",
                "Digital Lease Agreements",
                "Community-Driven Reviews"
              ].map((feature, i) => (
                <motion.div 
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (i * 0.1) }}
                  className="flex items-center gap-3 text-white/80 font-bold text-sm uppercase tracking-widest"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  {feature}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-20 bg-[#fafaf9] relative overflow-y-auto">
        <div className="absolute top-8 left-8 md:hidden">
          <Logo size="md" />
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md py-12 md:py-0"
        >
          <div className="mb-10">
            <h2 className="text-4xl font-black text-stone-900 tracking-tight mb-3">
              Create Account
            </h2>
            <p className="text-stone-500 font-medium">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-emerald-600 hover:text-emerald-700 font-bold underline underline-offset-4 decoration-2 decoration-emerald-600/30 hover:decoration-emerald-600 transition-all"
              >
                Sign in here
              </Link>
            </p>
          </div>

          <div className="bg-white border border-stone-200 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-stone-900 font-bold placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-11 pr-4 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-stone-900 font-bold placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all sm:text-sm"
                    placeholder="Your Name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">
                  Phone Number
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-11 pr-4 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-stone-900 font-bold placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all sm:text-sm"
                    placeholder="98XXXXXXXX"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-stone-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-12 py-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-stone-900 font-bold placeholder-stone-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all sm:text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-stone-400 uppercase tracking-widest ml-1">
                  I want to...
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole("user")}
                    className={`group relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${
                      role === "user"
                        ? "border-emerald-500 bg-emerald-50/50"
                        : "border-stone-100 bg-stone-50 hover:border-stone-200"
                    }`}
                  >
                    <div className={`p-2 rounded-xl transition-colors ${role === "user" ? "bg-emerald-500 text-white" : "bg-stone-200 text-stone-500"}`}>
                      <UserCircle className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${role === "user" ? "text-emerald-700" : "text-stone-500"}`}>
                      Rent a Room
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("homeowner")}
                    className={`group relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${
                      role === "homeowner"
                        ? "border-emerald-500 bg-emerald-50/50"
                        : "border-stone-100 bg-stone-50 hover:border-stone-200"
                    }`}
                  >
                    <div className={`p-2 rounded-xl transition-colors ${role === "homeowner" ? "bg-emerald-500 text-white" : "bg-stone-200 text-stone-500"}`}>
                      <Home className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${role === "homeowner" ? "text-emerald-700" : "text-stone-500"}`}>
                      List a Room
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full group relative flex items-center justify-center py-4 px-4 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-stone-800 focus:outline-none focus:ring-4 focus:ring-stone-900/20 disabled:bg-stone-400 transition-all active:scale-[0.98] overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? "Creating Account..." : "Join LookRooms"}
                  {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-relaxed">
              By joining, you agree to our Terms of Service and Privacy Policy.
              <br />
              © 2026 LookRooms Nepal.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
