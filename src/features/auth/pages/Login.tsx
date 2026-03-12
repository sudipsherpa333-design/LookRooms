import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Map as MapIcon, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: phone, 2: code & new pass
  const [resetPhone, setResetPhone] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(phone, password);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Login failed");
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: resetPhone }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetStep(2);
        // For demo, we show the code in the UI
        setResetSuccess(`Recovery code: ${data.recoveryCode} (Sent to your phone)`);
      } else {
        setError(data.error || "Failed to process request");
      }
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phone: resetPhone, 
          recoveryCode, 
          newPassword 
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetSuccess("Password reset successful! You can now login.");
        setTimeout(() => {
          setShowForgot(false);
          setResetStep(1);
          setResetPhone("");
          setRecoveryCode("");
          setNewPassword("");
          setResetSuccess("");
        }, 3000);
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link
            to="/"
            className="text-3xl font-bold text-emerald-600 flex items-center gap-2"
          >
            <MapIcon className="w-10 h-10" />
            KRF
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-stone-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-stone-600">
          Or{" "}
          <Link
            to="/register"
            className="font-medium text-emerald-600 hover:text-emerald-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-stone-200">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {resetSuccess && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{resetSuccess}</p>
            </div>
          )}

          {!showForgot ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-stone-700">
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="appearance-none block w-full px-3 py-3 border border-stone-300 rounded-xl shadow-sm placeholder-stone-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    placeholder="e.g., 9800000000 or 'admin9813'"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-3 border border-stone-300 rounded-xl shadow-sm placeholder-stone-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
                >
                  Forgot your password?
                </button>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400 transition-colors"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-stone-900">Reset Password</h3>
                <button 
                  onClick={() => {
                    setShowForgot(false);
                    setResetStep(1);
                    setError("");
                  }}
                  className="text-sm text-stone-500 hover:text-stone-700"
                >
                  Back to login
                </button>
              </div>

              {resetStep === 1 ? (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700">
                      Enter your phone number
                    </label>
                    <input
                      type="text"
                      required
                      value={resetPhone}
                      onChange={(e) => setResetPhone(e.target.value)}
                      className="mt-1 appearance-none block w-full px-3 py-3 border border-stone-300 rounded-xl shadow-sm placeholder-stone-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                      placeholder="9800000000"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400"
                  >
                    {loading ? "Processing..." : "Send Recovery Code"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700">
                      Recovery Code
                    </label>
                    <input
                      type="text"
                      required
                      value={recoveryCode}
                      onChange={(e) => setRecoveryCode(e.target.value)}
                      className="mt-1 appearance-none block w-full px-3 py-3 border border-stone-300 rounded-xl shadow-sm placeholder-stone-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                      placeholder="6-digit code"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1 appearance-none block w-full px-3 py-3 border border-stone-300 rounded-xl shadow-sm placeholder-stone-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                      placeholder="Min 6 characters"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400"
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              )}
            </div>
          )}

          <div className="mt-6 text-center text-xs text-stone-500">
            <p>
              Admin Login: username:{" "}
              <span className="font-mono bg-stone-100 px-1 rounded">admin9813</span>{" "}
              password:{" "}
              <span className="font-mono bg-stone-100 px-1 rounded">admin9813@#$</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
