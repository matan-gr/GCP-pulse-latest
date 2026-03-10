import React, { useState, useMemo } from 'react';
import { FeedItem } from '../types';
import { StatusDashboard } from '../components/StatusDashboard';
import { FeedCard } from '../components/FeedCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { AnalysisResult } from '../types';
import { EmptyState } from '../components/EmptyState';
import { Loader2, LayoutTemplate, AlignJustify, Grid, Download, TrendingUp, Filter, SearchX, X, Search } from 'lucide-react';
import { UserPreferences } from '../hooks/useUserPreferences';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useStandardFeedView } from '../hooks/useStandardFeedView';
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
}) => {
  // View Customization State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const { visibleItems, loadMoreRef, hasMore } = useStandardFeedView(allFeedItems);

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
    return visibleItems.filter(item => !featuredLinks.has(item.link));
  }, [visibleItems, featuredItems]);

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
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-[72px] z-20"
      >
        <div className="flex flex-col gap-4 bg-white dark:bg-[#202124] p-4 rounded-[24px] border border-[#dadce0] dark:border-[#3c4043] shadow-sm transition-all">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#f1f3f4] dark:bg-[#303134] rounded-xl text-[#5f6368] dark:text-[#9aa0a6]">
                <LayoutTemplate size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#202124] dark:text-[#e8eaed] tracking-tight leading-none mb-1">Discover</h2>
                <p className="text-[10px] font-bold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-widest">Intelligence Feed</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Export Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExportHTML}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-[11px] font-black transition-all whitespace-nowrap bg-[#f8f9fa] dark:bg-[#303134] text-[#5f6368] dark:text-[#9aa0a6] border border-[#dadce0] dark:border-[#3c4043] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] uppercase tracking-widest shadow-sm"
                title="Export to HTML"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Export</span>
              </motion.button>

              <div className="w-px h-6 bg-[#dadce0] dark:bg-[#3c4043] mx-1" />

              <div className="flex items-center bg-[#f1f3f4] dark:bg-[#303134] rounded-lg p-1 border border-transparent">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all flex items-center space-x-1.5 ${
                    viewMode === 'grid' 
                      ? 'bg-white dark:bg-[#202124] shadow-sm text-[#1a73e8] dark:text-[#8ab4f8]' 
                      : 'text-[#5f6368] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:text-[#e8eaed]'
                  }`}
                  title="Grid View"
                >
                  <Grid size={16} />
                  <span className="text-[11px] font-black hidden lg:inline uppercase tracking-widest">Grid</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all flex items-center space-x-1.5 ${
                    viewMode === 'list' 
                      ? 'bg-white dark:bg-[#202124] shadow-sm text-[#1a73e8] dark:text-[#8ab4f8]' 
                      : 'text-[#5f6368] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:text-[#e8eaed]'
                  }`}
                  title="List View"
                >
                  <AlignJustify size={16} />
                  <span className="text-[11px] font-black hidden lg:inline uppercase tracking-widest">List</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-widest mr-2 whitespace-nowrap">
              <Filter size={12} />
              <span>Filters:</span>
            </div>
            
            {(search || prefs.filterCategories.length > 0) && (
              <button
                onClick={onClearFilters}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black bg-[#f1f3f4] dark:bg-[#303134] text-[#5f6368] dark:text-[#9aa0a6] border border-[#dadce0] dark:border-[#3c4043] hover:bg-[#e8eaed] dark:hover:bg-[#3c4043] transition-all uppercase tracking-widest whitespace-nowrap active:scale-95"
              >
                <X size={12} />
                <span>Clear All</span>
              </button>
            )}

            {search && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black bg-[#1a73e8] text-white border border-[#1a73e8] shadow-sm whitespace-nowrap uppercase tracking-widest">
                <Search size={12} />
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
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all whitespace-nowrap border uppercase tracking-widest active:scale-95",
                    isActive
                      ? `bg-[#1a73e8] text-white border-[#1a73e8] shadow-md scale-105 z-10`
                      : cn(
                          "bg-white dark:bg-[#202124] text-[#5f6368] dark:text-[#9aa0a6] border-[#dadce0] dark:border-[#3c4043] hover:border-[#bdc1c6] dark:hover:border-[#5f6368] hover:bg-[#f8f9fa] dark:hover:bg-[#303134]",
                          getCategoryStyles(name)
                        )
                  )}
                >
                  <span>{name}</span>
                  <span className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded-md font-black",
                    isActive
                      ? `bg-white/20 text-white`
                      : `bg-[#f1f3f4] dark:bg-[#303134] text-[#5f6368] dark:text-[#9aa0a6]`
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
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
      <div id="feed-grid" className={`grid gap-8 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
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
            {hasMore ? (
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
