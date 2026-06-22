import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn, ArrowRight, Chrome, ShieldAlert, Sparkles, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import { User } from "../types";
import { MiniSpinner } from "../components/LoadingSpinner";

interface LoginProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [roleSelection, setRoleSelection] = useState<"User" | "Vendor" | "Admin">("User");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Helper code to handle credentials prefill for fast recruitment review!
  const handleQuickPrefill = (role: "User" | "Vendor" | "Admin") => {
    setRoleSelection(role);
    if (role === "Admin") {
      setEmail("admin@ticketbari.com");
      setPassword("12345678");
    } else if (role === "Vendor") {
      setEmail("shohagh@ticketbari.com");
      setPassword("12345678");
    } else {
      setEmail("infosumon15@gmail.com");
      setPassword(""); // Password remains empty so they can type their custom registered password
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill out all credentials fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to log in");
      }

      // Success
      onLoginSuccess(data.user, data.token);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Something went wrong during validation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simulated Google Social Authentication
  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Send a gorgeous, structured mock google profile
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Guest Explorer",
          email: "googleuser@ticketbari.com",
          googleId: "g_" + Math.random().toString().substr(2, 6),
          imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed Google sign in");
      }

      onLoginSuccess(data.user, data.token);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Google Social auth error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 py-12 bg-slate-50 dark:bg-slate-950/30 transition-colors duration-300">
      
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
        
        {/* Banner info */}
        <div className="bg-emerald-600 dark:bg-emerald-600 p-6 px-8 text-white relative">
          <div className="absolute right-6 top-6 opacity-15">
            <Sparkles className="w-16 h-16" />
          </div>
          <h2 className="text-2xl font-display font-bold">Welcome Back</h2>
          <p className="text-emerald-100 text-sm mt-1">Access your TicketBari booking schedules</p>
        </div>

        <div className="p-8 space-y-6">
          
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-950/50 text-red-650 dark:text-red-400 text-xs rounded-xl border border-red-100 dark:border-red-950/40">
              <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Prefills for Recruiters */}
          <div className="bg-slate-50 dark:bg-slate-955 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-205 dark:border-slate-800/80 space-y-3">
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest text-center">
              Recruiter Quick Credentials Prefill
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickPrefill("User")}
                className="py-1.5 px-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold shadow-sm border border-slate-150 hover:border-emerald-500 hover:text-emerald-500 transition-all cursor-pointer"
              >
                Regular User
              </button>
              <button
                type="button"
                onClick={() => handleQuickPrefill("Vendor")}
                className="py-1.5 px-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold shadow-sm border border-slate-150 hover:border-emerald-500 hover:text-emerald-500 transition-all cursor-pointer"
              >
                Shohagh (Vendor)
              </button>
              <button
                type="button"
                onClick={() => handleQuickPrefill("Admin")}
                className="py-1.5 px-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold shadow-sm border border-slate-150 hover:border-emerald-500 hover:text-emerald-500 transition-all cursor-pointer"
              >
                Central Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 text-sm rounded-xl border border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-550 focus:outline-none transition-all text-slate-850 dark:text-slate-150"
                />
                <Mail className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-405 text-slate-400" />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-slate-950 text-sm rounded-xl border border-slate-200 dark:border-slate-800 focus:border-emerald-500 dark:focus:border-emerald-555 focus:outline-none transition-all text-slate-850 dark:text-slate-150"
                />
                <Lock className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 cursor-pointer focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-850 text-white font-display font-semibold rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center space-x-2 text-sm mt-2"
            >
              {isSubmitting ? <MiniSpinner /> : (
                <>
                  <span>Sign In</span>
                  <LogIn className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Google Divider */}
          <div className="relative flex items-center justify-center py-2">
            <div className="absolute w-full border-t border-slate-150 dark:border-slate-800" />
            <span className="relative bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 uppercase tracking-widest">
              Or continue with BetterAuth
            </span>
          </div>

          {/* Single-tap Mock Google Social authentication */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-xl font-medium text-slate-700 dark:text-slate-300 transition-all flex items-center justify-center space-x-2.5 text-sm cursor-pointer"
          >
            <Chrome className="w-4.5 h-4.5 text-red-500" />
            <span>Instant Google Sign In</span>
          </button>

          {/* Redirection */}
          <p className="text-center text-xs text-slate-450 pt-2">
            Don't have an account yet?{" "}
            <Link to="/register" className="text-emerald-500 font-semibold hover:underline">
              Create an account
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}
