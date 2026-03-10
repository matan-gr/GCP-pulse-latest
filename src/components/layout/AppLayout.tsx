import React, { useState } from 'react';
import { Sidebar } from '../Sidebar';
import { 
  Menu, 
  Sun, 
  Moon, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Database,
  Zap,
  MessageSquarePlus,
  X,
  Filter
} from 'lucide-react';
import { GlobalSearch } from '../GlobalSearch';
import { useTheme } from '../../hooks/useTheme';
import { Tooltip } from '../ui/Tooltip';
import { ScrollToTopButton } from '../ui/ScrollToTopButton';
import { Breadcrumbs } from './Breadcrumbs';

interface AppLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isPresentationMode: boolean;
  setIsPresentationMode: (mode: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  // Search Props
  search: string;
  setSearch: (search: string) => void;
  isSmartFilter: boolean;
  setIsSmartFilter: (isSmart: boolean) => void;
  isAiLoading: boolean;
  categories: string[];
  selectedCategories: string[];
  filterType: 'include' | 'exclude';
  handleCategoryChange: (category: string) => void;
  handleFilterTypeChange: (type: 'include' | 'exclude') => void;
  dateRange: { start: string; end: string } | null;
  handleDateRangeChange: (range: { start: string; end: string } | null) => void;
  sortBy: 'date' | 'category';
  sortDirection: 'asc' | 'desc';
  handleSortChange: (sortBy: 'date' | 'category', sortDirection: 'asc' | 'desc') => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onExportCSV: () => void;
  isAnyFilterActive?: boolean;
  onClearFilters?: () => void;
}

const CurrentTime = () => {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="flex items-center gap-1.5">
      <Database size={10} className="sm:w-3 sm:h-3" /> 
      {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </span>
  );
};

