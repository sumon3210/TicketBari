import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { AllTickets } from "./pages/AllTickets";
import { TicketDetails } from "./pages/TicketDetails";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { UserDashboard } from "./pages/UserDashboard";
import { VendorDashboard } from "./pages/VendorDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { NotFound } from "./pages/NotFound";
import { User } from "./types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Restore session & theme on initial mount
  useEffect(() => {
    const storedUser = localStorage.getItem("tb_user");
    const storedToken = localStorage.getItem("tb_token");
    const storedTheme = localStorage.getItem("tb_theme");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (err) {
        console.error("Session restore failed:", err);
        localStorage.removeItem("tb_user");
        localStorage.removeItem("tb_token");
      }
    }

    if (storedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }

    setInitialLoading(false);
  }, []);

  const toggleDarkMode = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("tb_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("tb_theme", "light");
    }
  };

  const handleLoginSuccess = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem("tb_user", JSON.stringify(newUser));
    localStorage.setItem("tb_token", newToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("tb_user");
    localStorage.removeItem("tb_token");
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Helper component to redirect logged-in users away from auth pages
  const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
    return token ? <Navigate to="/dashboard" replace /> : <>{children}</>;
  };

  // Helper component to render corresponding dashboard role panel
  const DashboardRoute = () => {
    if (!token || !user) {
      return <Navigate to="/login?redirect=/dashboard" replace />;
    }
    
    switch (user.role) {
      case "Admin":
        return <AdminDashboard user={user} token={token} />;
      case "Vendor":
        return <VendorDashboard user={user} token={token} />;
      case "User":
      default:
        return <UserDashboard user={user} token={token} onLogout={handleLogout} />;
    }
  };

  return (
    <BrowserRouter>
      {/* Absolute master wrapper layout wrapping dark mode configs */}
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 flex flex-col">
        
        {/* Dynamic Sticky Header Navigation */}
        <Navbar 
          user={user} 
          onLogout={handleLogout} 
          darkTheme={darkMode} 
          onToggleTheme={toggleDarkMode} 
        />

        {/* Content main router canvas viewport */}
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tickets" element={<AllTickets />} />
            <Route path="/ticket/:id" element={<TicketDetails user={user} token={token} />} />
            
            {/* Guarded Auth Router controls */}
            <Route 
              path="/login" 
              element={
                <PublicOnlyRoute>
                  <Login onLoginSuccess={handleLoginSuccess} />
                </PublicOnlyRoute>
              } 
            />
            
            <Route 
              path="/register" 
              element={
                <PublicOnlyRoute>
                  <Register onLoginSuccess={handleLoginSuccess} />
                </PublicOnlyRoute>
              } 
            />

            {/* Guarden Unified dashboard portal */}
            <Route path="/dashboard" element={<DashboardRoute />} />
            
            {/* Fallback 404 handler page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {/* Dynamic footer columns layout */}
        <Footer />

      </div>
    </BrowserRouter>
  );
}
