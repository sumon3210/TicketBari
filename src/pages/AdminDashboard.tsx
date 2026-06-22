import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Ticket } from "../types";
import { 
  Shield, Users, ClipboardList, TrendingUp, Sparkles, AlertTriangle, 
  Check, X, Megaphone, CheckCircle, Ban, ArrowUpRight, Award, Lock, ShieldAlert 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LoadingSpinner, MiniSpinner } from "../components/LoadingSpinner";

interface AdminDashboardProps {
  user: User | null;
  token: string | null;
}

export function AdminDashboard({ user, token }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "tickets" | "users" | "advertise">("profile");
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Success/Error toast-like alerts
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);
  const [alertError, setAlertError] = useState<string | null>(null);

  const loadAdminDataset = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [ticketsRes, usersRes] = await Promise.all([
        fetch("/api/admin/tickets", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (ticketsRes.ok && usersRes.ok) {
        const ticketsData = await ticketsRes.json();
        const usersData = await usersRes.json();
        setAllTickets(ticketsData);
        setAllUsers(usersData);
      }
    } catch (err) {
      console.error("Error loading central Administrator datasets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminDataset();
  }, [token]);

  // Handle Ticket Approval Action (Approve / Reject)
  const handleTicketVerification = async (ticketId: string, action: "Approve" | "Reject") => {
    if (!token) return;
    setAlertSuccess(null);
    setAlertError(null);

    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to finalize ticket approval action");
      }

      setAlertSuccess(`Ticket is set to status ${action} successfully.`);
      loadAdminDataset(); // reload lists
    } catch (err: any) {
      setAlertError(err.message || "Approval action error.");
    }
  };

  // Handle Promoting Ticket to Home Advertisements Slider
  const handleToggleAdvertisement = async (ticketId: string, currentValue: boolean) => {
    if (!token) return;
    setAlertSuccess(null);
    setAlertError(null);

    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}/advertise`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ value: !currentValue })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Configuration error");
      }

      setAlertSuccess(!currentValue ? "Route promoted to Home Slider Advertisements!" : "Removed Route from Home promotions.");
      loadAdminDataset();
    } catch (err: any) {
      setAlertError(err.message || "Home promote error details.");
    }
  };

  // Handle Modifying Registered User's Role (Make Admin / Vendor)
  const handleUserRoleShift = async (userId: string, newRole: "Admin" | "Vendor" | "User") => {
    if (!token) return;
    if (!window.confirm(`Shift role configuration of this user to ${newRole}?`)) return;

    setAlertSuccess(null);
    setAlertError(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update role profiles");
      }

      setAlertSuccess(`User role converted to ${newRole} successfully.`);
      loadAdminDataset();
    } catch (err: any) {
      setAlertError(err.message || "Role configuration modifier error.");
    }
  };

  // Handle Flagging User as Fraud (suspends account, hides listings)
  const handleToggleFraudSafety = async (userId: string, currentFraudValue: boolean) => {
    if (!token) return;
    const confirmationWord = !currentFraudValue 
      ? "MARK this account as FRAUD? All associated listings will be completely hidden from searches, and further bookings/ticket adds will be blocked."
      : "CLEAR fraud suspends flag of this account?";

    if (!window.confirm(confirmationWord)) return;

    setAlertSuccess(null);
    setAlertError(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}/fraud`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isFraud: !currentFraudValue })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to toggle security variables");
      }

      setAlertSuccess(!currentFraudValue ? "User flagged as Fraud. Listings deactivated." : "Fraud block suspended. Restored accounts permission.");
      loadAdminDataset();
    } catch (err: any) {
      setAlertError(err.message || "Deactivation error.");
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Unauthorized Access</h2>
        <p className="text-slate-500 text-sm">Please log in as an administrator.</p>
        <Link to="/login" className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold inline-block">Sign In</Link>
      </div>
    );
  }

  return (
    <div id="admin-dashboard-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[85vh] space-y-8">
      
      {/* Title Header */}
      <div className="border-b border-slate-100 dark:border-slate-850 pb-5">
        <h1 className="text-2xl sm:text-3.5x font-display font-extrabold text-slate-905 dark:text-white leading-tight">
          Administrative Terminal
        </h1>
        <p className="text-sm text-slate-505 dark:text-slate-400 mt-0.5">
          General safety control panel: approve carrier tickets, advertise featured trips, and review user reports.
        </p>
      </div>

      {/* SUCCESS / ERROR NOTIFICATION TOAST BAR */}
      <AnimatePresence>
        {alertSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 bg-emerald-100 border border-emerald-150 text-emerald-850 rounded-2xl flex items-center space-x-2 text-xs font-semibold"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-605 text-emerald-650" />
            <span>{alertSuccess}</span>
          </motion.div>
        )}

        {alertError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 bg-red-50 border border-red-150 text-red-650 rounded-2xl flex items-center space-x-2 text-xs font-semibold"
          >
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{alertError}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side Sidebar */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4.5 rounded-2xl shadow-sm space-y-2">
          
          <button
            onClick={() => {
              setActiveTab("profile");
              setAlertSuccess(null);
              setAlertError(null);
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "profile" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-600 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-855"}`}
          >
            <Shield className="w-4.5 h-4.5" />
            <span>Admin Profile</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("tickets");
              setAlertSuccess(null);
              setAlertError(null);
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "tickets" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-600 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-855"}`}
          >
            <div className="flex items-center space-x-3">
              <ClipboardList className="w-4.5 h-4.5" />
              <span>Manage Tickets</span>
            </div>
            {allTickets.filter(t => t.status === "Pending").length > 0 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500 text-white animate-pulse">
                {allTickets.filter(t => t.status === "Pending").length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab("users");
              setAlertSuccess(null);
              setAlertError(null);
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "users" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-600 dark:text-slate-355 hover:bg-slate-50"}`}
          >
            <div className="flex items-center space-x-3">
              <Users className="w-4.5 h-4.5" />
              <span>Manage Users</span>
            </div>
            <span className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-semibold">
              {allUsers.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("advertise");
              setAlertSuccess(null);
              setAlertError(null);
            }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "advertise" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-600 dark:text-slate-355 hover:bg-slate-50"}`}
          >
            <div className="flex items-center space-x-3">
              <Megaphone className="w-4.5 h-4.5" />
              <span>Advertise Tickets</span>
            </div>
            <span className="px-2 py-0.5 text-xs bg-emerald-500 text-white rounded-full font-semibold">
              {allTickets.filter(t => t.advertised && t.status === "Approved").length}/6
            </span>
          </button>

        </div>

        {/* Right Side Content Panel */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                
                {/* 1. ADMIN PROFILE */}
                {activeTab === "profile" && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
                    <h2 className="text-xl font-display font-extrabold text-slate-905 dark:text-white border-b pb-3.5">
                      System Administrative Profile
                    </h2>

                    <div className="flex items-center space-x-6">
                      <img
                        src={user.profilePic}
                        alt="Admin Profile"
                        className="w-24 h-24 rounded-full border-4 border-emerald-500/10 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-xl font-display font-bold text-slate-909 dark:text-white">{user.name}</h3>
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950 text-red-655 dark:text-red-400 text-[10px] font-extrabold uppercase rounded-full">
                            System Control
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 font-semibold">{user.email}</p>
                        <p className="text-xs text-slate-400">Database Role: <span className="font-mono text-slate-500 select-all">{user.role}</span></p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-850 pt-6">
                      <div className="p-4 bg-slate-50 dark:bg-slate-950/45 rounded-xl border space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Operational Users registered</span>
                        <span className="block text-2xl font-display font-extrabold text-slate-800 dark:text-white">{allUsers.length} accounts</span>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-950/45 rounded-xl border space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Total Route tickets cataloged</span>
                        <span className="block text-2xl font-display font-extrabold text-slate-800 dark:text-white">{allTickets.length} routes</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. MANAGE TICKETS (Approvals/Rejections) */}
                {activeTab === "tickets" && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
                    <h2 className="text-xl font-display font-extrabold text-slate-905 dark:text-white pb-3 border-b">Tickets Verification Panel</h2>

                    {allTickets.length === 0 ? (
                      <p className="text-center py-12 text-slate-450 text-sm">No ticket listings requested on the platform.</p>
                    ) : (
                      <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                          <thead>
                            <tr className="border-b border-sidebar-divider text-xs font-display uppercase text-slate-400 font-bold">
                              <th className="py-3 px-4">Operator Vendor</th>
                              <th className="py-3 px-4">Route Title</th>
                              <th className="py-3 px-4">Rate (BDT)</th>
                              <th className="py-3 px-4">Type</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4 text-right">Verification Action</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm divide-y text-slate-700 dark:text-slate-300">
                            {allTickets.map((ticket) => {
                              const isPending = ticket.status === "Pending";
                              return (
                                <tr key={ticket.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                                  <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-205">{ticket.vendorName}</td>
                                  <td className="py-4 px-4">
                                    <strong className="block text-slate-900 dark:text-white font-bold">{ticket.title}</strong>
                                    <span className="text-xs text-slate-450 dark:text-slate-500 block font-semibold">{ticket.from} ➔ {ticket.to}</span>
                                  </td>
                                  <td className="py-4 px-4 font-bold font-display">{ticket.price} BDT</td>
                                  <td className="py-4 px-4 font-medium text-amber-500">{ticket.transportType}</td>
                                  <td className="py-4 px-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                                      ticket.status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                      ticket.status === "Rejected" ? "bg-red-50 text-red-700 border-red-100" :
                                      "bg-amber-50 text-amber-700 border-amber-100"
                                    }`}>
                                      {ticket.status}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 text-right">
                                    {isPending ? (
                                      <div className="flex items-center justify-end space-x-1.5">
                                        <button
                                          onClick={() => handleTicketVerification(ticket.id, "Approve")}
                                          className="py-1 px-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-display font-semibold text-xs rounded transition-colors cursor-pointer"
                                        >
                                          Approve
                                        </button>
                                        <button
                                          onClick={() => handleTicketVerification(ticket.id, "Reject")}
                                          className="py-1 px-2.5 bg-red-600 hover:bg-red-700 text-white font-display font-semibold text-xs rounded transition-colors cursor-pointer"
                                        >
                                          Reject
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-slate-400 font-medium">Reviewed Completed</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. MANAGE USERS (Role shifts & Fraud markers) */}
                {activeTab === "users" && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
                    <h2 className="text-xl font-display font-extrabold text-slate-905 dark:text-white pb-3 border-b">Manage Verified Users Accounts</h2>

                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                          <tr className="border-b text-xs font-display uppercase text-slate-400 font-bold">
                            <th className="py-3 px-4">Real Name</th>
                            <th className="py-3 px-4">Operational Email</th>
                            <th className="py-3 px-4">Security Role</th>
                            <th className="py-3 px-4">Deactivation status</th>
                            <th className="py-3 px-4 text-right">Administrative Actions</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm divide-y text-slate-700 dark:text-slate-300">
                          {allUsers.map((item) => {
                            const isFraud = item.isFraud;
                            return (
                              <tr key={item.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors ${isFraud ? "bg-red-500/5 hover:bg-red-500/10" : ""}`}>
                                <td className="py-4 px-4 font-bold text-slate-850 dark:text-slate-100 flex items-center space-x-2">
                                  <span>{item.name}</span>
                                  {isFraud && (
                                    <span className="p-0.5 px-2 bg-red-100 text-red-705 text-[8px] font-extrabold uppercase rounded border border-red-200">
                                      Fraud Suspended
                                    </span>
                                  )}
                                </td>
                                <td className="py-4 px-4 font-mono text-xs">{item.email}</td>
                                <td className="py-4 px-4 font-semibold capitalize text-emerald-600 dark:text-emerald-400">{item.role}</td>
                                <td className="py-4 px-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isFraud ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                                    {isFraud ? "FLAGGED FRAUD" : "Secure"}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <div className="flex items-center justify-end space-x-1.5 flex-wrap gap-y-1">
                                    
                                    {/* Role conversions */}
                                    {item.role !== "Admin" && (
                                      <button
                                        onClick={() => handleUserRoleShift(item.id, "Admin")}
                                        className="py-1 px-2 border dark:border-slate-805 text-slate-500 dark:text-slate-400 hover:border-slate-900 dark:hover:border-slate-500 text-xs font-semibold rounded cursor-pointer"
                                      >
                                        Make Admin
                                      </button>
                                    )}

                                    {item.role !== "Vendor" && (
                                      <button
                                        onClick={() => handleUserRoleShift(item.id, "Vendor")}
                                        className="py-1 px-2 border dark:border-slate-805 text-slate-500 dark:text-slate-400 hover:border-slate-900 dark:hover:border-slate-500 text-xs font-semibold rounded cursor-pointer"
                                      >
                                        Make Vendor
                                      </button>
                                    )}

                                    {/* Fraud Toggle Button */}
                                    <button
                                      onClick={() => handleToggleFraudSafety(item.id, isFraud)}
                                      className={`py-1 px-2 text-xs font-semibold rounded cursor-pointer ${isFraud ? "bg-emerald-500 text-white" : "bg-red-600 text-white hover:bg-red-700"}`}
                                    >
                                      {isFraud ? "Clear Fraud Link" : "Mark FRAUD"}
                                    </button>

                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. ADVERTISE TICKETS */}
                {activeTab === "advertise" && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
                    <div className="border-b pb-3 space-y-0.5">
                      <h2 className="text-xl font-display font-extrabold text-slate-905 dark:text-white">Advertise Approved Tickets</h2>
                      <p className="text-xs text-slate-400">Promote tickets onto the home sliders. Maximum limit of 6 advertised selections is dynamically checked.</p>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                          <tr className="border-b text-xs font-display uppercase text-slate-400 font-bold">
                            <th className="py-3 px-4">Transit Title</th>
                            <th className="py-3 px-4">Operator</th>
                            <th className="py-3 px-4">Rate (BDT)</th>
                            <th className="py-3 px-4">Seating left</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Home Promotion Toggle</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm divide-y text-slate-700 dark:text-slate-300">
                          {allTickets.filter(t => t.status === "Approved").map((ticket) => {
                            const isAdvertised = ticket.advertised;
                            return (
                              <tr key={ticket.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                                <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{ticket.title}</td>
                                <td className="py-4 px-4 font-semibold text-slate-805 dark:text-slate-300">{ticket.vendorName}</td>
                                <td className="py-4 px-4 font-bold font-display">{ticket.price} BDT</td>
                                <td className="py-4 px-4 font-semibold font-display">{ticket.quantity} seats</td>
                                <td className="py-4 px-4">
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[10px] font-bold border border-emerald-100">
                                    Approved
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-right">
                                  <button
                                    onClick={() => handleToggleAdvertisement(ticket.id, isAdvertised)}
                                    className={`py-1.5 px-4 font-display font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer ${isAdvertised ? "bg-amber-500 text-white shadow-md shadow-amber-505/10" : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border dark:border-transparent"}`}
                                  >
                                    {isAdvertised ? "★ Active featured" : "Promote Slide"}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
