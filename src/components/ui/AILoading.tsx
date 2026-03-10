import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Loader2, BrainCircuit, Cpu } from 'lucide-react';

interface AILoadingProps {
  title?: string;
  subtitle?: string;
  variant?: 'inline' | 'fullscreen' | 'card' | 'minimal';
  icon?: React.ElementType;
}

export const AILoading: React.FC<AILoadingProps> = ({ 
  title = "AI Analysis in Progress", 
  subtitle = "Gemini is analyzing content...", 
  variant = 'card',
  icon: Icon = Sparkles
}) => {
  
  if (variant === 'minimal') {
    return (
      <div className="flex items-center space-x-2 text-[#1a73e8] dark:text-[#8ab4f8] bg-[#e8f0fe] dark:bg-[#8ab4f8]/20 px-4 py-2 rounded-full border border-[#d2e3fc] dark:border-[#8ab4f8]/30 shadow-sm">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 size={14} />
        </motion.div>
        <span className="text-[10px] font-bold uppercase tracking-widest">{title}</span>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="relative mb-8">
          <motion.div
            className="absolute inset-0 bg-[#1a73e8] blur-2xl opacity-20 rounded-full"
            animate={{ 
              scale: [1, 1.4, 1],
              opacity: [0.1, 0.3, 0.1] 
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
          <div className="relative z-10 bg-white dark:bg-[#202124] p-6 rounded-[24px] shadow-sm border border-[#dadce0] dark:border-[#3c4043]">
            <motion.div
              animate={{ 
                rotate: [0, 15, -15, 0],
                scale: [1, 1.15, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <Icon size={40} className="text-[#1a73e8] dark:text-[#8ab4f8]" />
            </motion.div>
          </div>
          
          {/* Orbiting particles */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-[#1a73e8] dark:bg-[#8ab4f8] rounded-full"
              initial={{ x: 0, y: 0 }}
              animate={{ 
                x: Math.cos(i * (Math.PI * 2 / 4)) * 50,
                y: Math.sin(i * (Math.PI * 2 / 4)) * 50,
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{ 
                duration: 2.5,
                repeat: Infinity,
                ease: "linear",
                delay: i * 0.4
              }}
            />
          ))}
        </div>
        
        <h3 className="text-xl font-bold text-[#202124] dark:text-[#e8eaed] mb-2 tracking-tight">
          {title}
        </h3>
        <p className="text-[14px] text-[#5f6368] dark:text-[#9aa0a6] max-w-xs mx-auto font-medium opacity-80">
          {subtitle}
        </p>
        
        {/* Progress bar simulation */}
        <div className="w-56 h-1.5 bg-[#f1f3f4] dark:bg-[#3c4043] rounded-full mt-8 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-[#1a73e8] via-[#8ab4f8] to-[#1a73e8]"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        </div>
      </div>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 dark:bg-[#202124]/95 z-50 backdrop-blur-xl">
        <div className="relative">
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-[#1a73e8] via-[#c5221f] to-[#fbbc04] blur-[100px] opacity-20 rounded-full"
            animate={{ 
              scale: [1, 1.8, 1],
              opacity: [0.15, 0.35, 0.15] 
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
          
          <div className="relative z-10 flex items-center justify-center w-32 h-32 bg-white dark:bg-[#303134] rounded-[32px] shadow-2xl border border-[#dadce0] dark:border-[#3c4043]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <BrainCircuit size={64} className="text-[#1a73e8] dark:text-[#8ab4f8]" />
            </motion.div>
            
            <motion.div
              className="absolute inset-0 border-[6px] border-[#1a73e8]/10 rounded-[32px]"
              animate={{ 
                borderColor: ["rgba(26, 115, 232, 0.1)", "rgba(26, 115, 232, 0.4)", "rgba(26, 115, 232, 0.1)"] 
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </div>
        </div>
        
        <motion.h3 
          className="text-3xl font-bold text-[#202124] dark:text-[#e8eaed] mt-12 mb-4 tracking-tight"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          {title}
        </motion.h3>
        
        <p className="text-[#5f6368] dark:text-[#9aa0a6] max-w-md text-center text-[16px] font-medium opacity-90">
          {subtitle}
        </p>
        
        <div className="flex space-x-3 mt-12">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-3.5 h-3.5 bg-[#1a73e8] dark:bg-[#8ab4f8] rounded-full shadow-sm"
              animate={{ 
                y: [0, -15, 0],
                opacity: [0.4, 1, 0.4],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{ 
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Default 'card' variant
  return (
    <div className="w-full h-full min-h-[350px] flex flex-col items-center justify-center bg-[#f8f9fa] dark:bg-[#303134] rounded-[24px] border border-[#dadce0] dark:border-[#3c4043] shadow-inner">
      <div className="relative mb-8">
        <motion.div
          className="absolute inset-0 bg-[#1a73e8] blur-2xl opacity-15 rounded-full"
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        <div className="relative z-10 bg-white dark:bg-[#202124] p-6 rounded-[24px] shadow-md border border-[#dadce0] dark:border-[#3c4043]">
          <Icon size={40} className="text-[#1a73e8] dark:text-[#8ab4f8]" />
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-[#202124] dark:text-[#e8eaed] mb-2 tracking-tight">{title}</h3>
      <p className="text-[14px] text-[#5f6368] dark:text-[#9aa0a6] text-center max-w-xs font-medium opacity-80">
        {subtitle}
      </p>
      
      <div className="mt-8 flex items-end space-x-1.5 h-10">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 bg-[#1a73e8]/30 dark:bg-[#8ab4f8]/30 rounded-full"
            animate={{ 
              height: [12, 40, 12],
              backgroundColor: i % 2 === 0 ? ["rgba(26, 115, 232, 0.3)", "rgba(26, 115, 232, 1)", "rgba(26, 115, 232, 0.3)"] : ["rgba(138, 180, 248, 0.3)", "rgba(138, 180, 248, 1)", "rgba(138, 180, 248, 0.3)"]
            }}
            transition={{ 
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.12,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
};
