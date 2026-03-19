import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Map as MapIcon, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
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

    const result = await register(name, phone, password, role);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error || "Registration failed");
    }
    setLoading(false);
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
          Create a new account
        </h2>
        <p className="mt-2 text-center text-sm text-stone-600">
          Or{" "}
          <Link
            to="/login"
            className="font-medium text-emerald-600 hover:text-emerald-500"
          >
            sign in to your account
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

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-stone-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-stone-300 rounded-xl shadow-sm placeholder-stone-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  placeholder="e.g., Ram Bahadur"
                />
              </div>
            </div>

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
                  placeholder="e.g., 9800000000"
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

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`py-3 px-4 border rounded-xl text-sm font-medium transition-colors ${
                    role === "user"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  Renter
                </button>
                <button
                  type="button"
                  onClick={() => setRole("homeowner")}
                  className={`py-3 px-4 border rounded-xl text-sm font-medium transition-colors ${
                    role === "homeowner"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : "border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  Home Owner
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:bg-emerald-400 transition-colors"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
