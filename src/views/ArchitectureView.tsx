import React, { useState, useMemo } from 'react';
import { FeedItem } from '../types';
import { Layers, ArrowRight, Star, Zap, Box, Grid, ExternalLink, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getCategoryStyles, cn } from '../utils';

interface ArchitectureViewProps {
  items: FeedItem[];
  loading: boolean;
  onSummarize: (item: FeedItem) => void;
  summarizingId: string | null;
  onSave: (item: FeedItem) => void;
  savedPosts: string[];
  isPresentationMode: boolean;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({
  items,
  loading,
  onSummarize,
  summarizingId,
  onSave,
  savedPosts,
  isPresentationMode
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>(['All']);
    items.forEach(item => {
      item.categories?.forEach(c => cats.add(c));
    });
    return Array.from(cats).sort();
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    if (selectedCategory === 'All') return items;
    return items.filter(item => item.categories?.includes(selectedCategory));
  }, [items, selectedCategory]);

  const featuredItem = filteredItems[0];
  const gridItems = filteredItems.slice(1);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center">
            <Box className="mr-3 text-blue-600 dark:text-blue-400" size={32} />
            Architecture Center
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1 flex items-center">
            Reference architectures, design patterns, and best practices.
            <a 
              href="https://docs.cloud.google.com/architecture/release-notes" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-600 dark:text-blue-400 hover:underline ml-2 text-sm flex items-center"
            >
              Source <ExternalLink size={12} className="ml-1" />
            </a>
          </p>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar max-w-full md:max-w-xl">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500 mr-2">
            <Filter size={18} />
          </div>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Hero */}
      <AnimatePresence mode="wait">
        {featuredItem && (
          <motion.div
            key={featuredItem.id || 'featured'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-2xl overflow-hidden shadow-xl group"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-slate-900 dark:bg-slate-950">
              <div className="absolute inset-0 opacity-20" 
                style={{ 
                  backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', 
                  backgroundSize: '20px 20px' 
                }} 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent" />
            </div>

            <div className="relative p-8 md:p-12 flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1 space-y-6">
                <div className="flex items-center space-x-4">
                  <span className="px-3.5 py-1.5 rounded-lg bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc] dark:bg-[#1a73e8]/10 dark:text-[#8ab4f8] dark:border-[#8ab4f8]/20 text-[10px] font-black uppercase tracking-widest">
                    Featured Pattern
                  </span>
                  <span className="text-slate-400 text-[11px] font-black uppercase tracking-widest tabular-nums">
                    {new Date(featuredItem.isoDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                  {featuredItem.title}
                </h3>

                <p className="text-slate-300 text-lg leading-relaxed max-w-2xl line-clamp-3">
                  {featuredItem.contentSnippet}
                </p>

                <div className="flex flex-wrap gap-2">
                  {featuredItem.categories?.map(cat => (
                    <span key={cat} className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest backdrop-blur-sm border transition-all duration-300",
                      getCategoryStyles(cat)
                    )}>
                      {cat}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <a 
                    href={featuredItem.link}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all hover:scale-105 flex items-center group/btn"
                  >
                    View Architecture <ArrowRight size={18} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </a>
                  <button 
                    onClick={() => onSummarize(featuredItem)}
                    disabled={summarizingId === featuredItem.link}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-colors flex items-center disabled:opacity-50"
                  >
                    <Zap size={18} className={`mr-2 ${summarizingId === featuredItem.link ? 'animate-spin' : 'text-yellow-400'}`} />
                    {summarizingId === featuredItem.link ? 'Analyzing...' : 'AI Summary'}
                  </button>
                </div>
              </div>

              {/* Decorative Icon */}
              <div className="hidden md:flex items-center justify-center w-64 h-64 bg-blue-500/10 rounded-full border border-blue-500/20 relative">
                <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-[spin_10s_linear_infinite]" />
                <Layers size={80} className="text-blue-400" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {gridItems.map((item, index) => (
            <ArchitectureCard 
              key={item.id || item.link} 
              item={item} 
              index={index}
              onSummarize={onSummarize}
              isSummarizing={summarizingId === item.link}
              onSave={onSave}
              isSaved={savedPosts.includes(item.link)}
            />
          ))}
        </AnimatePresence>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Grid size={32} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No architectures found</h3>
          <p className="text-slate-500 mt-2">Try selecting a different category.</p>
        </div>
      )}
    </div>
  );
};

const ArchitectureCard = ({ item, index, onSummarize, isSummarizing, onSave, isSaved }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="group flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 overflow-hidden"
    >
      {/* Card Header */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
            <Box size={20} />
          </div>
          <button
            onClick={() => onSave(item)}
            className={`p-2 rounded-lg transition-colors ${
              isSaved 
                ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Star size={18} className={isSaved ? "fill-current" : ""} />
          </button>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          <a href={item.link} target="_blank" rel="noopener noreferrer">
            {item.title}
          </a>
        </h3>

        <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-6 flex-1">
          {item.contentSnippet}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {item.categories?.slice(0, 3).map((cat: string) => (
            <span key={cat} className={cn(
              "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all duration-300",
              getCategoryStyles(cat)
            )}>
              {cat}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
          <div className="flex gap-2">
            <button 
              onClick={() => onSummarize(item)}
              disabled={isSummarizing}
              className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50"
              title="AI Summary"
            >
              <Zap size={18} className={isSummarizing ? "animate-spin" : ""} />
            </button>
          </div>
          
          <a 
            href={item.link}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 flex items-center transition-colors"
          >
            View Diagram <ExternalLink size={12} className="ml-1.5" />
          </a>
        </div>
      </div>
      
      {/* Bottom accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </motion.div>
  );
};
