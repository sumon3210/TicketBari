import { useState } from "react";
import { X, Check, Calendar, MapPin, Users, DollarSign, Clock } from "lucide-react";
import { Ticket } from "../types";
import { MiniSpinner } from "./LoadingSpinner";

interface BookingModalProps {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quantity: number) => Promise<void>;
  isSubmitting: boolean;
  successMessage: string | null;
  errorMessage: string | null;
}

export function BookingModal({
  ticket,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  successMessage,
  errorMessage,
}: BookingModalProps) {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const isExpired = new Date(ticket.departureTime).getTime() < Date.now();
  const isSoldOut = ticket.quantity <= 0;
  const isButtonDisabled = isExpired || isSoldOut || quantity <= 0 || quantity > ticket.quantity;

  const handleIncrement = () => {
    if (quantity < ticket.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      if (val > ticket.quantity) {
        setQuantity(ticket.quantity);
      } else if (val < 1) {
        setQuantity(1);
      } else {
        setQuantity(val);
      }
    } else {
      setQuantity(1);
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div id="booking-modal-container" className="relative w-full max-w-lg bg-white dark:bg-slate-950 rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800/80 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xl font-display font-semibold text-slate-900 dark:text-slate-100">
            Confirm Seat Booking
          </h3>
          <button 
            onClick={onClose}
            className="p-1 px-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Status Banners */}
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-950">
              {errorMessage}
            </div>
          )}

          {successMessage ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-center rounded-xl border border-emerald-100 dark:border-emerald-900/60 space-y-3">
              <div className="inline-flex p-2 bg-emerald-500 text-white rounded-full">
                <Check className="w-6 h-6" />
              </div>
              <p className="font-medium font-display text-lg">{successMessage}</p>
              <p className="text-xs text-slate-500">Go to My Booked Tickets Dashboard to track approvals and pay.</p>
              <button
                onClick={onClose}
                className="mt-2 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors cursor-pointer"
              >
                Close Window
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Ticket Quick Overview */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-xs text-slate-400 dark:text-slate-500">
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full font-medium">
                    {ticket.transportType}
                  </span>
                  <span>•</span>
                  <span>Vendor: {ticket.vendorName}</span>
                </div>
                <h4 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100">
                  {ticket.title}
                </h4>
                
                <div className="grid grid-cols-2 gap-3 text-sm text-slate-650 dark:text-slate-300">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span>{ticket.from} ➔ {ticket.to}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <span>{formattedTime}, {formattedDate}</span>
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {isExpired && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-xs rounded-lg border border-amber-100 dark:border-amber-950 flex items-center space-x-2">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  <span>This trip has departed. Ticket bookings are disabled.</span>
                </div>
              )}

              {isSoldOut && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-650 dark:text-red-400 text-xs rounded-lg border border-red-100 dark:border-red-950">
                  This trip is completely sold out.
                </div>
              )}

              {!isExpired && !isSoldOut && (
                <div className="space-y-4">
                  {/* Quantity Selectors */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block font-medium text-slate-800 dark:text-slate-200">
                        Number of Seats
                      </span>
                      <span className="text-xs text-slate-450 dark:text-slate-400">
                        Available: {ticket.quantity} seat(s)
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={handleDecrement}
                        disabled={quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-250 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={ticket.quantity}
                        value={quantity}
                        onChange={handleInputChange}
                        className="w-12 text-center font-display font-semibold text-slate-905 dark:text-slate-105 bg-transparent border-none focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <button
                        type="button"
                        onClick={handleIncrement}
                        disabled={quantity >= ticket.quantity}
                        className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-250 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="border-t border-dashed border-slate-200 dark:border-slate-800 pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Seat Price</span>
                      <span>{ticket.price} BDT</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-550">
                      <span>Seats Selected</span>
                      <span>x {quantity}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-display font-bold text-slate-900 dark:text-slate-100 pt-2 border-t border-slate-100 dark:border-slate-850">
                      <span>Total Amount</span>
                      <span className="text-emerald-500">
                        {ticket.price * quantity} BDT
                      </span>
                    </div>
                  </div>

                  {/* Submission Buttons */}
                  <button
                    type="button"
                    onClick={() => onSubmit(quantity)}
                    disabled={isButtonDisabled || isSubmitting}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-900 disabled:text-slate-450 dark:disabled:text-slate-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-base font-display font-medium rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 disabled:shadow-none transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <MiniSpinner />
                        <span>Submitting Booking...</span>
                      </>
                    ) : (
                      <span>Request Seat Reservation</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
