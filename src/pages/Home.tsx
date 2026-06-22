import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, MapPin, Bus, Shield, HeartHandshake, Compass, Users, Clock, Award, Star, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Ticket } from "../types";
import { TicketCard } from "../components/TicketCard";
import { LoadingSpinner } from "../components/LoadingSpinner";

// Slide contents for manual/automatic hero carousel
const HERO_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1200",
    title: "Eco-Friendly Scenic Bus Journeys",
    subtitle: "Ride in luxury AC sleeper buses connecting major cities smoothly."
  },
  {
    image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&q=80&w=1200",
    title: "Scenic Train Explorations",
    subtitle: "Relax on comfortable express trains across stunning historic routes."
  },
  {
    image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=1200",
    title: "Premium Launch Cruises",
    subtitle: "Experience majestic rivers on deluxe double cabins cruising till dawn."
  },
  {
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=1200",
    title: "Express Airborne Pathways",
    subtitle: "Fly top standard airlines in comfort with rapid check-in counters."
  }
];

export function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [transportFilter, setTransportFilter] = useState("All");
  
  const [advertisedTickets, setAdvertisedTickets] = useState<Ticket[]>([]);
  const [latestTickets, setLatestTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  // Handle slide transitions automatically every 5s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  // Fetch Advertised and Latest tickets
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [advRes, latRes] = await Promise.all([
          fetch("/api/tickets/advertised"),
          fetch("/api/tickets/latest")
        ]);

        if (advRes.ok && latRes.ok) {
          const advData = await advRes.json();
          const latData = await latRes.json();
          setAdvertisedTickets(advData);
          setLatestTickets(latData);
        }
      } catch (err) {
        console.error("Error loading homepage elements:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/tickets?from=${encodeURIComponent(searchFrom)}&to=${encodeURIComponent(searchTo)}&transportType=${encodeURIComponent(transportFilter)}`);
  };

  const handleCardDetailsRedirect = (ticket: Ticket) => {
    navigate(`/ticket/${ticket.id}`);
  };

  return (
    <div id="home-view-container" className="space-y-16 pb-20">
      
      {/* 1. HERO SLIDER SCREEN & INTEGRATED SEARCH WIDGET */}
      <div className="relative w-full h-[520px] md:h-[600px] overflow-hidden bg-slate-950">
        
        {/* Background slide images */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.55, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 w-full h-full"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/60 to-transparent z-10" />
            <img
              src={HERO_SLIDES[currentSlide].image}
              alt="Holiday scenery slider"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Sliding Dot indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${currentSlide === index ? "bg-emerald-500 w-6" : "bg-white/40"}`}
            />
          ))}
        </div>

        {/* Hero Slider text overlays */}
        <div className="absolute inset-0 flex items-center z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl text-left space-y-4 md:space-y-6">
              <span className="inline-flex px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs uppercase tracking-widest font-bold rounded-full">
                ★ Smooth Journeys Guaranteed
              </span>
              <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-[1.1] leading-tight">
                {HERO_SLIDES[currentSlide].title}
              </h1>
              <p className="text-slate-200 text-sm sm:text-base md:text-lg max-w-md font-sans">
                {HERO_SLIDES[currentSlide].subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Embedded floating search panel widget */}
        <div className="absolute bottom-[-100px] left-0 right-0 hidden md:block z-20">
          <div className="max-w-4xl mx-auto px-4">
            <form 
              onSubmit={handleSearchSubmit}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 grid grid-cols-4 gap-4 items-center"
            >
              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">From Location</span>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Dhaka"
                    value={searchFrom}
                    onChange={(e) => setSearchFrom(e.target.value)}
                    className="w-full py-2 bg-transparent text-sm focus:outline-none focus:border-b border-slate-200 font-semibold text-slate-800 dark:text-slate-200 h-10 pl-6"
                  />
                  <MapPin className="absolute left-0 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">To Destination</span>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cox's Bazar"
                    value={searchTo}
                    onChange={(e) => setSearchTo(e.target.value)}
                    className="w-full py-2 bg-transparent text-sm focus:outline-none focus:border-b border-slate-200 font-semibold text-slate-800 dark:text-slate-200 h-10 pl-6"
                  />
                  <MapPin className="absolute left-0 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transport Type</span>
                <select
                  value={transportFilter}
                  onChange={(e) => setTransportFilter(e.target.value)}
                  className="w-full py-2 bg-transparent text-sm focus:outline-none focus:border-b border-slate-205 font-semibold text-slate-700 dark:text-slate-300 h-10 cursor-pointer"
                >
                  <option value="All">All Transport</option>
                  <option value="Bus">Bus</option>
                  <option value="Train">Train</option>
                  <option value="Launch">Launch</option>
                  <option value="Plane">Plane</option>
                </select>
              </div>

              <button
                type="submit"
                className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-md shadow-emerald-500/10 cursor-pointer transition-all"
              >
                <Search className="w-4.5 h-4.5" />
                <span>Search Tickets</span>
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Mobile standalone search form widget */}
      <div className="md:hidden px-4 md:px-0">
        <form 
          onSubmit={handleSearchSubmit}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-lg border border-slate-150 dark:border-slate-800 space-y-4"
        >
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1">Departing From</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Going from"
                value={searchFrom}
                onChange={(e) => setSearchFrom(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:border-emerald-500 text-sm font-semibold"
              />
              <MapPin className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1">Arriving At</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Going to"
                value={searchTo}
                onChange={(e) => setSearchTo(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:border-emerald-500 text-sm font-semibold"
              />
              <MapPin className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1">Transit Choice</label>
            <select
              value={transportFilter}
              onChange={(e) => setTransportFilter(e.target.value)}
              className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-sm font-semibold text-slate-705"
            >
              <option value="All">All Transport</option>
              <option value="Bus">Bus</option>
              <option value="Train">Train</option>
              <option value="Launch">Launch</option>
              <option value="Plane">Plane</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-emerald-600 text-white rounded-xl font-semibold shadow-sm flex items-center justify-center space-x-2"
          >
            <Search className="w-5 h-5" />
            <span>Search PATHS</span>
          </button>
        </form>
      </div>

      {/* Spacing adjustments for the floating widget on desktop */}
      <div className="hidden md:block h-10" />

      {/* 2. ADVERTISEMENTS SECTION (Exactly 6 tickets selected by Admin) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 border-b border-slate-100 dark:border-slate-850 pb-5">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-500 block">Featured Journeys</span>
            <h2 className="text-2xl sm:text-3.5x font-display font-extrabold text-slate-900 dark:text-white mt-1">
              Top Advertised Selections
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-sm">
            Handpicked premium transport services highly recommended for speed, relaxation and comfort.
          </p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : advertisedTickets.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-3xl">
            <p className="text-slate-450 dark:text-slate-500 text-sm">No tickets currently promoted by administrator.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {advertisedTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onSeeDetails={handleCardDetailsRedirect}
              />
            ))}
          </div>
        )}
      </div>

      {/* 3. LATEST TICKETS (Recent 6-8 tickets) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 border-b border-slate-100 dark:border-slate-850 pb-5">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-500 block">Recent Additions</span>
            <h2 className="text-2xl sm:text-3.5x font-display font-extrabold text-slate-900 dark:text-white mt-1">
              Latest Tickets Added
            </h2>
          </div>
          <Link
            to="/tickets"
            className="inline-flex items-center space-x-1 text-sm font-semibold text-emerald-500 hover:text-emerald-600 cursor-pointer"
          >
            <span>View All Tickets</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : latestTickets.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-200 rounded-3xl">
            <p className="text-slate-450 dark:text-slate-500 text-sm">No travel tickets cataloged at this moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {latestTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onSeeDetails={handleCardDetailsRedirect}
              />
            ))}
          </div>
        )}
      </div>

      {/* 4. ADDITIONAL SECTION 1: POPULAR ROUTES IN BANGLADESH */}
      <div className="bg-slate-50 dark:bg-slate-950/40 py-16 transition-colors duration-305">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-555 text-emerald-500">Fast Pathways</span>
            <h2 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">
              Most Popular Travel Routes
            </h2>
            <p className="text-slate-500 text-sm">
              Discover tickets on Bangladesh's most heavily traversed transit corridors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Route Card 1 (Dhaka to Cox's) */}
            <div 
              onClick={() => navigate("/tickets?from=Dhaka&to=Cox's")}
              className="group bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-500/20 cursor-pointer transition-all"
            >
              <div className="relative h-32 rounded-xl overflow-hidden mb-4">
                <img
                  src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=200"
                  alt="Cox's Bazar Sea beach"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-950/25" />
              </div>
              <h4 className="font-display font-semibold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">Dhaka ➔ Cox's Bazar</h4>
              <p className="text-xs text-slate-400 mt-1">Bus, Train & Plane tickets available</p>
            </div>

            {/* Route Card 2 (Dhaka to Sylhet) */}
            <div 
              onClick={() => navigate("/tickets?from=Dhaka&to=Sylhet")}
              className="group bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-500/20 cursor-pointer transition-all"
            >
              <div className="relative h-32 rounded-xl overflow-hidden mb-4">
                <img
                  src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=200"
                  alt="Sylhet Tea Gardens"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-950/25" />
              </div>
              <h4 className="font-display font-semibold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">Dhaka ➔ Sylhet</h4>
              <p className="text-xs text-slate-400 mt-1">Planes, Trains & Sleeper coaches</p>
            </div>

            {/* Route Card 3 (Dhaka to Chittagong) */}
            <div 
              onClick={() => navigate("/tickets?from=Dhaka&to=Chittagong")}
              className="group bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-500/20 cursor-pointer transition-all"
            >
              <div className="relative h-32 rounded-xl overflow-hidden mb-4">
                <img
                  src="https://images.unsplash.com/photo-1519642918688-7e43b190123f?auto=format&fit=crop&q=80&w=200"
                  alt="Chittagong Hill Tracts"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-950/25" />
              </div>
              <h4 className="font-display font-semibold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">Dhaka ➔ Chittagong</h4>
              <p className="text-xs text-slate-400 mt-1">Rapid Express AC chair trains</p>
            </div>

            {/* Route Card 4 (Dhaka to Barisal) */}
            <div 
              onClick={() => navigate("/tickets?from=Dhaka&to=Barisal")}
              className="group bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-500/20 cursor-pointer transition-all"
            >
              <div className="relative h-32 rounded-xl overflow-hidden mb-4">
                <img
                  src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=200"
                  alt="Barisal Water Launch"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-slate-950/25" />
              </div>
              <h4 className="font-display font-semibold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">Dhaka ➔ Barisal</h4>
              <p className="text-xs text-slate-400 mt-1">Majestic overnight water launches</p>
            </div>

          </div>
        </div>
      </div>

      {/* 5. ADDITIONAL SECTION 2: WHY CHOOSE US BENEFITS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-12">
        <div className="text-center max-w-lg mx-auto space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-500">Platform Values</span>
          <h2 className="text-3xl font-display font-extrabold text-slate-900 dark:text-white">
            Why Book on TicketBari?
          </h2>
          <p className="text-slate-500 text-sm">
            We operate on professional principles design-built for a premium digital ticketing experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Benefit 1 */}
          <div className="bg-white dark:bg-slate-900/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 hover:shadow-md transition-all">
            <div className="inline-flex p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-905 dark:text-white">Safe Encrypted Payments</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Every booking check is handled using state-of-the-art PCI-DSS payment gateways like Stripe. Your billing details are hidden.
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="bg-white dark:bg-slate-900/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 hover:shadow-md transition-all">
            <div className="inline-flex p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-905 dark:text-white">Durable Cloud Tracking</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Ticket reserves, seats, and transactions are synchronized in cloud environments. No lost passes or ticket losses, ever.
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="bg-white dark:bg-slate-900/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 hover:shadow-md transition-all">
            <div className="inline-flex p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-slate-905 dark:text-white">Live Expire Countdowns</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Know when your rides are leaving in real-time. Countdowns advise exactly how long you have left to submit approvals.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
