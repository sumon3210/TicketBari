import { Clock, Ship, Train, Plane, Bus } from "lucide-react";
import { motion } from "motion/react";

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="relative flex items-center justify-center w-24 h-24 mb-6">
        {/* Spinner rings */}
        <motion.div
          className="absolute w-full h-full border-4 border-emerald-500/20 border-t-emerald-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute w-16 h-16 border-4 border-sky-500/10 border-b-sky-500 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        />
        {/* Pulsing transit icons */}
        <motion.div
          className="absolute flex items-center justify-center bg-white dark:bg-slate-800 text-emerald-500 p-3 rounded-full shadow-lg"
          animate={{ scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Bus className="w-6 h-6" />
        </motion.div>
      </div>
      <motion.p
        className="text-slate-600 dark:text-slate-300 font-display font-medium text-lg tracking-wide"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      >
        Securing your ticket pathways...
      </motion.p>
      <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Please wait a moment</p>
    </div>
  );
}

export function MiniSpinner() {
  return (
    <div className="inline-flex items-center justify-center">
      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  );
}
