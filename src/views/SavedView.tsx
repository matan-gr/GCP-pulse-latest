import React from 'react';
import { FeedItem } from '../types';
import { FeedCard } from '../components/FeedCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { AnalysisResult } from '../types';
import { Bookmark, Trash2, BookOpen, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSavedView } from '../hooks/useSavedView';

interface SavedViewProps {
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
  onClearAll: () => void;
  onExplore: () => void;
}

export const SavedView: React.FC<SavedViewProps> = ({
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
  onClearAll,
  onExplore
}) => {
  const { handleClearAll } = useSavedView(onClearAll);

  if (loading) {
    return (
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} viewMode={viewMode} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-800">
          <Bookmark size={32} className="text-slate-400 dark:text-slate-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">
          Your reading list is empty
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-8 leading-relaxed">
          Save interesting updates, tutorials, and announcements here to read them later.
        </p>
        <button 
          onClick={onExplore}
          className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-sm group uppercase tracking-widest"
        >
          <span>Explore Updates</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
            <BookOpen size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Reading List</h2>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{items.length} articles saved</p>
          </div>
        </div>
        
        <button 
          onClick={handleClearAll}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all uppercase tracking-widest"
        >
          <Trash2 size={12} />
          <span>Clear List</span>
        </button>
      </div>

      <div className={`grid gap-8 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1 max-w-4xl mx-auto'
      }`}>
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.div
              key={`${item.link}-${index}`}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <FeedCard 
                item={item} 
                index={index}
                onSummarize={onSummarize}
                isSummarizing={summarizingId === item.link}
                onSave={() => onSave(item)}
                isSaved={true}
                viewMode={viewMode}
                subscribedCategories={subscribedCategories}
                onToggleSubscription={toggleCategorySubscription}
                onSelectCategory={handleCategoryChange}
                analysis={analyses[item.link]}
                isPresentationMode={isPresentationMode}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
