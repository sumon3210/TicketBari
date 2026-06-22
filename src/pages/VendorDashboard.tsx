import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Ticket, Booking } from "../types";
import { 
  PlusCircle, LayoutList, Calendar, MapPin, Ticket as TktIcon,
  Tag, ClipboardList, TrendingUp, RefreshCw, BarChart3, Users, DollarSign,
  Briefcase, CheckCircle, Ban, Hourglass, Trash2, Edit2, ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area 
} from "recharts";
import { LoadingSpinner, MiniSpinner } from "../components/LoadingSpinner";

interface VendorDashboardProps {
  user: User | null;
  token: string | null;
}

export function VendorDashboard({ user, token }: VendorDashboardProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "add" | "added" | "requested" | "revenue">("profile");
  const [vendorTickets, setVendorTickets] = useState<Ticket[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [revenueData, setRevenueData] = useState<{
    totalTicketsAdded: number;
    totalTicketsSold: number;
    totalRevenue: number;
    categoryChartData: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Add/Update Ticket Form State
  const [editTicketId, setEditTicketId] = useState<string | null>(null); // null means adding new ticket
  const [title, setTitle] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [transportType, setTransportType] = useState<"Bus" | "Train" | "Launch" | "Plane">("Bus");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [perks, setPerks] = useState("");
  const [image, setImage] = useState("");
  
  // Submit Form variables
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const loadVendorData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [ticketsRes, bookingsRes, revRes] = await Promise.all([
        fetch("/api/vendor/tickets", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/bookings/requested", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/vendor/revenue", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (ticketsRes.ok && bookingsRes.ok && revRes.ok) {
        const ticketsData = await ticketsRes.json();
        const bookingsData = await bookingsRes.json();
        const revData = await revRes.json();
        
        setVendorTickets(ticketsData);
        setBookings(bookingsData);
        setRevenueData(revData);
      }
    } catch (err) {
      console.error("Error loading vendor datasets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendorData();
  }, [token]);

  // Handle Add/Update form submissions
  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsFormSubmitting(true);
    setFormSuccess(null);
    setFormError(null);

    const payload = {
      title,
      from,
      to,
      transportType,
      price: Number(price),
      quantity: Number(quantity),
      departureTime,
      perks,
      image,
    };

    try {
      const url = editTicketId ? `/api/tickets/${editTicketId}` : "/api/tickets";
      const method = editTicketId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to submit ticket details");
      }

      setFormSuccess(editTicketId ? "Ticket coordinates updated successfully. Sent for Admin verification!" : "New trip listed as Pending. Sent for Administrative approval!");
      
      // Reset Form fields
      if (!editTicketId) {
        setTitle("");
        setFrom("");
        setTo("");
        setPrice("");
        setQuantity("");
        setDepartureTime("");
        setPerks("");
        setImage("");
      }

      // Reload dataset
      loadVendorData();
    } catch (err: any) {
      setFormError(err.message || "Ticketing configuration error.");
    } finally {
      setIsFormSubmitting(false);
    }
  };

  // Populate form for editing
  const handleEditTrigger = (ticket: Ticket) => {
    if (ticket.status === "Rejected") {
      alert("Rejected tickets cannot be updated. Under administrative lock.");
      return;
    }
    setEditTicketId(ticket.id);
    setTitle(ticket.title);
    setFrom(ticket.from);
    setTo(ticket.to);
    setTransportType(ticket.transportType);
    setPrice(String(ticket.price));
    setQuantity(String(ticket.quantity));
    setDepartureTime(ticket.departureTime.slice(0, 16)); // ISO datetime-local matching
    setPerks(ticket.perks.join(", "));
    setImage(ticket.image);
    
    setFormSuccess(null);
    setFormError(null);
    setActiveTab("add"); // switch to form tab
  };

  // Handle Delete Ticket
  const handleDeleteTicket = async (ticketId: string, status: string) => {
    if (status === "Rejected") {
      alert("Rejected tickets cannot be deleted.");
      return;
    }
    if (!window.confirm("Are you sure you want to completely delete this ticket? All associated booking status will be affected.")) return;

    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Deletion failed");

      alert("Ticket deleted successfully.");
      loadVendorData();
    } catch (err: any) {
      alert(err.message || "Failed to delete ticket.");
    }
  };

  // Handle Booking Review Action (Accept / Reject)
  const handleBookingAction = async (bookingId: string, action: "Accept" | "Reject") => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to review action code");
      }

      try {
        alert(`Booking request has been ${action}ed!`);
      } catch (e) {
        console.log(`Alert blocked inside sandbox iframe: Booking request has been ${action}ed.`);
      }
      loadVendorData();
    } catch (err: any) {
      try {
        alert(err.message || "Booking action error.");
      } catch (e) {
        console.error("Booking action error:", err);
      }
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Unauthorized Access</h2>
        <p className="text-slate-500 text-sm">Please log in to view Vendor controls.</p>
        <Link to="/login" className="px-5 py-2.5 bg-emerald-605 bg-emerald-600 text-white rounded-xl text-sm font-semibold inline-block">Sign In</Link>
      </div>
    );
  }

  // Check if Account Suspended (isFraud check)
  if (user.isFraud) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center space-y-6">
        <div className="p-4 bg-red-50 text-red-650 rounded-full inline-block">
          <ShieldAlert className="w-16 h-16" />
        </div>
        <h2 className="text-3xl font-display font-bold text-slate-900">Operations Suspended</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Your vendor account has been flagged for fraudulent activity by the system administrators. All your listed tickets are hidden and added/update actions are locked. Contact ticketing security at support@ticketbari.com.
        </p>
      </div>
    );
  }

  return (
    <div id="vendor-dashboard-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[85vh] space-y-8">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 border-b border-slate-100 dark:border-slate-850 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3.5x font-display font-extrabold text-slate-905 dark:text-white leading-tight">
            Vendor Portal
          </h1>
          <p className="text-sm text-slate-505 dark:text-slate-400 mt-0.5">
            Operational dashboard for carrier transit providers: manage seat inventories, accept reservation logs, and view sales spreadsheets.
          </p>
        </div>
        
        <button
          onClick={() => {
            setEditTicketId(null);
            setTitle("");
            setFrom("");
            setTo("");
            setPrice("");
            setQuantity("");
            setDepartureTime("");
            setPerks("");
            setImage("");
            setFormSuccess(null);
            setFormError(null);
            setActiveTab("add");
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-sm cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Ticket</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side Sidebar */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4.5 rounded-2xl shadow-sm space-y-2">
          
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "profile" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-600 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-850"}`}
          >
            <Briefcase className="w-4.5 h-4.5" />
            <span>Vendor Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("add")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "add" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-600 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-855"}`}
          >
            <PlusCircle className="w-4.5 h-4.5" />
            <span>{editTicketId ? `Updating ID ${editTicketId.slice(4)}` : "Add Ticket Setup"}</span>
          </button>

          <button
            onClick={() => setActiveTab("added")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "added" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-600 dark:text-slate-355 hover:bg-slate-50"}`}
          >
            <div className="flex items-center space-x-3">
              <LayoutList className="w-4.5 h-4.5" />
              <span>Added Seat Listings</span>
            </div>
            {vendorTickets.length > 0 && (
              <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === "added" ? "bg-white text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}>
                {vendorTickets.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("requested")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "requested" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-600 dark:text-slate-355 hover:bg-slate-50"}`}
          >
            <div className="flex items-center space-x-3">
              <Users className="w-4.5 h-4.5" />
              <span>Requested Bookings</span>
            </div>
            {bookings.length > 0 && (
              <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === "requested" ? "bg-white text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}>
                {bookings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("revenue")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "revenue" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-600 dark:text-slate-355 hover:bg-slate-50"}`}
          >
            <TrendingUp className="w-4.5 h-4.5" />
            <span>Revenue Overview</span>
          </button>

        </div>

        {/* Right Side Views Content Panel */}
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
                
                {/* 1. VENDOR PROFILE */}
                {activeTab === "profile" && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
                    <h2 className="text-xl font-display font-extrabold text-slate-900 dark:text-white border-b pb-3.5 border-slate-100 dark:border-slate-850">
                      Operator Logistics Profile
                    </h2>

                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                      <img
                        src={user.profilePic}
                        alt="Vendor representation logo"
                        className="w-24 h-24 rounded-full border-4 border-emerald-500/15 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1 text-center sm:text-left">
                        <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">{user.name}</h3>
                        <p className="text-sm text-slate-500 font-semibold">{user.email}</p>
                        <span className="inline-flex px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-305 text-xs uppercase font-extrabold tracking-widest rounded-lg border mt-2">
                          Verified Transit Provider
                        </span>
                      </div>
                    </div>

                    {/* Operator quick stats */}
                    {revenueData && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-slate-100 dark:border-slate-850 pt-6">
                        
                        <div className="p-4 bg-slate-50 dark:bg-slate-950/45 rounded-xl space-y-1 border">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Listed Routes</span>
                          <span className="block text-2xl font-display font-extrabold text-slate-800 dark:text-white">
                            {revenueData.totalTicketsAdded} paths
                          </span>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-950/45 rounded-xl space-y-1 border">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Reserved Seats Sold</span>
                          <span className="block text-2xl font-display font-extrabold text-emerald-555 text-emerald-500">
                            {revenueData.totalTicketsSold} seats
                          </span>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-950/45 rounded-xl space-y-1 border">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Aggregated Earnings</span>
                          <span className="block text-2xl font-display font-extrabold text-emerald-600">
                            {revenueData.totalRevenue} BDT
                          </span>
                        </div>

                      </div>
                    )}
                  </div>
                )}

                {/* 2. ADD / UPDATE TICKET FORM */}
                {activeTab === "add" && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
                    <div className="border-b border-slate-100 dark:border-slate-850 pb-3.5">
                      <h2 className="text-xl font-display font-extrabold text-slate-905 dark:text-white">
                        {editTicketId ? `Modify Seat Flight/Route ID: ${editTicketId.slice(4)}` : "Configure New Travel Ticket"}
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">Status of travel ticket will start as Pending matching regulatory standards.</p>
                    </div>

                    {/* Success/Error displays */}
                    {formError && (
                      <div className="p-3 bg-red-50 text-red-655 text-xs rounded-xl border border-red-155">
                        {formError}
                      </div>
                    )}

                    {formSuccess && (
                      <div className="p-4 bg-emerald-55 border border-emerald-150 text-emerald-700 text-xs rounded-xl flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="font-semibold">{formSuccess}</span>
                      </div>
                    )}

                    <form onSubmit={handleTicketSubmit} className="space-y-5">
                      
                      {/* Ticket Title */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Ticket / Transit Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Green Line Sleeper Scania"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-150 text-sm font-semibold rounded-xl border border-slate-205 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {/* Stations From and To */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Departing Station (From)</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Dhaka"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-150 text-sm font-semibold rounded-xl border border-slate-205 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Arrival Terminal (To)</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Cox's Bazar"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-150 text-sm font-semibold rounded-xl border border-slate-205 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Transport type selector & Prices & Seats */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Carrier Type</label>
                          <select
                            value={transportType}
                            onChange={(e) => setTransportType(e.target.value as any)}
                            className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-150 text-sm font-semibold rounded-xl border border-slate-205 focus:outline-none focus:border-emerald-500 cursor-pointer"
                          >
                            <option value="Bus">Bus</option>
                            <option value="Train">Train</option>
                            <option value="Launch">Launch</option>
                            <option value="Plane">Plane</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Price (BDT)</label>
                          <input
                            type="number"
                            required
                            min={1}
                            placeholder="e.g. 1500"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-150 text-sm font-semibold rounded-xl border border-slate-205 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Available Seats Quantity</label>
                          <input
                            type="number"
                            required
                            min={1}
                            placeholder="e.g. 40"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-150 text-sm font-semibold rounded-xl border border-slate-205 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Departure Date Time */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Departure Date & Time</label>
                        <input
                          type="datetime-local"
                          required
                          value={departureTime}
                          onChange={(e) => setDepartureTime(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-150 text-sm font-semibold rounded-xl border border-slate-205 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {/* Perks tag text inputs */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Amenties / Perks (Comma Separated)</label>
                        <input
                          type="text"
                          placeholder="AC Sleeper, Free Wifi, Power Port, Blanket"
                          value={perks}
                          onChange={(e) => setPerks(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-150 text-sm font-semibold rounded-xl border border-slate-205 focus:outline-none focus:border-emerald-500"
                        />
                        <span className="text-[10px] text-slate-400 block px-1">Write perks separated by commas to register them.</span>
                      </div>

                      {/* Custom Image URL matching standard IMG BB */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Image URL (e.g. imgbb/unsplash)</label>
                        <input
                          type="url"
                          placeholder="https://i.ibb.co/... (Leave blank for default transport image)"
                          value={image}
                          onChange={(e) => setImage(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-150 text-sm font-semibold rounded-xl border border-slate-205 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {/* READONLY VENDOR NAME & EMAIL CREDENTIALS */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/20 p-4.5 rounded-2xl border">
                        <div className="space-y-1">
                          <span className="block text-[10px] uppercase font-bold text-slate-400">Vendor Operator (Readonly)</span>
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-300 block">{user.name}</span>
                        </div>

                        <div className="space-y-1">
                          <span className="block text-[10px] uppercase font-bold text-slate-400">Operator Email (Readonly)</span>
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-300 block">{user.email}</span>
                        </div>
                      </div>

                      {/* Submit form buttons */}
                      <div className="flex items-center space-x-3 pt-3">
                        <button
                          type="submit"
                          disabled={isFormSubmitting}
                          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-semibold rounded-xl shadow-md cursor-pointer transition-all flex items-center space-x-2"
                        >
                          {isFormSubmitting ? <MiniSpinner /> : (
                            <>
                              <span>{editTicketId ? "Update Configuration" : "Publish Sea listings"}</span>
                            </>
                          )}
                        </button>

                        {editTicketId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditTicketId(null);
                              setTitle("");
                              setFrom("");
                              setTo("");
                              setPrice("");
                              setQuantity("");
                              setDepartureTime("");
                              setPerks("");
                              setImage("");
                              setFormSuccess(null);
                              setFormError(null);
                            }}
                            className="px-5 py-3 bg-white border rounded-xl font-semibold text-slate-700 text-sm cursor-pointer"
                          >
                            Cancel Editing
                          </button>
                        )}
                      </div>

                    </form>
                  </div>
                )}

                {/* 3. MY ADDED TICKETS */}
                {activeTab === "added" && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-display font-extrabold text-slate-905 dark:text-white">Listed Transit Inventory</h2>

                    {vendorTickets.length === 0 ? (
                      <p className="text-center py-16 bg-white border border-dashed rounded-3xl text-sm text-slate-450 dark:bg-slate-900 border-slate-705">No listings added by your transport division.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {vendorTickets.map((ticket) => {
                          const isPending = ticket.status === "Pending";
                          const isApproved = ticket.status === "Approved";
                          const isRejected = ticket.status === "Rejected";

                          const formattedDate = new Date(ticket.departureTime).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                          const formattedTime = new Date(ticket.departureTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

                          return (
                            <div key={ticket.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-805 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between h-full">
                              
                              <div className="p-5 space-y-4">
                                <div className="flex justify-between items-start">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border ${
                                    isApproved ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400" :
                                    isRejected ? "bg-red-50 text-red-700 border-red-105 dark:bg-red-955/20 dark:text-red-400" :
                                    "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-955/20 dark:text-amber-400"
                                  }`}>
                                    {ticket.status}
                                  </span>

                                  <span className="text-amber-500 text-xs font-display font-medium px-2 py-0.5 bg-slate-50 dark:bg-slate-950 border rounded">
                                    {ticket.transportType} Choice
                                  </span>
                                </div>

                                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white leading-tight">{ticket.title}</h3>

                                <div className="space-y-1 px-3 py-2 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100">
                                  <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold">{ticket.from} ➔ {ticket.to}</p>
                                  <p className="text-xs text-slate-450 dark:text-slate-400">Departs: {formattedTime}, {formattedDate}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-xs">
                                  <div>
                                    <span className="block text-slate-400 uppercase font-bold text-[9px]">Rate standard</span>
                                    <strong className="text-emerald-500 font-display font-bold text-sm">{ticket.price} BDT</strong>
                                  </div>
                                  <div>
                                    <span className="block text-slate-400 uppercase font-bold text-[9px]">Left Seats</span>
                                    <strong className="text-slate-800 dark:text-slate-200 font-display font-bold text-sm">{ticket.quantity} seats</strong>
                                  </div>
                                </div>
                              </div>

                              {/* Action buttons (Disabled for Rejected) */}
                              <div className="bg-slate-50 dark:bg-slate-950/30 p-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handleEditTrigger(ticket)}
                                  disabled={isRejected}
                                  className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-100 disabled:opacity-50 inline-flex items-center space-x-1 cursor-pointer"
                                  title={isRejected ? "Rejected listing is locked" : "Modify settings"}
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span>Update</span>
                                </button>

                                <button
                                  onClick={() => handleDeleteTicket(ticket.id, ticket.status)}
                                  disabled={isRejected}
                                  className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-lg text-xs font-bold text-red-600 dark:text-red-405 hover:bg-red-50/20 disabled:opacity-50 inline-flex items-center space-x-1 cursor-pointer"
                                  title={isRejected ? "Rejected listing cannot be deleted" : "Remove path"}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. REQUESTED BOOKINGS */}
                {activeTab === "requested" && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
                    <h2 className="text-xl font-display font-extrabold text-slate-905 dark:text-white pb-2 border-b">Requested Booking Ledger</h2>

                    {bookings.length === 0 ? (
                      <p className="text-center py-12 text-slate-450 text-sm">No travelers booking request listed at this moment.</p>
                    ) : (
                      <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                          <thead>
                            <tr className="border-b border-slate-100 text-xs font-display uppercase text-slate-400 font-bold">
                              <th className="py-3 px-4">User Details</th>
                              <th className="py-3 px-4">Ticket Path</th>
                              <th className="py-3 px-4">Quantity Requested</th>
                              <th className="py-3 px-4">Total Billing</th>
                              <th className="py-3 px-4">Status</th>
                              <th className="py-3 px-4 text-right">Operational Review</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm divide-y text-slate-700 dark:text-slate-300">
                            {bookings.map((booking) => {
                              const isPending = booking.status === "Pending";
                              return (
                                <tr key={booking.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                                  <td className="py-4 px-4">
                                    <strong className="block text-slate-850 dark:text-slate-100 font-bold">{booking.userName}</strong>
                                    <span className="text-xs text-slate-450 dark:text-slate-500 block font-semibold">{booking.userEmail}</span>
                                  </td>
                                  <td className="py-4 px-4 font-semibold">{booking.ticketTitle}</td>
                                  <td className="py-4 px-4 font-semibold font-display">{booking.quantity} seats</td>
                                  <td className="py-4 px-4 font-bold text-emerald-500 font-display">{booking.totalPrice} BDT</td>
                                  <td className="py-4 px-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                                      booking.status === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                      booking.status === "Accepted" ? "bg-sky-50 text-sky-700 border-sky-100" :
                                      booking.status === "Rejected" ? "bg-red-50 text-red-700 border-red-100" :
                                      "bg-amber-50 text-amber-700 border-amber-100"
                                    }`}>
                                      {booking.status}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 text-right">
                                    {isPending ? (
                                      <div className="flex items-center justify-end space-x-1.5">
                                        <button
                                          onClick={() => handleBookingAction(booking.id, "Accept")}
                                          className="py-1 px-2.5 bg-emerald-100 dark:bg-emerald-950/30 walk-trigger text-emerald-750 text-emerald-600 font-display font-semibold text-xs rounded hover:bg-emerald-200 transition-colors cursor-pointer"
                                        >
                                          Accept
                                        </button>
                                        <button
                                          onClick={() => handleBookingAction(booking.id, "Reject")}
                                          className="py-1 px-2.5 bg-red-50 dark:bg-red-950/30 text-red-750 text-red-605 font-display font-semibold text-xs rounded hover:bg-red-100 transition-colors cursor-pointer"
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

                {/* 5. REVENUE OVERVIEW STATS & CHARTS */}
                {activeTab === "revenue" && revenueData && (
                  <div className="space-y-6">
                    
                    {/* Insights stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      
                      <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl flex items-center space-x-4">
                        <div className="p-3.5 bg-amber-50 dark:bg-amber-950/25 text-amber-500 rounded-xl">
                          <LayoutList className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Paths Registered</span>
                          <span className="text-2xl font-display font-extrabold text-slate-800 dark:text-white">{revenueData.totalTicketsAdded}</span>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl flex items-center space-x-4">
                        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/25 text-emerald-505 rounded-xl">
                          <TktIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Tickets Cleared</span>
                          <span className="text-2xl font-display font-extrabold text-slate-805 dark:text-white">{revenueData.totalTicketsSold}</span>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-slate-900 border p-6 rounded-2xl flex items-center space-x-4">
                        <div className="p-3.5 bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 rounded-xl">
                          <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Total Revenue Earned</span>
                          <span className="text-2xl font-display font-extrabold text-emerald-500">{revenueData.totalRevenue} BDT</span>
                        </div>
                      </div>

                    </div>

                    {/* Integrated Recharts plots representation */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
                      <div className="border-b pb-3.5 space-y-0.5">
                        <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Earnings & Inventory Metric Breakdown</h3>
                        <p className="text-xs text-slate-400">Seats configuration added and total revenues cleared partitioned down by transit classification.</p>
                      </div>

                      <div className="h-80 w-full pt-4">
                        <ResponsiveContainer width="100%" height="105%">
                          <BarChart
                            data={revenueData.categoryChartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                            <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                            <YAxis yAxisId="left" orientation="left" stroke="#888888" fontSize={11} label={{ value: 'Seats Count', angle: -90, position: 'insideLeft', offset: -5 }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} label={{ value: 'Revenue (BDT)', angle: 90, position: 'insideRight', offset: 15 }} />
                            <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px', color: '#ffffff' }} />
                            <Legend />
                            <Bar yAxisId="left" dataKey="seatsAdded" name="Seats Supplied" fill="#818cf8" radius={[4, 4, 0, 0]} />
                            <Bar yAxisId="right" dataKey="revenue" name="Revenue Accumulated" fill="#10b981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
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
