import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const LOADING_MESSAGES = [
  "Scanning Google Cloud release notes...",
  "Identifying product deprecations...",
  "Analyzing End of Support timelines...",
  "Calculating days to End of Life...",
  "Organizing migration guides...",
];

export const ProductDeprecationsLoader: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/30">
      <div className="relative">
        <div className="absolute inset-0 bg-amber-400/20 blur-xl rounded-full animate-pulse"></div>
        <div className="relative bg-white dark:bg-slate-800 p-4 rounded-full shadow-sm border border-amber-100 dark:border-amber-800">
          <BrainCircuit size={32} className="text-amber-600 dark:text-amber-400 animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm">
          <Loader2 size={16} className="text-amber-600 animate-spin" />
        </div>
      </div>
      
      <div className="h-12 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-sm font-medium text-amber-800 dark:text-amber-200"
          >
            {LOADING_MESSAGES[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};
