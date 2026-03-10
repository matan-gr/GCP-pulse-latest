import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top',
  delay = 0.3 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });
    }
  };

  const showTooltip = () => {
    updatePosition();
    const id = setTimeout(() => setIsVisible(true), delay * 1000);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  // Update position on scroll or resize if visible
  useEffect(() => {
    if (isVisible) {
      const handleUpdate = () => {
          updatePosition();
      };
      window.addEventListener('scroll', handleUpdate, true);
      window.addEventListener('resize', handleUpdate);
      return () => {
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
      };
    }
  }, [isVisible]);

  const getTooltipStyle = () => {
    const gap = 8;
    switch (position) {
      case 'top':
        return {
          top: coords.top - gap,
          left: coords.left + coords.width / 2,
          transform: 'translate(-50%, -100%)'
        };
      case 'bottom':
        return {
          top: coords.top + coords.height + gap,
          left: coords.left + coords.width / 2,
          transform: 'translate(-50%, 0)'
        };
      case 'left':
        return {
          top: coords.top + coords.height / 2,
          left: coords.left - gap,
          transform: 'translate(-100%, -50%)'
        };
      case 'right':
        return {
          top: coords.top + coords.height / 2,
          left: coords.left + coords.width + gap,
          transform: 'translate(0, -50%)'
        };
      default:
        return {};
    }
  };

  return (
    <>
      <div 
        ref={triggerRef}
        className="relative inline-flex" 
        onMouseEnter={showTooltip} 
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </div>
      {createPortal(
        <AnimatePresence>
          {isVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'fixed',
                zIndex: 9999,
                ...getTooltipStyle()
              }}
              className="px-2.5 py-1.5 text-xs font-medium text-white bg-slate-900 dark:bg-slate-700 rounded-md shadow-lg whitespace-nowrap pointer-events-none"
            >
              {content}
              <div 
                className={`absolute w-2 h-2 bg-slate-900 dark:bg-slate-700 transform rotate-45 ${
                  position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
                  position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
                  position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
                  'left-[-4px] top-1/2 -translate-y-1/2'
                }`}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};
