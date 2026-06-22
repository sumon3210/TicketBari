import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, UserCheck, Sparkles, ShieldAlert } from "lucide-react";
import { User as UserType } from "../types";
import { MiniSpinner } from "../components/LoadingSpinner";

interface RegisterProps {
  onLoginSuccess: (user: UserType, token: string) => void;
}

export function Register({ onLoginSuccess }: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"User" | "Vendor">("User");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all registration fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to register account");
      }

      // Success, auto login
      onLoginSuccess(data.user, data.token);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Registration failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 py-12 bg-slate-50 dark:bg-slate-950/30 transition-colors duration-300">
      
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
        
        {/* Banner Details */}
        <div className="bg-emerald-600 dark:bg-emerald-650 p-6 px-8 text-white relative">
          <div className="absolute right-6 top-6 opacity-15">
            <Sparkles className="w-16 h-16" />
          </div>
          <h2 className="text-2xl font-display font-bold">Create Account</h2>
          <p className="text-emerald-100 text-sm mt-1">Get tickets to your destinations in a few clicks</p>
        </div>

        <div className="p-8 space-y-6">

          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-950/55 text-red-655 dark:text-red-400 text-xs rounded-xl border border-red-100 dark:border-red-950/30">
              <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-550 uppercase block">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Mohammad Sumon"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 text-sm rounded-xl border border-slate-200 dark:border-slate-800 focus:border-emerald-500 pr-10 focus:outline-none transition-all text-slate-850 dark:text-slate-150"
                />
                <User className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-400" />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-550 uppercase block">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 text-sm rounded-xl border border-slate-200 dark:border-slate-800 focus:border-emerald-500 pr-10 focus:outline-none transition-all text-slate-850 dark:text-slate-150"
                />
                <Mail className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-400" />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-550 uppercase block font-sans">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 text-sm rounded-xl border border-slate-200 dark:border-slate-800 focus:border-emerald-500 pr-10 focus:outline-none transition-all text-slate-850 dark:text-slate-150"
                />
                <Lock className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-400" />
              </div>
              <span className="text-[10px] text-slate-400 block px-1">Must be at least 6 characters long.</span>
            </div>

            {/* Role Selection */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-550 uppercase tracking-wide block">Are you a Traveler or a transport Vendor?</label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex items-center justify-center p-3.5 border rounded-xl cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all ${role === "User" ? "border-emerald-500 bg-emerald-50/15 text-emerald-500" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"}`}>
                  <input
                    type="radio"
                    name="role"
                    value="User"
                    checked={role === "User"}
                    onChange={() => setRole("User")}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <span className="block font-display font-bold text-sm">Traveler</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Discover & book tickets</span>
                  </div>
                </label>

                <label className={`flex items-center justify-center p-3.5 border rounded-xl cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all ${role === "Vendor" ? "border-emerald-500 bg-emerald-50/15 text-emerald-500" : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"}`}>
                  <input
                    type="radio"
                    name="role"
                    value="Vendor"
                    checked={role === "Vendor"}
                    onChange={() => setRole("Vendor")}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <span className="block font-display font-bold text-sm">Transit Vendor</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Sell & manage tickets</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-850 text-white font-display font-semibold rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center space-x-2 text-sm mt-4"
            >
              {isSubmitting ? <MiniSpinner /> : (
                <>
                  <span>Create Account</span>
                  <UserCheck className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </form>

          {/* Redirection */}
          <p className="text-center text-xs text-slate-450 pt-1">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-500 font-semibold hover:underline">
              Sign In instead
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
}
