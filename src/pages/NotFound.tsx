import { Link } from "react-router-dom";
import { Compass, MoveLeft, Home } from "lucide-react";
import { motion } from "motion/react";

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-16 text-center">
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="text-emerald-500 mb-6 bg-emerald-50 dark:bg-emerald-950/20 p-5 rounded-full"
      >
        <Compass className="w-20 h-20" />
      </motion.div>

      <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
        Path Coordinates Lost
      </h1>
      
      <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
        The terminal route you are trying to access does not exist or has been temporarily archived. Let us guide you back to safety.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/10 transition-all cursor-pointer"
        >
          <Home className="w-5 h-5" />
          <span>Return Home</span>
        </Link>
        <button
          onClick={() => window.history.back()}
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-205 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
        >
          <MoveLeft className="w-5 h-5" />
          <span>Go Back</span>
        </button>
      </div>
    </div>
  );
}
