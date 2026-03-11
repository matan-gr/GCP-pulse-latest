import React, { useState, useMemo } from 'react';
import { FeedItem } from '../types';
import { StatusDashboard } from '../components/StatusDashboard';
import { FeedCard } from '../components/FeedCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { AnalysisResult } from '../types';
import { EmptyState } from '../components/EmptyState';
import { Loader2, LayoutTemplate, AlignJustify, Grid, Download, TrendingUp, Filter, SearchX, X, Search } from 'lucide-react';
import { UserPreferences } from '../hooks/useUserPreferences';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { AILoading } from '../components/ui/AILoading';

import { getCategoryColor, getCategoryStyles, cn } from '../utils';

interface DiscoverViewProps {
  items: FeedItem[];
  loading: boolean;
  prefs: UserPreferences;
  onSummarize: (item: FeedItem) => void;
  summarizingId: string | null;
  onSave: (item: FeedItem) => void;
  toggleCategorySubscription: (category: string) => void;
  handleCategoryChange: (category: string) => void;
  analyses: Record<string, AnalysisResult>;
  isPresentationMode: boolean;
  isAiLoading: boolean;
  onToggleColumnVisibility: (column: string) => void;
  onUpdateColumnOrder: (order: string[]) => void;
  onClearFilters?: () => void;
  search?: string;
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  items,
  loading,
  prefs,
  onSummarize,
  summarizingId,
  onSave,
  toggleCategorySubscription,
  handleCategoryChange,
  analyses,
  isPresentationMode,
  isAiLoading,
  onClearFilters,
  search = '',
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}) => {
  // View Customization State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Filter and organize items for the Discover feed
  const allFeedItems = useMemo(() => {
    return items.filter(item => item.source !== 'Security Bulletins');
  }, [items]);

  // Extract popular categories for quick filters
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    allFeedItems.forEach(item => {
      (item.categories || []).forEach(cat => {
        counts[cat] = (counts[cat] || 0) + 1;
      });
    });
    const popular = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([name, count]) => ({ name, count }));
    return { popular, counts };
  }, [allFeedItems]);

  const popularCategories = categoryStats.popular;

  // Split into Featured and Regular items
  const featuredItems = useMemo(() => {
    // Top 2 items if they are "New"
    const now = new Date();
    return allFeedItems.slice(0, 2).filter(item => {
      const hoursSince = (now.getTime() - new Date(item.isoDate).getTime()) / (1000 * 60 * 60);
      return hoursSince < 48;
    });
  }, [allFeedItems]);

  const regularItems = useMemo(() => {
    const featuredLinks = new Set(featuredItems.map(i => i.link));
    return allFeedItems.filter(item => !featuredLinks.has(item.link));
  }, [allFeedItems, featuredItems]);

  // Trigger fetchNextPage when sentinel is in view
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0, rootMargin: '200px' });

  React.useEffect(() => {
    if (inView && hasNextPage && fetchNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  const handleExportHTML = () => {
    if (allFeedItems.length === 0) {
      toast.error("No items to export", { description: "Please ensure there are items available to export." });
      return;
    }

    const htmlContent = `
      <html>
        <head>
          <style>
            body { font-family: sans-serif; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>GCP Updates</h1>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Source</th>
                <th>Date</th>
                <th>Link</th>
                <th>Categories</th>
              </tr>
            </thead>
            <tbody>
              ${allFeedItems.map(item => `
                <tr>
                  <td>${item.title}</td>
                  <td>${item.source}</td>
                  <td>${new Date(item.isoDate).toLocaleDateString()}</td>
                  <td><a href="${item.link}">${item.link}</a></td>
                  <td>${(item.categories || []).join(', ')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'gcp_updates_' + new Date().toISOString().split('T')[0] + '.html');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Exported ' + allFeedItems.length + ' items to HTML', { description: "Your download should begin shortly." });
  };

  const handleScrollToFeed = () => {
    const feedElement = document.getElementById('feed-grid');
    if (feedElement) {
      feedElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Status Dashboard - Only visible in Presentation Mode */}
      {!loading && items.length > 0 && isPresentationMode && (
        <StatusDashboard 
          items={items} 
          onViewCritical={handleScrollToFeed}
          isPresentationMode={isPresentationMode}
        />
      )}

      {isAiLoading && (
          <div className="flex justify-center mb-8">
            <AILoading variant="minimal" title="AI Analysis in progress..." />
          </div>
      )}

      {/* View Customization Toolbar */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex flex-col gap-3 bg-white dark:bg-[#202124] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 transition-all">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                <LayoutTemplate size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 tracking-tight leading-none mb-0.5">Discover</h2>
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Intelligence Feed</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(search || prefs.filterCategories.length > 0) && onClearFilters && (
                <button
                  onClick={onClearFilters}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-[10px] font-bold transition-all bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 uppercase tracking-widest"
                >
                  <X size={12} />
                  <span className="hidden sm:inline">Clear Filters</span>
                  <span className="sm:hidden">Clear</span>
                </button>
              )}

              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-[10px] font-bold transition-all bg-slate-100 dark:bg-[#303134] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-[#3c4043] uppercase tracking-widest"
              >
                <Filter size={12} />
                <span>{isFiltersOpen ? 'Hide Filters' : 'Show Filters'}</span>
              </button>

              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
              {/* Export Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExportHTML}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap bg-white dark:bg-[#303134] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#3c4043] uppercase tracking-widest shadow-sm"
                title="Export to HTML"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Export</span>
              </motion.button>

              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />

              <div className="flex items-center bg-slate-100 dark:bg-[#303134] rounded-xl p-1 border border-transparent">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-lg transition-all flex items-center space-x-2 ${
                    viewMode === 'grid' 
                      ? 'bg-white dark:bg-[#202124] shadow-sm text-blue-600 dark:text-blue-400' 
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50'
                  }`}
                  title="Grid View"
                >
                  <Grid size={18} />
                  <span className="text-[11px] font-bold hidden lg:inline uppercase tracking-widest">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-lg transition-all flex items-center space-x-2 ${
                    viewMode === 'list' 
                      ? 'bg-white dark:bg-[#202124] shadow-sm text-blue-600 dark:text-blue-400' 
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50'
                  }`}
                  title="List View"
                >
                  <AlignJustify size={18} />
                  <span className="text-[11px] font-bold hidden lg:inline uppercase tracking-widest">List</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Filter Chips */}
          <AnimatePresence>
            {isFiltersOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100 dark:border-slate-800">
                  {search && (
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black bg-blue-600 text-white border border-blue-600 whitespace-nowrap uppercase tracking-widest">
                      <Search size={10} />
                      <span>Search: {search}</span>
                    </div>
                  )}

                  {popularCategories.map(({ name, count }) => {
                    const isActive = prefs.filterCategories.includes(name);
                    return (
                      <button
                        key={name}
                        onClick={() => handleCategoryChange(name)}
                        className={cn(
                          "flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] font-black transition-all whitespace-nowrap border uppercase tracking-widest",
                          isActive
                            ? `bg-blue-600 text-white border-blue-600`
                            : cn(
                                "bg-white dark:bg-[#202124] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-[#303134]",
                                getCategoryStyles(name)
                              )
                        )}
                      >
                        <span>{name}</span>
                        <span className={cn(
                          "text-[8px] px-1 py-0.5 rounded-sm font-black",
                          isActive
                            ? `bg-white/20 text-white`
                            : `bg-slate-100 dark:bg-[#303134] text-slate-500 dark:text-slate-400`
                        )}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>


      {/* Featured Section */}
      {!loading && featuredItems.length > 0 && viewMode === 'grid' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#1a73e8] dark:text-[#8ab4f8]">
            <TrendingUp size={20} />
            <h2 className="text-xl font-bold tracking-tight">Featured Updates</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredItems.map((item, index) => (
              <FeedCard 
                key={`featured-${item.link}-${index}`} 
                item={item} 
                index={index}
                onSummarize={onSummarize}
                isSummarizing={summarizingId === item.link}
                onSave={onSave}
                isSaved={prefs.savedPosts.includes(item.link)}
                viewMode="grid"
                subscribedCategories={prefs.subscribedCategories}
                onToggleSubscription={toggleCategorySubscription}
                onSelectCategory={handleCategoryChange}
                analysis={analyses[item.link]}
                isPresentationMode={isPresentationMode}
                showImages={true}
              />
            ))}
          </div>
          <div className="h-px bg-[#dadce0] dark:bg-[#3c4043] my-8" />
        </div>
      )}

      {/* Unified Feed Layout */}
      <div id="feed-grid" className={`grid gap-4 sm:gap-6 md:gap-8 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1 max-w-4xl mx-auto'
      }`}>
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} viewMode={viewMode} />
          ))
        ) : regularItems.length === 0 && featuredItems.length === 0 ? (
          <div className="col-span-full">
            <EmptyState 
              icon={SearchX}
              title="No updates match your filters"
              description="Try adjusting your search terms or filters to find what you're looking for."
              actionLabel="Clear All Filters"
              onAction={onClearFilters}
            />
          </div>
        ) : (
          <>
            {regularItems.map((item, index) => (
              <FeedCard 
                key={`${item.link}-${index}`} 
                item={item} 
                index={index}
                onSummarize={onSummarize}
                isSummarizing={summarizingId === item.link}
                onSave={onSave}
                isSaved={prefs.savedPosts.includes(item.link)}
                viewMode={viewMode}
                subscribedCategories={prefs.subscribedCategories}
                onToggleSubscription={toggleCategorySubscription}
                onSelectCategory={handleCategoryChange}
                analysis={analyses[item.link]}
                isPresentationMode={isPresentationMode}
              />
            ))}
            
            {/* Load More Sentinel */}
            {hasNextPage ? (
              <div ref={loadMoreRef} className="col-span-full flex justify-center py-8">
                <div className="flex items-center space-x-2 text-[#5f6368] dark:text-[#9aa0a6]">
                  <Loader2 className="animate-spin" size={24} />
                  <span>Loading more updates...</span>
                </div>
              </div>
            ) : (
              <div className="col-span-full flex justify-center py-12">
                <p className="text-[#5f6368] dark:text-[#9aa0a6] text-sm font-medium">
                  You've reached the end of the updates.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
