import { Calendar, MapPin, ClipboardList, Tag, ArrowRight, Plane, Train, Bus, Ship, Check } from "lucide-react";
import { Ticket } from "../types";

interface TicketCardProps {
  ticket: Ticket;
  onSeeDetails: (ticket: Ticket) => void;
  showRoute?: boolean;
}

export function TicketCard({ ticket, onSeeDetails, showRoute = true }: TicketCardProps) {
  const isExpired = new Date(ticket.departureTime).getTime() < Date.now();
  const isSoldOut = ticket.quantity <= 0;

  // Render correct icon for transport
  const getIcon = () => {
    switch (ticket.transportType) {
      case "Plane":
        return <Plane className="w-4 h-4 text-sky-500" />;
      case "Train":
        return <Train className="w-4 h-4 text-purple-500" />;
      case "Launch":
        return <Ship className="w-4 h-4 text-teal-500" />;
      default:
        return <Bus className="w-4 h-4 text-amber-500" />;
    }
  };

  // Badge styling for transport
  const getBadgeStyle = () => {
    switch (ticket.transportType) {
      case "Plane":
        return "bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900";
      case "Train":
        return "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900";
      case "Launch":
        return "bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900";
      default:
        return "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900";
    }
  };

  const formattedDate = new Date(ticket.departureTime).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div id={`ticket-card-${ticket.id}`} className="group relative flex flex-col h-full bg-white dark:bg-slate-900/40 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/25 dark:hover:border-emerald-500/30 shadow-sm hover:shadow-xl transition-all duration-300">
      
      {/* Card Image and Advertising Badge */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <img
          src={ticket.image}
          alt={ticket.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-550 ease-out"
        />
        
        {/* Transparent dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent opacity-60" />

        {/* Floating elements */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-display font-semibold tracking-wide border shadow-sm ${getBadgeStyle()}`}>
            {getIcon()}
            <span>{ticket.transportType}</span>
          </span>

          {ticket.advertised && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full shadow-md animate-pulse">
              ★ Featured
            </span>
          )}
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-4 right-4 bg-emerald-500 dark:bg-emerald-600 font-display text-white text-base font-bold tracking-tight px-3 py-1.5 rounded-lg shadow-md">
          {ticket.price} BDT
        </div>
      </div>

      {/* Card Content Description */}
      <div className="flex flex-col flex-grow p-5 space-y-4">
        
        {/* Title and Vendor name */}
        <div className="space-y-1">
          <h3 className="font-display font-semibold text-lg text-slate-900 dark:text-slate-100 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors line-clamp-1 leading-snug">
            {ticket.title}
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Managed by {ticket.vendorName}
          </p>
        </div>

        {/* Dynamic Route display */}
        {showRoute && (
          <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-350 bg-slate-50 dark:bg-slate-950/60 py-2 px-3 rounded-xl border border-slate-100/50 dark:border-slate-800/20">
            <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="font-medium truncate">{ticket.from}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="font-medium truncate">{ticket.to}</span>
          </div>
        )}

        {/* Date / Departure Time */}
        <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>Departs: <strong className="text-slate-700 dark:text-slate-305 font-medium">{formattedDate}</strong></span>
        </div>

        {/* Perks list bullets */}
        {ticket.perks && ticket.perks.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {ticket.perks.slice(0, 3).map((perk, i) => (
              <span key={i} className="inline-flex items-center space-x-1 text-[10px] bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md font-medium border border-slate-200/40 dark:border-slate-800/40">
                <Check className="w-2.5 h-2.5 text-emerald-500 flex-shrink-0" />
                <span className="truncate max-w-[90px]">{perk}</span>
              </span>
            ))}
            {ticket.perks.length > 3 && (
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold self-center px-1">
                +{ticket.perks.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Spacing alignment */}
        <div className="flex-grow" />

        {/* Bottom Details Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-auto">
          <div>
            <span className="block text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">
              Available Seating
            </span>
            <span className={`text-sm font-bold font-display ${isSoldOut ? "text-red-500" : ticket.quantity <= 10 ? "text-amber-500" : "text-emerald-500"}`}>
              {isSoldOut ? "Sold Out" : `${ticket.quantity} seat(s)`}
            </span>
          </div>

          <button
            onClick={() => onSeeDetails(ticket)}
            disabled={isExpired}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 border border-transparent dark:bg-slate-800 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-display font-medium text-xs rounded-xl shadow-sm hover:shadow-md disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-slate-900/60 dark:disabled:text-slate-600 transition-all duration-200 cursor-pointer"
          >
            <span>See Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
