import React, { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, Sparkles, X, Calendar, Tag, LayoutGrid, List, Download, Command } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tooltip } from './ui/Tooltip';

import { getCategoryStyles, cn } from '../utils';

interface GlobalSearchProps {
  value: string;
  onChange: (value: string) => void;
  isSmartFilter: boolean;
  onToggleSmartFilter: () => void;
  loading?: boolean;
  categories: string[];
  selectedCategories: string[];
  filterType: 'include' | 'exclude';
  onSelectCategory: (category: string) => void;
  onFilterTypeChange: (type: 'include' | 'exclude') => void;
  dateRange: { start: string; end: string } | null;
  onDateRangeChange: (range: { start: string; end: string } | null) => void;
  sortBy: 'date' | 'category';
  sortDirection: 'asc' | 'desc';
  onSortChange: (sortBy: 'date' | 'category', sortDirection: 'asc' | 'desc') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onExportCSV?: () => void;
  onClearFilters?: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  value,
  onChange,
  isSmartFilter,
  onToggleSmartFilter,
  loading,
  categories,
  selectedCategories,
  filterType,
  onSelectCategory,
  onFilterTypeChange,
  dateRange,
  onDateRangeChange,
  sortBy,
  sortDirection,
  onSortChange,
  viewMode,
  onViewModeChange,
  onExportCSV,
  onClearFilters
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const hasActiveFilters = selectedCategories.length > 0 || dateRange || value !== '';

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Main Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className={`h-5 w-5 transition-colors ${isSmartFilter ? 'text-[#1a73e8] dark:text-[#8ab4f8]' : 'text-[#5f6368] dark:text-[#9aa0a6] group-focus-within:text-[#202124] dark:group-focus-within:text-[#e8eaed]'}`} />
        </div>
        <input
          ref={inputRef}
          id="search-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isSmartFilter ? "Ask AI..." : "Search..."}
          className={`w-full bg-[#f1f3f4] dark:bg-[#303134] border border-transparent rounded-full pl-12 pr-24 py-3 text-[15px] font-medium transition-all duration-300 outline-none ${
            isSmartFilter 
              ? 'focus:bg-white dark:focus:bg-[#202124] focus:border-[#1a73e8] dark:focus:border-[#8ab4f8] focus:shadow-[0_1px_6px_rgba(32,33,36,0.28)] dark:focus:shadow-[0_1px_6px_rgba(0,0,0,0.5)] bg-[#e8f0fe] dark:bg-[#8ab4f8]/10' 
              : 'focus:bg-white dark:focus:bg-[#202124] focus:border-transparent focus:shadow-[0_1px_6px_rgba(32,33,36,0.28)] dark:focus:shadow-[0_1px_6px_rgba(0,0,0,0.5)] hover:bg-white dark:hover:bg-[#303134] hover:shadow-[0_1px_6px_rgba(32,33,36,0.28)] dark:hover:shadow-[0_1px_6px_rgba(0,0,0,0.5)]'
          }`}
        />
        
        {/* Shortcut Hint */}
        <div className="absolute inset-y-0 right-14 flex items-center pointer-events-none z-20 hidden lg:flex">
          <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-[#202124] border border-[#dadce0] dark:border-[#5f6368] rounded text-[10px] font-bold text-[#5f6368] dark:text-[#9aa0a6]">
            <Command size={10} />
            <span>K</span>
          </div>
        </div>
        
        {/* Right Actions */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1 z-20">
          {/* Smart Filter Toggle */}
          <Tooltip content="Toggle AI Smart Search" position="bottom">
            <button
              onClick={onToggleSmartFilter}
              className={`p-2 rounded-full transition-all ${
                isSmartFilter 
                  ? 'bg-[#e8f0fe] text-[#1a73e8] dark:bg-[#8ab4f8]/20 dark:text-[#8ab4f8]' 
                  : 'text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#1a73e8] dark:hover:text-[#8ab4f8] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043]'
              }`}
            >
              <Sparkles size={18} className={loading ? 'animate-pulse' : ''} />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Active Filters Bar */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex flex-wrap items-center gap-2 mt-2"
          >
            <div className="text-[10px] font-bold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-widest mr-1">Filters:</div>
            
            {value && (
              <div className="flex items-center bg-[#f1f3f4] dark:bg-[#303134] text-[#5f6368] dark:text-[#9aa0a6] px-2 py-1 rounded-lg text-[9px] font-black border border-[#dadce0] dark:border-[#3c4043] uppercase tracking-widest">
                Search: {value}
                <button onClick={() => onChange('')} className="ml-1.5 hover:text-[#202124] dark:hover:text-[#e8eaed]">
                  <X size={10} />
                </button>
              </div>
            )}

            {selectedCategories.map(cat => {
              return (
                <div key={cat} className={cn(
                  "flex items-center px-2 py-1 rounded-lg text-[9px] font-black border uppercase tracking-widest",
                  getCategoryStyles(cat)
                )}>
                  {cat}
                  <button onClick={() => onSelectCategory(cat)} className="ml-1.5 opacity-70 hover:opacity-100">
                    <X size={10} />
                  </button>
                </div>
              );
            })}

            {dateRange && (
              <div className="flex items-center bg-[#f1f3f4] dark:bg-[#303134] text-[#5f6368] dark:text-[#9aa0a6] px-2 py-1 rounded-lg text-[9px] font-black border border-[#dadce0] dark:border-[#3c4043] uppercase tracking-widest">
                Date Range
                <button onClick={() => onDateRangeChange(null)} className="ml-1.5 hover:text-[#202124] dark:hover:text-[#e8eaed]">
                  <X size={10} />
                </button>
              </div>
            )}

            {onClearFilters && (
              <button 
                onClick={onClearFilters}
                className="text-[10px] font-bold text-[#5f6368] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:text-[#e8eaed] uppercase tracking-widest ml-auto"
              >
                Clear All
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Filters Panel Removed */}
    </div>
  );
};
