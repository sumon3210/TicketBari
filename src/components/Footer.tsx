import { Link } from "react-router-dom";
import { Bus, Mail, Phone, Facebook, CreditCard } from "lucide-react";

export function Footer() {
  return (
    <footer id="main-footer" className="bg-slate-900 border-t border-slate-800 text-slate-300 transition-colors duration-300">
      
      {/* Upper footer grid layout with 4 columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Column 1: Logo and Brand statement */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex items-center justify-center bg-emerald-500 text-white p-2 rounded-xl shadow-md">
                <Bus className="w-5 h-5" />
              </div>
              <span className="font-display font-extrabold text-2xl tracking-tight text-white">
                Ticket<span className="text-emerald-450 text-emerald-400">Bari</span>
              </span>
            </Link>
            
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Discover, book, and enjoy your journeys with Bangladesh's most reliable and premium ticketing platform. Elevating your travel experiences, one ticket at a time.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-white text-lg relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-emerald-500">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors flex items-center space-x-1">
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link to="/tickets" className="hover:text-emerald-400 transition-colors flex items-center space-x-1">
                  <span>All Tickets</span>
                </Link>
              </li>
              <li>
                <a href="#about" className="hover:text-emerald-400 transition-colors flex items-center space-x-1">
                  <span>About Us</span>
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-emerald-400 transition-colors flex items-center space-x-1">
                  <span>Contact Us</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact details */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-white text-lg relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-emerald-500">
              Contact Info
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-center space-x-3 text-slate-400">
                <Mail className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <a href="mailto:support@ticketbari.com" className="hover:text-emerald-400 transition-colors">
                  support@ticketbari.com
                </a>
              </li>
              <li className="flex items-center space-x-3 text-slate-400">
                <Phone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <a href="tel:+8801887041612" className="hover:text-emerald-400 transition-colors">
                  +880 1887041612
                </a>
              </li>
              <li className="flex items-center space-x-3 text-slate-400">
                <Facebook className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <a href="https://facebook.com/ticketbari" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors">
                  facebook.com/ticketbari
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Payment platforms visualization */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-white text-lg relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-0.5 after:bg-emerald-500">
              Payment Methods
            </h4>
            <p className="text-sm text-slate-450 dark:text-slate-400">
              We process secure, encrypted global and domestic payments powered entirely by industry-standard systems.
            </p>
            <div className="pt-2 flex flex-wrap gap-2.5">
              <div className="flex items-center space-x-2 bg-slate-800 text-white rounded-lg p-2.5 px-3 border border-slate-700 hover:border-emerald-500/25 transition-colors">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-display font-bold tracking-wider">STRIPE</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-800 text-white rounded-lg p-2.5 px-3 border border-slate-700 hover:border-emerald-500/25 transition-colors">
                <span className="text-[10px] font-display font-extrabold pb-0.5 text-amber-500 tracking-wider">SSLCOMMERZ</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer copyright bottom section */}
      <div className="bg-slate-950/70 py-6 border-t border-slate-850/40 text-center text-xs text-slate-500">
        <p>© 2026 TicketBari. All rights reserved.</p>
        <p className="text-[10px] text-slate-600 mt-1">Designed with precision for seamless travels.</p>
      </div>

    </footer>
  );
}
