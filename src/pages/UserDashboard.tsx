import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Booking, Transaction } from "../types";
import { User as UserIcon, Keyboard, ClipboardList, CreditCard, Receipt, MapPin, Calendar, Clock, Sparkles, ShieldCheck, Check, Info, Ban, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { LoadingSpinner, MiniSpinner } from "../components/LoadingSpinner";

interface UserDashboardProps {
  user: User | null;
  token: string | null;
  onLogout: () => void;
}

export function UserDashboard({ user, token, onLogout }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "bookings" | "transactions">("profile");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Stripe simulated checkout state
  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  const [payingBooking, setPayingBooking] = useState<Booking | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Load bookings and transaction parameters
  const loadDashboardData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [bookingsRes, txRes] = await Promise.all([
        fetch("/api/bookings/my", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/transactions/my", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (bookingsRes.ok && txRes.ok) {
        const bookingsData = await bookingsRes.json();
        const txData = await txRes.json();
        setBookings(bookingsData);
        setTransactions(txData);
      }
    } catch (err) {
      console.error("Error loading user dashboard datasets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [token]);

  // Handle Booking Cancellation (Allowed before accepted)
  const handleCancelBooking = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cancellation failed");

      try {
        alert("Booking cancelled successfully.");
      } catch (e) {
        console.log("Alert blocked inside sandbox iframe: Booking cancelled successfully.");
      }
      loadDashboardData(); // Reload data
    } catch (err: any) {
      try {
        alert(err.message || "Failed to cancel booking.");
      } catch (e) {
        console.error("Failed to cancel booking:", err);
      }
    }
  };

  // Launch Stripe checkout
  const triggerStripePayment = (booking: Booking) => {
    setPayingBooking(booking);
    setCardNumber("");
    setCardExpiry("");
    setCardCvc("");
    setPaymentError(null);
    setStripeModalOpen(true);
  };

  // Secure Stripe Mock Payment Submission
  const handleStripePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingBooking || !token) return;

    if (cardNumber.length < 16 || cardExpiry.length < 5 || cardCvc.length < 3) {
      setPaymentError("Please provide correct credit card details.");
      return;
    }

    setPaymentSubmitting(true);
    setPaymentError(null);

    try {
      const response = await fetch(`/api/bookings/${payingBooking.id}/pay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          stripeToken: "tok_simulated_" + Math.random().toString(36).substr(2, 8),
          cardDetails: { number: cardNumber.substr(-4) }
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to process Stripe invoice");
      }

      // Success
      setStripeModalOpen(false);
      setPayingBooking(null);
      
      // Trigger canvas confetti celebrate!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      loadDashboardData(); // refresh lists
    } catch (err: any) {
      setPaymentError(err.message || "Payment processing error.");
    } finally {
      setPaymentSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Unauthorized Access</h2>
        <p className="text-slate-500 text-sm">Please log in to view travelers profile details.</p>
        <Link to="/login" className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold inline-block">Sign In</Link>
      </div>
    );
  }

  return (
    <div id="user-dashboard-view" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[85vh] space-y-8">
      
      {/* Title Header */}
      <div className="border-b border-slate-100 dark:border-slate-850 pb-5">
        <h1 className="text-2xl sm:text-3.5x font-display font-extrabold text-slate-905 dark:text-white leading-tight">
          Traveler Terminal
        </h1>
        <p className="text-sm text-slate-505 dark:text-slate-400 mt-0.5">
          Review reservations, submit invoices, and check historical travel transactions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side Sidebar component navigation */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4.5 rounded-2xl shadow-sm space-y-2">
          
          <button
            onClick={() => setActiveTab("profile")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "profile" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"}`}
          >
            <UserIcon className="w-4.5 h-4.5" />
            <span>My Profile Details</span>
          </button>

          <button
            onClick={() => setActiveTab("bookings")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "bookings" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"}`}
          >
            <div className="flex items-center space-x-3">
              <ClipboardList className="w-4.5 h-4.5" />
              <span>Booked Tickets</span>
            </div>
            {bookings.length > 0 && (
              <span className={`px-2 py-0.5 text-xs rounded-full ${activeTab === "bookings" ? "bg-white text-emerald-600" : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"}`}>
                {bookings.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("transactions")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${activeTab === "transactions" ? "bg-emerald-500 text-white shadow-sm" : "text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850"}`}
          >
            <Receipt className="w-4.5 h-4.5" />
            <span>Transaction Ledger</span>
          </button>

          <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-2" />

          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer text-left"
          >
            <LogOut className="w-4.5 h-4.5" />
            <span>Sign Out</span>
          </button>

        </div>

        {/* Right Side Tab views content area */}
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
                
                {/* A. TABS PROFILE DETAILS */}
                {activeTab === "profile" && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
                    <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white border-b pb-3.5 border-slate-100 dark:border-slate-850">
                      General Security Profile
                    </h2>

                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                      <img
                        src={user.profilePic}
                        alt="Security avatar"
                        className="w-24 h-24 rounded-full border-4 border-emerald-500/10 object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1.5 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">{user.name}</h3>
                          <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 font-bold text-[10px] tracking-wide rounded-full uppercase border">
                            {user.role} Acc
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-500">{user.email}</p>
                        <p className="text-xs text-slate-400">Unique Identity key: <span className="font-mono text-slate-500 select-all">{user.id}</span></p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                      <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl space-y-1.5 border">
                        <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Account Role Verified</span>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-205">Traveler (Bookings Capable)</p>
                      </div>
                      <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl space-y-1.5 border">
                        <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Operational Status</span>
                        <p className="text-sm font-semibold text-emerald-555 text-emerald-500 font-display">✓ Active (Fully Approved)</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* B. TABS BOOKED TICKETS CARD LIST */}
                {activeTab === "bookings" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2">
                      <h2 className="text-xl font-display font-extrabold text-slate-905 dark:text-white">Active Reservations</h2>
                      <span className="text-xs font-semibold text-slate-400">{bookings.length} reservations found</span>
                    </div>

                    {bookings.length === 0 ? (
                      <div className="text-center py-16 bg-white dark:bg-slate-900 border border-dashed border-slate-200 rounded-3xl space-y-4">
                        <p className="text-slate-400 dark:text-slate-550 text-sm">You haven't reserved any travel tickets yet.</p>
                        <Link to="/tickets" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg inline-block transition-all shadow-sm">Explore Active Travel Routes</Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {bookings.map((booking) => {
                          const isPending = booking.status === "Pending";
                          const isAccepted = booking.status === "Accepted";
                          const isRejected = booking.status === "Rejected";
                          const isPaid = booking.status === "Paid";
                          
                          // Departure checking
                          const depTime = new Date(booking.departureTime).getTime();
                          const isExpired = depTime < Date.now();
                          
                          const formattedDate = new Date(booking.departureTime).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          });

                          const formattedTime = new Date(booking.departureTime).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          });

                          return (
                            <div key={booking.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-805 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5">
                              
                              {/* Left detail card */}
                              <div className="flex items-start space-x-4">
                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200/40">
                                  <img
                                    src={booking.image}
                                    alt={booking.ticketTitle}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="font-display font-bold text-slate-900 dark:text-white leading-tight">{booking.ticketTitle}</h4>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                                      isPaid ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-300" :
                                      isAccepted ? "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/20 dark:text-sky-305" :
                                      isRejected ? "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/20 dark:text-red-400" :
                                      "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-955/20 dark:text-amber-305/70"
                                    }`}>
                                      {booking.status}
                                    </span>
                                  </div>
                                  
                                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center space-x-1">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Route: {booking.route}</span>
                                  </p>

                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-450 dark:text-slate-400">
                                    <span className="flex items-center space-x-1">
                                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{formattedTime}, {formattedDate}</span>
                                    </span>
                                    <span>•</span>
                                    <span>Seats Booked: <strong className="text-slate-700 dark:text-slate-300">{booking.quantity}</strong></span>
                                  </div>
                                </div>
                              </div>

                              {/* Right Pricing / Operations check columns */}
                              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 border-dashed border-slate-100 dark:border-slate-800 pt-3 md:pt-0 gap-3">
                                
                                <div className="text-left md:text-right">
                                  <span className="block text-[10px] uppercase font-bold text-slate-400">Total Price</span>
                                  <span className="text-lg font-display font-extrabold text-emerald-500 leading-tight">{booking.totalPrice} BDT</span>
                                </div>

                                {/* Stripe Payment buttons / Cancellation triggers */}
                                <div className="flex items-center space-x-2">
                                  {isPending && (
                                    <button
                                      onClick={() => handleCancelBooking(booking.id)}
                                      className="px-3.5 py-1.5 hover:bg-red-50 dark:hover:bg-red-950/25 text-red-655 dark:text-red-400 text-xs font-semibold rounded-lg border border-red-200/40 hover:border-red-500/20 transition-all cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  )}

                                  {isAccepted && !isExpired && (
                                    <button
                                      type="button"
                                      onClick={() => triggerStripePayment(booking)}
                                      className="px-4.5 py-2 bg-emerald-600 hover:bg-emerald-700 font-display text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all flex items-center space-x-1.5"
                                    >
                                      <CreditCard className="w-3.5 h-3.5" />
                                      <span>Pay Now (Stripe)</span>
                                    </button>
                                  )}

                                  {isAccepted && isExpired && (
                                    <span className="text-[10px] uppercase font-bold text-red-500 bg-red-50 border border-red-155 px-3 py-1 rounded-md">
                                      Departs (Pay Expired)
                                    </span>
                                  )}

                                  {isPaid && (
                                    <div className="flex flex-col items-end space-y-1">
                                      <span className="text-[9px] uppercase font-bold text-slate-400">TXID</span>
                                      <span className="font-mono text-xs font-bold text-slate-655 p-1 px-2.5 bg-slate-50 border rounded-lg select-all text-slate-700 dark:text-slate-300 dark:bg-slate-950">{booking.transactionId || "N/A"}</span>
                                    </div>
                                  )}

                                </div>

                              </div>

                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* C. TABS TRANSACTION HISTORIC TABLE */}
                {activeTab === "transactions" && (
                  <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
                      <h2 className="text-xl font-display font-extrabold text-slate-905 dark:text-white">Transaction History</h2>
                      <span className="text-xs font-semibold text-slate-400">{transactions.length} receipts cataloged</span>
                    </div>

                    {transactions.length === 0 ? (
                      <p className="text-center py-12 text-slate-450 text-sm">No transaction audit receipts available.</p>
                    ) : (
                      <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                          <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-850 text-xs font-display uppercase tracking-wider text-slate-400 font-bold">
                              <th className="py-3 px-4">Transaction ID</th>
                              <th className="py-3 px-4">Ticket Title</th>
                              <th className="py-3 px-4">Amount Paid</th>
                              <th className="py-3 px-4">Billing Date</th>
                              <th className="py-3 px-4 text-right">Gateway</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm divide-y divide-slate-50 dark:divide-slate-855">
                            {transactions.map((tx) => (
                              <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">
                                <td className="py-4 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400 select-all">{tx.transactionId}</td>
                                <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200">{tx.ticketTitle}</td>
                                <td className="py-4 px-4 font-bold font-display text-slate-900 dark:text-slate-100">{tx.amount} BDT</td>
                                <td className="py-4 px-4 text-slate-500 font-medium">{new Date(tx.paymentDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</td>
                                <td className="py-4 px-4 text-right">
                                  <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-150 text-indigo-650 text-[10px] font-extrabold uppercase rounded-md dark:bg-indigo-950/40 dark:text-indigo-400">Stripe</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* --- STRIPE SECURE CREDIT CARD PAYMENT MODAL --- */}
      {stripeModalOpen && payingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setStripeModalOpen(false)} />

          {/* Modal content */}
          <div className="relative w-full max-w-md bg-white dark:bg-slate-950 rounded-3xl shadow-2xl overflow-hidden border border-slate-105 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Upper details */}
            <div className="bg-slate-900 text-white p-6 relative">
              <div className="absolute right-6 top-6 text-indigo-400">
                <CreditCard className="w-10 h-10" />
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">SECURE PAYMENT INVOICE</span>
              <h3 className="text-xl font-display font-extrabold mt-1">Stripe Integrated Check</h3>
              <p className="text-xs text-slate-400 mt-2">Paying for: <strong>{payingBooking.ticketTitle}</strong> ({payingBooking.quantity} seat(s))</p>
            </div>

            <form onSubmit={handleStripePaySubmit} className="p-6 space-y-5">
              
              {paymentError && (
                <div className="p-3 bg-red-50 text-red-650 text-xs rounded-xl border border-red-155">
                  {paymentError}
                </div>
              )}

              {/* Total Summary */}
              <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border">
                <span className="text-xs text-slate-500 font-semibold uppercase font-display">Invoice Total</span>
                <span className="text-xl font-display font-extrabold text-emerald-500">{payingBooking.totalPrice} BDT</span>
              </div>

              {/* Card number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Credit Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 text-sm font-semibold rounded-xl border border-slate-202 focus:outline-none focus:border-indigo-500"
                  />
                  <CreditCard className="absolute left-4 top-3.5 w-4.5 h-4.5 text-slate-400" />
                </div>
              </div>

              {/* Expiry and Cvc row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Expiration (MM/YY)</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="12/28"
                    value={cardExpiry}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val.length === 2 && !val.includes("/")) val += "/";
                      setCardExpiry(val);
                    }}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 text-sm font-semibold rounded-xl border border-slate-202 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">CVC / Security Code</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="***"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 text-sm font-semibold rounded-xl border border-slate-202 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Pay trigger */}
              <button
                type="submit"
                disabled={paymentSubmitting}
                className="w-full py-4 bg-indigo-605 bg-indigo-650 dark:bg-indigo-600 dark:hover:bg-indigo-500 hover:bg-indigo-705 text-white font-display font-semibold rounded-2xl shadow-lg shadow-indigo-505/10 transition-all flex items-center justify-center space-x-2 text-sm cursor-pointer mt-4"
              >
                {paymentSubmitting ? (
                  <>
                    <MiniSpinner />
                    <span>Processing Stripe Secure Gateway...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />
                    <span>Confirm & Pay {payingBooking.totalPrice} BDT</span>
                  </>
                )}
              </button>

              <span className="text-[10px] text-slate-400 block text-center uppercase tracking-widest pl-1">
                🔒 Cryptographically Verified End-to-End.
              </span>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
