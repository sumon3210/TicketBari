import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ChevronLeft, MapPin, Calendar, Users, DollarSign, Clock, ShieldCheck, ClipboardList, Info, Sparkles } from "lucide-react";
import { Ticket, User } from "../types";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { BookingModal } from "../components/BookingModal";

interface TicketDetailsProps {
  user: User | null;
  token: string | null;
}

export function TicketDetails({ user, token }: TicketDetailsProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Countdown State
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false
  });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/tickets/${id}`);
        if (!res.ok) {
          throw new Error("Failed to load details for this ticket. It might have been deleted.");
        }
        const data = await res.json();
        setTicket(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong loading route details.");
      } finally {
        setLoading(false);
      }
    };
    fetchTicketDetails();
  }, [id]);

  // Handle Countdown calculations dynamically
  useEffect(() => {
    if (!ticket) return;

    const departureTime = new Date(ticket.departureTime).getTime();

    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = departureTime - now;

      if (difference <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setCountdown({ days, hours, minutes, seconds, expired: false });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [ticket]);

  const handleBookingSubmit = async (quantity: number) => {
    if (!token) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    setBookingSuccess(null);
    setBookingError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticketId: ticket?.id, quantity }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to finalize booking");
      }

      setBookingSuccess("Your seat reservation request has been transmitted! Please wait for vendor approval.");
      
      // Update local quantity display dynamically
      if (ticket) {
        // Wait, booking starts as Pending, ticket quantity is NOT reduced until users pay!
        // So we keep the ticket quantity as is, which is perfect and fits the guidelines.
      }
    } catch (err: any) {
      setBookingError(err.message || "Unable to process ticket reservation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBookNowTriggerClick = () => {
    if (!token) {
      navigate("/login?redirect=" + encodeURIComponent(`/ticket/${ticket?.id}`));
      return;
    }
    setModalOpen(true);
  };

  if (loading) return <LoadingSpinner />;

  if (error || !ticket) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-6">
        <div className="p-4 bg-red-50 text-red-650 rounded-full inline-block">
          <Info className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-display font-medium text-slate-900 dark:text-white">Route Coordinates Blank</h2>
        <p className="text-slate-500 text-sm">{error || "This specific ticket has been removed from records."}</p>
        <Link
          to="/tickets"
          className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Exit to Inventory</span>
        </Link>
      </div>
    );
  }

  const isExpired = countdown.expired;
  const isSoldOut = ticket.quantity <= 0;
  const isBlocked = isExpired || isSoldOut;

  const formattedDate = new Date(ticket.departureTime).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = new Date(ticket.departureTime).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div id="ticket-details-frame" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-[80vh]">
      
      {/* Return to catalogs slider link */}
      <div>
        <Link
          to="/tickets"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-emerald-500 transition-colors bg-white dark:bg-slate-900 px-3.5 py-2 border rounded-xl"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Exit to All Travel Tickets</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Picture and Detail facts descriptions */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white dark:bg-slate-900/40 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
            
            {/* Banner picture height styled */}
            <div className="relative aspect-[21/9] w-full bg-slate-100">
              <img
                src={ticket.image}
                alt={ticket.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-950/20" />
            </div>

            {/* Core facts description details */}
            <div className="p-6 md:p-8 space-y-6">
              
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-650 dark:text-emerald-450 border border-emerald-250/30 text-xs uppercase font-extrabold tracking-wider rounded-md">
                    {ticket.transportType} Choice
                  </span>
                  <h1 className="text-2xl sm:text-3.5x font-display font-extrabold text-slate-905 dark:text-light leading-snug">
                    {ticket.title}
                  </h1>
                </div>

                <div className="text-right">
                  <span className="block text-xs uppercase tracking-widest text-slate-400 font-semibold font-display">Ticket Cost</span>
                  <span className="text-3xl font-display font-extrabold text-emerald-500">{ticket.price} BDT</span>
                </div>
              </div>

              {/* Transit stations parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-950/50 p-6 rounded-2xl border border-slate-150 dark:border-slate-800">
                
                <div className="space-y-1">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">From Station</span>
                  <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-100 font-semibold">
                    <MapPin className="w-5 h-5 text-emerald-500" />
                    <span>{ticket.from}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">To Destination</span>
                  <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-100 font-semibold">
                    <MapPin className="w-5 h-5 text-emerald-500" />
                    <span>{ticket.to}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Departure Date</span>
                  <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-100 font-semibold">
                    <Calendar className="w-5 h-5 text-sky-500" />
                    <span className="truncate">{formattedTime}, {formattedDate}</span>
                  </div>
                </div>

              </div>

              {/* Carrier Perks lists tags */}
              <div className="space-y-3">
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Included Carrier Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {ticket.perks && ticket.perks.length > 0 ? (
                    ticket.perks.map((perk, index) => (
                      <span key={index} className="px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-100 dark:border-emerald-950">
                        ✓ {perk}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">Standard transit amenities loaded</span>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* Guidelines details sheet */}
          <div className="bg-white dark:bg-slate-900/40 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center space-x-2">
              <ClipboardList className="w-5.5 h-5.5 text-emerald-500" />
              <span>General Terms & Booking Regulations</span>
            </h3>
            
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-350 list-disc pl-5 leading-relaxed">
              <li>
                <strong>Reservation Validation:</strong> Booking submitted begins as <strong>Pending</strong>. Standard transit vendors approve or reject based on seat layout configurations.
              </li>
              <li>
                <strong>Secure Payments:</strong> Once approved, the traveler has until departure date & time to submit Stripe payment checks securely.
              </li>
              <li>
                <strong>Ticket Issuance:</strong> Instant ticket receipts with dynamic Transaction identifiers are generated right after payment cycles clear.
              </li>
              <li>
                <strong>Refund Guidelines:</strong> Double-check dates before reservations. Cancel options are strictly active before vendor approval is received.
              </li>
            </ul>
          </div>

        </div>

        {/* Right Column: Checkout triggers & Countdowns */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 2. DEPARTURE COUNTDOWN WIDGET */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
            
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block text-center">Departure Countdown</span>
              <h3 className="text-sm font-semibold text-slate-500 text-center">This trip is leaving in:</h3>
            </div>

            {isExpired ? (
              <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-center font-display font-bold text-lg rounded-xl border border-red-100/50">
                🛑 DEPATURE PERIOD ELAPSED
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2.5 text-center">
                
                {/* Days */}
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-105 dark:border-slate-850/60">
                  <span className="block font-display font-bold text-2xl text-slate-850 dark:text-white">{countdown.days}</span>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Days</span>
                </div>

                {/* Hours */}
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-105 dark:border-slate-850/60">
                  <span className="block font-display font-bold text-2xl text-slate-850 dark:text-white">{countdown.hours}</span>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Hrs</span>
                </div>

                {/* Minutes */}
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-105 dark:border-slate-850/60">
                  <span className="block font-display font-bold text-2xl text-slate-850 dark:text-white">{countdown.minutes}</span>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Mins</span>
                </div>

                {/* Seconds */}
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-105 dark:border-slate-850/60 transition-all">
                  <span className="block font-display font-bold text-2xl text-emerald-500 animate-pulse">{countdown.seconds}</span>
                  <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Secs</span>
                </div>

              </div>
            )}

          </div>

          {/* 3. RESERVE TRIGGERS CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-md space-y-6">
            
            <div className="space-y-3.5 border-b border-slate-100 dark:border-slate-850 pb-4">
              <span className="block text-xs uppercase text-slate-400 tracking-wider">Transit Information</span>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Carrier Operator</span>
                <span className="text-slate-800 dark:text-white font-bold">{ticket.vendorName}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Available Seating</span>
                <span className={`font-bold ${isSoldOut ? "text-red-500" : "text-slate-850 dark:text-slate-150"}`}>
                  {isSoldOut ? "Sold Out" : `${ticket.quantity} seat(s) left`}
                </span>
              </div>
            </div>

            {/* Book Now trigger button / Disable cases */}
            <button
              onClick={handleBookNowTriggerClick}
              disabled={isBlocked}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-100 dark:disabled:bg-slate-850 disabled:text-slate-400 dark:disabled:text-slate-500 text-white font-display font-bold rounded-2xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 disabled:shadow-none transition-all duration-200 text-center tracking-wide block cursor-pointer"
            >
              {isExpired ? "Booking Time Passed" : isSoldOut ? "Schedules Sold Out" : "Book Seats Now"}
            </button>

            {!token && (
              <span className="text-[10px] text-slate-400 block text-center font-semibold uppercase tracking-wider">
                🔒 Authentication is required to complete reservation.
              </span>
            )}

          </div>

          {/* Trust points banner */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-900/60 dark:to-slate-900/30 p-5 rounded-2xl border border-emerald-100/30 dark:border-slate-800 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200">100% Secure Transaction</h4>
              <p className="text-[11px] text-slate-500 leading-normal">
                Payments verified by standard cryptographic encryptions. No storage of billing coordinates.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Booking Modal sheet */}
      {ticket && (
        <BookingModal
          ticket={ticket}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleBookingSubmit}
          isSubmitting={isSubmitting}
          successMessage={bookingSuccess}
          errorMessage={bookingError}
        />
      )}

    </div>
  );
}
