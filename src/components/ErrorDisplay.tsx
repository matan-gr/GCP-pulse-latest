import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface ErrorDisplayProps {
  message: string;
  onRetry: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, onRetry }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center"
    >
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle className="text-red-500" size={40} />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h3>
      <p className="text-gray-600 max-w-md mb-8">{message}</p>
      <button
        onClick={onRetry}
        className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium shadow-lg hover:shadow-xl"
      >
        <RefreshCw size={20} />
        <span>Try Again</span>
      </button>
    </motion.div>
  );
};
