import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Bus, Train, Menu, X, ChevronDown, User, LogOut, Sun, Moon, LayoutDashboard, Shield, Landmark } from "lucide-react";
import { User as UserType } from "../types";

interface NavbarProps {
  user: UserType | null;
  onLogout: () => void;
  darkTheme: boolean;
  onToggleTheme: () => void;
}

export function Navbar({ user, onLogout, darkTheme, onToggleTheme }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menus on path changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const getDashboardPath = () => {
    return "/dashboard";
  };

  const isActive = (path: string) => {
    return location.pathname === path ? "text-emerald-500 dark:text-emerald-400 font-semibold" : "text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400";
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass border-b border-slate-200/80 dark:border-slate-800/80 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18">
          
          {/* Logo Name & Icon */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="flex items-center justify-center bg-emerald-500 text-white p-2 rounded-xl shadow-md group-hover:bg-emerald-600 transition-colors">
                <Bus className="w-5 h-5" />
              </div>
              <span className="font-display font-extrabold text-2xl tracking-tight bg-gradient-to-r from-slate-900 to-emerald-650 dark:from-white dark:to-emerald-400 bg-clip-text text-transparent">
                Ticket<span className="text-emerald-500 dark:text-emerald-400">Bari</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`font-medium transition-colors text-sm ${isActive("/")}`}>
              Home
            </Link>
            <Link to="/tickets" className={`font-medium transition-colors text-sm ${isActive("/tickets")}`}>
              All Tickets
            </Link>
            
            {user && (
              <Link to={getDashboardPath()} className={`font-medium transition-colors text-sm flex items-center space-x-1 ${isActive(getDashboardPath())}`}>
                <span>Dashboard</span>
              </Link>
            )}

            {/* Dark/Light mode toggle button */}
            <button
              onClick={onToggleTheme}
              className="p-2 mr-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title={darkTheme ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkTheme ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
            </button>

            {/* Authentication user state items */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2.5 p-1 px-2.5 hover:bg-slate-150/40 dark:hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-200/50 dark:hover:border-slate-700/60 transition-all cursor-pointer"
                >
                  <img
                    src={user.profilePic}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-emerald-500/35 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left">
                    <span className="block text-sm font-semibold max-w-[120px] truncate text-slate-800 dark:text-slate-200 leading-none">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-emerald-500 dark:text-emerald-400 uppercase font-bold tracking-widest">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Card */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-950 rounded-xl shadow-xl border border-slate-150 dark:border-slate-800/80 py-2 animate-in fade-in slide-in-from-top-3 duration-150">
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-850">
                      <span className="block text-xs text-slate-400 uppercase tracking-widest font-semibold">Logged in as</span>
                      <span className="block text-sm font-semibold text-slate-700 dark:text-slate-305 truncate">{user.email}</span>
                    </div>

                    <Link
                      to={`${getDashboardPath()}#profile`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      <User className="w-4.5 h-4.5 text-slate-400" />
                      <span>My Profile</span>
                    </Link>

                    <Link
                      to={getDashboardPath()}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-slate-650 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      <LayoutDashboard className="w-4.5 h-4.5 text-slate-400" />
                      <span>Dashboard Home</span>
                    </Link>

                    <div className="border-t border-slate-100 dark:border-slate-850 my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        onLogout();
                        setDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors font-medium text-left cursor-pointer"
                    >
                      <LogOut className="w-4.5 h-4.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4.5 py-2 rounded-xl shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Menu & Theme (Mobile view) */}
          <div className="flex md:hidden items-center space-x-4">
            <button
              onClick={onToggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              {darkTheme ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Slide list menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-b border-slate-250 dark:border-slate-850 px-4 pt-2 pb-6 space-y-3 shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200"
          >
            Home
          </Link>
          <Link
            to="/tickets"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200"
          >
            All Tickets
          </Link>

          {user && (
            <Link
              to={getDashboardPath()}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200"
            >
              Dashboard ({user.role})
            </Link>
          )}

          <div className="border-t border-slate-100 dark:border-slate-850 my-2 pt-2" />

          {user ? (
            <div className="space-y-3 px-3">
              <div className="flex items-center space-x-3 py-2">
                <img
                  src={user.profilePic}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border object-cover"
                />
                <div>
                  <span className="block font-semibold text-slate-800 dark:text-slate-100">{user.name}</span>
                  <span className="text-xs text-slate-400">{user.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to={`${getDashboardPath()}#profile`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-250 rounded-lg text-sm font-semibold"
                >
                  <User className="w-4 h-4" />
                  <span>My Profile</span>
                </Link>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center space-x-1.5 py-2 px-3 bg-red-50 dark:bg-red-950/25 text-red-600 dark:text-red-400 rounded-lg text-sm font-semibold cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 px-3 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl text-center font-semibold text-sm border"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center py-2.5 bg-emerald-605 text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl text-center font-semibold text-sm shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
