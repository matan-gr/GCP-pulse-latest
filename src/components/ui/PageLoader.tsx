import React from 'react';
import { motion } from 'motion/react';

export const PageLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <div className="relative w-16 h-16 mb-8">
        {/* Outer Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-800"
        />
        {/* Spinning Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 dark:border-t-blue-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        {/* Inner Pulse */}
        <motion.div
          className="absolute inset-4 rounded-full bg-blue-100 dark:bg-blue-900/30"
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      {/* Skeleton Lines */}
      <div className="w-full max-w-md space-y-4 px-4">
        <motion.div 
          className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-3/4 mx-auto"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <motion.div 
          className="h-3 bg-slate-100 dark:bg-slate-800/50 rounded-full w-1/2 mx-auto"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
        />
      </div>
    </div>
  );
};
