import React, { useState, useEffect } from 'react';
import { FeedItem } from '../types';
import { motion } from 'motion/react';
import { Youtube, ExternalLink, Calendar, Play, Clock, Eye, ThumbsUp, Key } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { getCategoryStyles, cn } from '../utils';

interface YouTubeViewProps {
  items: FeedItem[];
  loading: boolean;
  onClearFilters?: () => void;
}

export const YouTubeView: React.FC<YouTubeViewProps> = ({ items, loading, onClearFilters }) => {
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/debug-key')
      .then(res => res.json())
      .then(data => setHasApiKey(data.hasYouTubeKey))
      .catch(() => setHasApiKey(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse flex flex-col bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-full aspect-video bg-slate-200 dark:bg-slate-800" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    if (hasApiKey === false) {
      return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-[#202124] rounded-3xl border border-[#dadce0] dark:border-[#3c4043] shadow-sm max-w-2xl mx-auto mt-12">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <Key className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-heading font-bold text-[#202124] dark:text-slate-100 mb-3">
            YouTube API Key Required
          </h3>
          <p className="text-[#5f6368] dark:text-slate-400 mb-6 max-w-md">
            The YouTube RSS feed is currently blocking requests from cloud servers (429 Too Many Requests). To fetch the latest videos, you need to provide a YouTube Data API key.
          </p>
          <div className="bg-[#f8f9fa] dark:bg-[#303134] p-4 rounded-xl text-left w-full border border-[#dadce0] dark:border-[#3c4043]">
            <h4 className="text-sm font-bold text-[#202124] dark:text-slate-100 mb-2">How to fix this:</h4>
            <ol className="list-decimal list-inside text-xs text-[#5f6368] dark:text-slate-400 space-y-2">
              <li>Get an API key from the <a href="https://console.cloud.google.com/apis/library/youtube.googleapis.com" target="_blank" rel="noopener noreferrer" className="text-[#1a73e8] dark:text-[#8ab4f8] hover:underline">Google Cloud Console</a>.</li>
              <li>Open the <strong>Settings</strong> menu in AI Studio (gear icon).</li>
              <li>Add a new secret named <code className="bg-white dark:bg-[#202124] px-1.5 py-0.5 rounded border border-[#dadce0] dark:border-[#5f6368] font-mono">YOUTUBE_API_KEY</code> and paste your key.</li>
              <li>Restart the dev server.</li>
            </ol>
          </div>
        </div>
      );
    }

    return (
      <EmptyState 
        icon={Youtube}
        title="No videos found"
        description="There are currently no videos available matching your filters."
        actionLabel="Clear All Filters"
        onAction={onClearFilters}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8 bg-white/80 dark:bg-[#202124]/80 backdrop-blur-md p-6 rounded-3xl border border-white/20 dark:border-[#3c4043]/50 shadow-lg">
        <div>
          <h2 className="text-2xl font-heading font-bold text-[#202124] dark:text-slate-100 flex items-center gap-3">
            <Youtube className="w-8 h-8 text-red-500" />
            Google Cloud YouTube
          </h2>
          <p className="text-[#5f6368] dark:text-slate-400 mt-2 text-sm">
            Latest videos, tutorials, and announcements from Google Cloud.
          </p>
        </div>
        <a 
          href="https://www.youtube.com/@googlecloud" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-sm active:scale-95 border border-red-100 dark:border-red-500/20"
        >
          Visit Channel
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="group flex flex-col bg-white dark:bg-[#202124] rounded-3xl overflow-hidden border border-[#dadce0] dark:border-[#3c4043] shadow-sm hover:shadow-xl hover:border-[#1a73e8]/30 dark:hover:border-[#8ab4f8]/30 transition-all"
          >
            {item.videoId ? (
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="relative w-full aspect-video bg-slate-900 block group-hover:opacity-90 transition-opacity"
              >
                <img 
                  src={`https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                  <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
                {item.duration && (
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/80 text-white text-[10px] font-bold rounded-lg flex items-center gap-1.5 backdrop-blur-md">
                    <Clock size={12} />
                    {item.duration}
                  </div>
                )}
              </a>
            ) : (
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="relative w-full aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors"
              >
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-red-500 ml-1" />
                </div>
              </a>
            )}
            
            <div className="p-6 flex flex-col flex-grow">
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-heading font-semibold text-[#202124] dark:text-slate-100 line-clamp-2 hover:text-red-600 dark:hover:text-red-400 transition-colors mb-3 text-lg leading-snug"
              >
                {item.title}
              </a>

              {item.description && (
                <p className="text-sm text-[#5f6368] dark:text-slate-400 line-clamp-2 mb-5 leading-relaxed">
                  {item.description}
                </p>
              )}
              
              <div className="mt-auto flex flex-col gap-3">
                {item.categories && item.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {item.categories.slice(0, 3).map(cat => (
                      <span key={cat} className={cn(
                        "px-3 py-1 text-[10px] font-bold rounded-lg uppercase tracking-widest border transition-all duration-300",
                        getCategoryStyles(cat)
                      )}>
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[#5f6368] dark:text-[#9aa0a6]">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-[#202124] dark:text-[#e8eaed] font-black">
                       <Youtube size={12} className="text-[#ea4335]" />
                       {(item as any).channelTitle}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 opacity-70" />
                        {new Date(item.isoDate).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      {(item as any).duration && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 opacity-70" />
                          {(item as any).duration}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {(item as any).viewCount && (
                      <div className="flex items-center gap-1.5 bg-[#f1f3f4] dark:bg-[#3c4043] px-2 py-0.5 rounded-md">
                        {Intl.NumberFormat('en-US', { notation: 'compact' }).format((item as any).viewCount)}
                        <Eye className="w-3 h-3 opacity-70" />
                      </div>
                    )}
                    {(item as any).likeCount && (
                      <div className="flex items-center gap-1.5 text-[#d93025] bg-[#fce8e6] dark:bg-[#d93025]/10 px-2 py-0.5 rounded-md">
                        {Intl.NumberFormat('en-US', { notation: 'compact' }).format((item as any).likeCount)}
                        <ThumbsUp className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
