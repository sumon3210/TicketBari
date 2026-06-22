import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, MapPin, Bus, SlidersHorizontal, Train, Plane, Ship, ArrowRight, ArrowUpDown, ChevronLeft, ChevronRight, Ban } from "lucide-react";
import { Ticket } from "../types";
import { TicketCard } from "../components/TicketCard";
import { LoadingSpinner } from "../components/LoadingSpinner";

export function AllTickets() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Search parameters from URL query strings
  const initialFrom = searchParams.get("from") || "";
  const initialTo = searchParams.get("to") || "";
  const initialTransport = searchParams.get("transportType") || "All";

  const [fromQuery, setFromQuery] = useState(initialFrom);
  const [toQuery, setToQuery] = useState(initialTo);
  const [transportFilter, setTransportFilter] = useState(initialTransport);
  const [priceSort, setPriceSort] = useState<string>("default"); // "default", "low_high", "high_low"
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 6;

  // React on search parameters change or manual filters
  useEffect(() => {
    const fetchFilteredTickets = async () => {
      try {
        setLoading(true);
        // Build url matching the backend filter suite
        const query = new URLSearchParams({
          from: fromQuery,
          to: toQuery,
          transportType: transportFilter,
          sort: priceSort,
          page: String(currentPage),
          limit: String(pageSize),
        });

        const res = await fetch(`/api/tickets?${query.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setTickets(data.tickets);
          setTotalPages(data.totalPages);
          setTotalCount(data.totalCount);
        }
      } catch (err) {
        console.error("Error loading tickets inventory:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFilteredTickets();
  }, [fromQuery, toQuery, transportFilter, priceSort, currentPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // reset pagination
    // Update URL query standards
    setSearchParams({
      from: fromQuery,
      to: toQuery,
      transportType: transportFilter,
    });
  };

  const handleResetFilters = () => {
    setFromQuery("");
    setToQuery("");
    setTransportFilter("All");
    setPriceSort("default");
    setCurrentPage(1);
    setSearchParams({});
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      document.getElementById("all-tickets-main-anchor")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSeeDetails = (ticket: Ticket) => {
    navigate(`/ticket/${ticket.id}`);
  };

  return (
    <div id="all-tickets-main-anchor" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 min-h-[80vh]">
      
      {/* Upper Title Description block */}
      <div className="space-y-2 border-b border-slate-100 dark:border-slate-850 pb-5">
        <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-500">Live Reservable Inventory</span>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-905 dark:text-white leading-tight">
          Explore Travel Routes
        </h1>
        <p className="text-sm text-slate-500 max-w-xl">
          Complete catalogs of verified, approved travel paths across Bangladesh. Refine by departure stations, transport carriers, and budgets.
        </p>
      </div>

      {/* Advanced Filter, Search, and Sorting control Dashboard */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
        
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          
          {/* From Station search */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-450 dark:text-slate-400 pl-1 uppercase tracking-wider block">Departing From</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Station (e.g. Dhaka)"
                value={fromQuery}
                onChange={(e) => setFromQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:border-emerald-500 text-sm font-semibold"
              />
              <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* To Station search */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-450 dark:text-slate-400 pl-1 uppercase tracking-wider block">Arriving At</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Destination (e.g. Sylhet)"
                value={toQuery}
                onChange={(e) => setToQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:border-emerald-500 text-sm font-semibold"
              />
              <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Transport Type Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-450 dark:text-slate-400 pl-1 uppercase tracking-wider block">Carrier Type</label>
            <select
              value={transportFilter}
              onChange={(e) => {
                setTransportFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-11 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              <option value="All">All Carriers</option>
              <option value="Bus">🚌 Bus Services</option>
              <option value="Train">🚂 Train Services</option>
              <option value="Launch">🚢 Launch Cruisers</option>
              <option value="Plane">✈️ Flight Routes</option>
            </select>
          </div>

          {/* Search trigger button */}
          <div className="h-11 mt-auto pt-7 md:pt-0">
            <button
              type="submit"
              className="w-full h-11 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-display font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Query Routes</span>
            </button>
          </div>

        </form>

        {/* Lower row: sorting controls and reset stats */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-500/10">
          
          <div className="flex items-center space-x-4">
            <span className="text-xs font-display font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest flex items-center space-x-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Sort Budget</span>
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  setPriceSort("low_high");
                  setCurrentPage(1);
                }}
                className={`py-1.5 px-3.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${priceSort === "low_high" ? "bg-emerald-500 border-none text-white shadow-sm" : "bg-transparent border-slate-200 text-slate-600 dark:text-slate-400 dark:border-slate-800"}`}
              >
                Low ➔ High
              </button>
              <button
                type="button"
                onClick={() => {
                  setPriceSort("high_low");
                  setCurrentPage(1);
                }}
                className={`py-1.5 px-3.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${priceSort === "high_low" ? "bg-emerald-500 border-none text-white shadow-sm" : "bg-transparent border-slate-200 text-slate-600 dark:text-slate-400 dark:border-slate-800"}`}
              >
                High ➔ Low
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-405">
              Available catalog matches: <strong className="text-slate-800 dark:text-slate-200 font-display font-bold">{totalCount} item(s)</strong>
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-emerald-500 hover:text-emerald-600 underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>

        </div>

      </div>

      {/* Main card grid container */}
      {loading ? (
        <LoadingSpinner />
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/10 rounded-2xl text-center space-y-4 border border-dashed border-slate-200 dark:border-slate-800">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-full">
            <Ban className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">Coordinate Inventory Blank</h3>
          <p className="text-slate-500 text-xs max-w-sm">No admin-approved routes fit your search constraints. Modify departure locations or select All Carrier Choices to list more paths.</p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer"
          >
            Show All Active Paths
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* Cards grid list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {tickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                onSeeDetails={handleSeeDetails}
              />
            ))}
          </div>

          {/* Pagination Footer Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 border-t border-slate-100 dark:border-slate-850 pt-8">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 font-display font-semibold rounded-xl text-sm transition-all cursor-pointer ${currentPage === page ? "bg-emerald-650 bg-emerald-600 text-white shadow-sm" : "border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-655 dark:text-slate-355"}`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
