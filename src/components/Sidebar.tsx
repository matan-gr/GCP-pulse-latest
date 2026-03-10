import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Rocket, 
  BookOpen, 
  FileText, 
  CalendarOff, 
  Youtube, 
  Activity, 
  ShieldAlert, 
  Layers, 
  Bookmark, 
  Wrench, 
  X, 
  Zap,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isPresentationMode: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isDesktopOpen: boolean;
}

export const Sidebar = React.memo<SidebarProps>(({ 
  activeTab, 
  setActiveTab, 
  isPresentationMode,
  isOpen,
  setIsOpen,
  isDesktopOpen
}) => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) setIsOpen(false); // Close mobile menu state when switching to desktop
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsOpen]);

  const menuItems = [
    { id: 'all', label: 'Discover Feed', icon: Compass },
    { id: 'weekly-brief', label: 'Weekly Brief', icon: Sparkles, badge: 'AI Generated' },
    { id: 'updates', label: 'Updates & Innovation', icon: Rocket },
    { id: 'cloud-blog', label: 'Cloud Blog', icon: BookOpen },
    { id: 'release-notes', label: 'Release Notes', icon: FileText },
    { id: 'deprecations', label: 'Product Deprecations', icon: CalendarOff },
    { id: 'youtube', label: 'GCP YouTube Channel', icon: Youtube },
    { id: 'incidents', label: 'Cloud Incidents', icon: Activity },
    { id: 'security', label: 'Security Bulletins', icon: ShieldAlert },
    { id: 'architecture', label: 'Architecture', icon: Layers },
  ];

  const personalItems = [
    { id: 'saved', label: 'Read Later', icon: Bookmark },
    { id: 'tools', label: 'Tools', icon: Wrench },
  ];

  return (
    <>
      {/* Sidebar Container */}
      <AnimatePresence>
        {((isDesktop && isDesktopOpen) || (!isDesktop && isOpen)) && (
          <motion.div 
            initial={isDesktop ? { x: -280, opacity: 0 } : { x: -280 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed top-0 left-0 h-full w-72 bg-[var(--color-bg-sidebar)] dark:bg-[var(--color-bg-sidebar-dark)] border-r border-[#dadce0] dark:border-[#3c4043] z-[50] flex flex-col`}
          >
            {/* Logo Area */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-[#dadce0] dark:border-[#3c4043]">
              <div className="flex items-center space-x-2 group cursor-pointer">
                <div className="w-8 h-8 bg-[#1a73e8] rounded-full flex items-center justify-center">
                  <Zap size={18} className="text-white" />
                </div>
                <span className="text-lg font-medium text-[#202124] dark:text-[#e8eaed] tracking-tight">GCP Pulse</span>
              </div>

              {/* Mobile Close Button */}
              {!isDesktop && (
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-[#5f6368] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto custom-scrollbar">
              
              {/* Main Menu */}
              <div>
                <div className="flex items-center px-4 mb-2">
                  <span className="text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider">Platform</span>
                </div>
                <div className="space-y-1">
                  {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as any);
                          if (!isDesktop) setIsOpen(false);
                        }}
                        className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-3">
                            <Icon size={18} className={isActive ? 'text-[#1a73e8] dark:text-[#8ab4f8]' : 'text-[#5f6368] dark:text-[#9aa0a6] group-hover:text-[#1a73e8] dark:group-hover:text-[#8ab4f8]'} />
                            <span>{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ml-2 border transition-all duration-300",
                              isActive 
                                ? "bg-[#d2e3fc] dark:bg-[#8ab4f8]/30 text-[#1a73e8] dark:text-[#8ab4f8] border-[#1a73e8]/20" 
                                : "bg-[#f1f3f4] dark:bg-[#3c4043] text-[#5f6368] dark:text-[#9aa0a6] border-[#dadce0] dark:border-[#3c4043]"
                            )}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Personal Section */}
              <div>
                <div className="flex items-center px-4 mb-2">
                  <span className="text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider">Workspace</span>
                </div>
                <div className="space-y-1">
                  {personalItems.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id as any);
                          if (!isDesktop) setIsOpen(false);
                        }}
                        className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon size={18} className={isActive ? 'text-[#1a73e8] dark:text-[#8ab4f8]' : 'text-[#5f6368] dark:text-[#9aa0a6] group-hover:text-[#1a73e8] dark:group-hover:text-[#8ab4f8]'} />
                          <span>{item.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </nav>
            
            {/* Sidebar Footer */}
            <div className="h-16 flex items-center border-t border-[#dadce0] dark:border-[#3c4043] px-6">
               <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2 text-[11px] font-semibold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-wider">
                    <div className="w-2 h-2 rounded-full bg-[#188038] animate-pulse" />
                    <span>Live</span>
                  </div>
               </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Overlay for mobile */}
      {isOpen && !isDesktop && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-[45]"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
});
