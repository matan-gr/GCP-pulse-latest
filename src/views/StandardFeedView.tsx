import React from 'react';
import { FeedItem } from '../types';
import { FeedCard } from '../components/FeedCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { EmptyState } from '../components/EmptyState';
import { AnalysisResult } from '../types';
import { Loader2, SearchX } from 'lucide-react';
import { useStandardFeedView } from '../hooks/useStandardFeedView';

interface StandardFeedViewProps {
  items: FeedItem[];
  loading: boolean;
  viewMode: 'grid' | 'list';
  onSummarize: (item: FeedItem) => void;
  summarizingId: string | null;
  onSave: (item: FeedItem) => void;
  savedPosts: string[];
  subscribedCategories: string[];
  toggleCategorySubscription: (category: string) => void;
  handleCategoryChange: (category: string) => void;
  analyses: Record<string, AnalysisResult>;
  isPresentationMode: boolean;
  onClearFilters?: () => void;
}

export const StandardFeedView: React.FC<StandardFeedViewProps> = ({
  items,
  loading,
  viewMode,
  onSummarize,
  summarizingId,
  onSave,
  savedPosts,
  subscribedCategories,
  toggleCategorySubscription,
  handleCategoryChange,
  analyses,
  isPresentationMode,
  onClearFilters
}) => {
  const { visibleItems, loadMoreRef, hasMore } = useStandardFeedView(items);

  return (
    <div className={`grid gap-8 ${
      viewMode === 'grid' 
        ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
        : 'grid-cols-1 max-w-4xl mx-auto'
    }`}>
      {loading ? (
        Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} viewMode={viewMode} />
        ))
      ) : visibleItems.length === 0 ? (
        <div className="col-span-full">
          <EmptyState 
            icon={SearchX}
            title="No items found"
            description="No items match your current filters or search criteria."
            actionLabel="Clear All Filters"
            onAction={onClearFilters}
          />
        </div>
      ) : (
        <>
          {visibleItems.map((item, index) => (
            <FeedCard 
              key={`${item.link}-${index}`} 
              item={item} 
              index={index}
              onSummarize={onSummarize}
              isSummarizing={summarizingId === item.link}
              onSave={onSave}
              isSaved={savedPosts.includes(item.link)}
              viewMode={viewMode}
              subscribedCategories={subscribedCategories}
              onToggleSubscription={toggleCategorySubscription}
              onSelectCategory={handleCategoryChange}
              analysis={analyses[item.link]}
              isPresentationMode={isPresentationMode}
            />
          ))}
          
          {/* Load More Sentinel */}
          {hasMore ? (
            <div ref={loadMoreRef} className="col-span-full flex justify-center py-12">
              <div className="flex items-center space-x-3 text-slate-400 dark:text-slate-500">
                <Loader2 className="animate-spin" size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Loading more updates...</span>
              </div>
            </div>
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 space-y-4">
              <div className="w-12 h-px bg-slate-200 dark:bg-slate-800" />
              <p className="text-slate-400 dark:text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                You've reached the end of the feed
              </p>
              <div className="w-12 h-px bg-slate-200 dark:bg-slate-800" />
            </div>
          )}
        </>
      )}
    </div>
  );
};
