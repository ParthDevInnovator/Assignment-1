import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Store, Lock, Mail, User as UserIcon, MapPin, ArrowRight, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";

interface SignupPageProps {
  onNavigateToLogin: () => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigateToLogin }) => {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isNameValid = name.length >= 20 && name.length <= 60;
  const isAddressValid = address.length > 0 && address.length <= 400;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;
  const isPasswordValid = passwordRegex.test(password);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isNameValid) {
      setError("Name must be between 20 and 60 characters.");
      return;
    }

    if (!isEmailValid) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isAddressValid) {
      setError("Address cannot exceed 400 characters.");
      return;
    }

    if (!isPasswordValid) {
      setError(
        "Password must be 8-16 characters long and contain at least one uppercase letter and one special character."
      );
      return;
    }

    try {
      setLoading(true);
      await register({ name, email, password, address });
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center px-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-cyan-400 text-white shadow-xl shadow-brand-500/25 mb-3">
          <Store className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Create Normal User Account
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Join our community to discover stores, rate local businesses, and leave reviews
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-white/20">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Full Name (20 - 60 chars)
                </label>
                <span
                  className={`text-xs font-semibold ${
                    isNameValid ? "text-emerald-600" : "text-slate-400"
                  }`}
                >
                  {name.length}/60 chars
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jonathan Alexander Higgins"
                  required
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
                    name.length > 0 && !isNameValid
                      ? "border-amber-300 bg-amber-50/30 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      : "border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Must be at least 20 characters and at most 60 characters.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="reviewer@example.com"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Address (Max 400 chars)
                </label>
                <span className="text-xs font-semibold text-slate-400">
                  {address.length}/400
                </span>
              </div>
              <div className="relative">
                <div className="absolute top-3 left-3.5 flex items-start pointer-events-none text-slate-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 High Street, Downtown District, City, State"
                  maxLength={400}
                  required
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm transition-all resize-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8-16 chars, 1 uppercase, 1 special char"
                  required
                  className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none ${
                    password.length > 0 && !isPasswordValid
                      ? "border-amber-300 bg-amber-50/30 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                      : "border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  }`}
                />
              </div>
              <div className="mt-1.5 flex flex-wrap gap-2 text-[11px] text-slate-500">
                <span className={`inline-flex items-center gap-1 ${password.length >= 8 && password.length <= 16 ? "text-emerald-600 font-semibold" : ""}`}>
                  • 8-16 chars
                </span>
                <span className={`inline-flex items-center gap-1 ${/[A-Z]/.test(password) ? "text-emerald-600 font-semibold" : ""}`}>
                  • 1 uppercase letter
                </span>
                <span className={`inline-flex items-center gap-1 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) ? "text-emerald-600 font-semibold" : ""}`}>
                  • 1 special symbol
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? "Creating Account..." : "Create Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onNavigateToLogin}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Already registered? Sign in instead</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