export const AppLayout = React.memo<AppLayoutProps>(({
  children,
  activeTab,
  setActiveTab,
  isPresentationMode,
  setIsPresentationMode,
  isSidebarOpen,
  setIsSidebarOpen,
  search,
  setSearch,
  isSmartFilter,
  setIsSmartFilter,
  isAiLoading,
  categories,
  selectedCategories,
  filterType,
  handleCategoryChange,
  handleFilterTypeChange,
  dateRange,
  handleDateRangeChange,
  sortBy,
  sortDirection,
  handleSortChange,
  viewMode,
  onViewModeChange,
  onExportCSV,
  isAnyFilterActive,
  onClearFilters
}) => {
  const { theme, toggleTheme } = useTheme();
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] dark:bg-[var(--color-bg-app-dark)] font-sans text-slate-950 dark:text-slate-50 flex">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isPresentationMode={isPresentationMode}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isDesktopOpen={isDesktopSidebarOpen}
      />

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 min-w-0 ${!isPresentationMode && isDesktopSidebarOpen ? 'lg:ml-72' : ''}`}>
        
        {/* Top Header / Controls */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur-xl border-b border-[#dadce0] dark:border-[#3c4043] h-16 flex items-center">
          <div className="max-w-[1600px] mx-auto w-full px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
            
            {/* Left: Menu & Title */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {/* Mobile Menu Trigger */}
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 -ml-1 text-[#5f6368] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] rounded-full transition-all"
              >
                <Menu size={20} />
              </button>

              {/* Desktop Sidebar Toggle */}
              {!isPresentationMode && (
                <button
                  onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
                  className="hidden lg:flex p-1.5 -ml-2 text-[#5f6368] hover:text-[#202124] dark:hover:text-[#e8eaed] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] rounded-full transition-all"
                  title={isDesktopSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                >
                  {isDesktopSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                </button>
              )}

              {isPresentationMode && (
                <div className="flex items-center space-x-2 mr-4 group cursor-pointer">
                  <div className="w-7 h-7 bg-[#1a73e8] rounded-full flex items-center justify-center">
                    <Zap size={14} className="text-white" />
                  </div>
                  <span className="text-md font-medium text-[#202124] dark:text-[#e8eaed] tracking-tight">GCP Pulse</span>
                </div>
              )}
              
              {/* Breadcrumbs */}
              <div className="hidden lg:block">
                <Breadcrumbs activeTab={activeTab} setActiveTab={setActiveTab} />
              </div>
            </div>

            {/* Center: Global Search */}
            <div className="flex-1 max-w-xl mx-4 hidden md:block">
               {!isPresentationMode && activeTab !== 'tools' && (
                  <GlobalSearch 
                    value={search} 
                    onChange={setSearch} 
                    isSmartFilter={isSmartFilter}
                    onToggleSmartFilter={() => setIsSmartFilter(!isSmartFilter)}
                    loading={isAiLoading}
                    categories={categories}
                    selectedCategories={selectedCategories}
                    filterType={filterType}
                    onSelectCategory={handleCategoryChange}
                    onFilterTypeChange={handleFilterTypeChange}
                    dateRange={dateRange}
                    onDateRangeChange={handleDateRangeChange}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSortChange={handleSortChange}
                    viewMode={viewMode}
                    onViewModeChange={onViewModeChange}
                    onExportCSV={onExportCSV}
                  />
               )}
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
               {/* Author Link */}
               <Tooltip content="Contact Author" position="bottom">
                 <a 
                   href="mailto:matangr@google.com"
                   className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#202124] dark:hover:text-[#e8eaed] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] rounded-full transition-all border border-[#dadce0] dark:border-[#5f6368]"
                 >
                   <MessageSquarePlus size={14} />
                   <span>matangr</span>
                 </a>
               </Tooltip>

               <div className="w-px h-4 bg-[#dadce0] dark:bg-[#5f6368] mx-1 hidden sm:block" />

               {/* Theme Toggle */}
               <Tooltip content={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`} position="bottom">
                 <button
                  onClick={toggleTheme}
                  className="p-1.5 rounded-full text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] transition-all border border-[#dadce0] dark:border-[#5f6368] bg-white dark:bg-[#292a2d]"
                >
                  {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                </button>
               </Tooltip>
            </div>
          </div>
        </header>

        {/* Mobile Search (visible only on small screens) */}
        <div className="md:hidden px-3 py-2 border-b border-[#dadce0] dark:border-[#3c4043] bg-white/90 dark:bg-[#0f0f0f]/90 backdrop-blur-xl">
           {!isPresentationMode && activeTab !== 'tools' && (
              <GlobalSearch 
                value={search} 
                onChange={setSearch} 
                isSmartFilter={isSmartFilter}
                onToggleSmartFilter={() => setIsSmartFilter(!isSmartFilter)}
                loading={isAiLoading}
                categories={categories}
                selectedCategories={selectedCategories}
                filterType={filterType}
                onSelectCategory={handleCategoryChange}
                onFilterTypeChange={handleFilterTypeChange}
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
                viewMode={viewMode}
                onViewModeChange={onViewModeChange}
                onExportCSV={onExportCSV}
              />
           )}
        </div>

        <div className="p-3 sm:p-4 md:p-6 pb-24 max-w-[1600px] mx-auto min-h-[calc(100vh-160px)]">
          {isAnyFilterActive && onClearFilters && (
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#e8f0fe] dark:bg-[#8ab4f8]/10 border border-[#d2e3fc] dark:border-[#8ab4f8]/30 rounded-2xl sm:rounded-[24px] animate-in fade-in slide-in-from-top-2 duration-300 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#1a73e8] text-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                  <Filter size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#202124] dark:text-[#e8eaed] uppercase tracking-tight">Active Search & Filters</p>
                  <p className="text-[10px] font-medium text-[#5f6368] dark:text-[#9aa0a6]">Viewing a filtered subset of the feed.</p>
                </div>
              </div>
              <button
                onClick={onClearFilters}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-[#292a2d] text-[#5f6368] dark:text-[#9aa0a6] text-[10px] font-bold rounded-full border border-[#dadce0] dark:border-[#5f6368] hover:bg-[#f8f9fa] dark:hover:bg-[#3c4043] transition-all shadow-sm active:scale-95 uppercase tracking-widest"
              >
                <X size={12} />
                <span>Clear All Filters</span>
              </button>
            </div>
          )}
          {children}
        </div>

        {/* Minimal Footer */}
        <footer className={`fixed bottom-0 right-0 bg-white/90 dark:bg-[#0f0f0f]/90 backdrop-blur-xl border-t border-[#dadce0] dark:border-[#3c4043] h-16 flex items-center px-4 sm:px-6 z-40 transition-all duration-300 ${!isPresentationMode && isDesktopSidebarOpen ? 'lg:left-72 left-0' : 'left-0'}`}>
          <div className="max-w-[1600px] mx-auto w-full flex justify-between items-center text-[9px] sm:text-[10px] font-medium text-[#5f6368] dark:text-[#9aa0a6]">
            <div className="flex items-center gap-3 sm:gap-4 uppercase tracking-widest">
              <CurrentTime />
              <span className="hidden xs:inline-block opacity-30">|</span>
              <span className="hidden xs:inline-block">GCP Pulse v1.2</span>
            </div>
            <span className="hidden md:block text-right max-w-[60%] truncate">
              Developed by Matan Gravits. Independent project, not affiliated with Google LLC.
            </span>
            <span className="md:hidden text-right">
              &copy; {new Date().getFullYear()}
            </span>
          </div>
        </footer>
        
        <ScrollToTopButton />
      </div>
    </div>
  );
});
