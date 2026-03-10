import React, { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { FeedItem } from '../types';
import { extractImage, extractGCPProducts, cn, getCategoryColor, getCategoryStyles } from '../utils';
import { Tag, ExternalLink, Sparkles, Bookmark, Loader2, Check, AlertOctagon, Activity, Box, Link as LinkIcon, ChevronDown, ChevronUp, Clock, ArrowRight, Play, Youtube, TrendingUp, BookOpen, Zap, FileText, Shield, Layout, Cpu, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { format, differenceInDays } from 'date-fns';

import { AnalysisResult } from '../types';
import { Tooltip } from './ui/Tooltip';
import { ErrorBoundary } from './ErrorBoundary';

interface FeedCardProps {
  item: FeedItem;
  index: number;
  onSummarize: (item: FeedItem) => void;
  isSummarizing: boolean;
  onSave: (item: FeedItem) => void;
  isSaved: boolean;
  viewMode: 'grid' | 'list';
  subscribedCategories: string[];
  onToggleSubscription: (category: string) => void;
  onSelectCategory?: (category: string) => void;
  analysis?: AnalysisResult;
  isPresentationMode?: boolean;
  density?: 'comfortable' | 'compact';
  showImages?: boolean;
}

const markdownComponents = {
  a: ({node, ...props}: any) => <a {...props} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} />
};

export const FeedCard = React.memo<FeedCardProps>((props) => {
  const { item } = props;
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '400px 0px',
  });

  return (
    <div ref={ref} className="min-h-[100px]">
      {inView ? (
        <ErrorBoundary componentName={`FeedCard-${item.title}`}>
          <FeedCardContent {...props} />
        </ErrorBoundary>
      ) : (
        <div className="w-full h-64 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col space-y-4">
            <div className="flex justify-between items-center">
                <div className="w-24 h-6 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
                <div className="w-16 h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            </div>
            <div className="w-3/4 h-6 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            <div className="space-y-2">
                <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                <div className="w-2/3 h-4 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            </div>
        </div>
      )}
    </div>
  );
});

const FeedCardContent: React.FC<FeedCardProps> = ({ 
  item, 
  index, 
  onSummarize, 
  isSummarizing, 
  onSave, 
  isSaved, 
  viewMode, 
  subscribedCategories, 
  onToggleSubscription, 
  onSelectCategory, 
  analysis, 
  isPresentationMode = false, 
  density = 'comfortable', 
  showImages = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const image = item.thumbnailUrl || item.enclosure?.url || extractImage(item.content);
  const dateObj = new Date(item.isoDate);
  const date = format(dateObj, 'MMM d');

  // Calculate reading time (approx 200 words per minute)
  const wordCount = (item.contentSnippet || '').split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Calculate if item is "New" (within last 48 hours)
  const now = new Date();
  const hoursSince = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60);
  const isNew = hoursSince < 48;
  const isTrending = item.source === 'Cloud Blog' || item.source === 'Google Cloud YouTube' || (item as any).viewCount > 1000;

  const isListView = viewMode === 'list' && !isPresentationMode;
  const isIncident = item.source === 'Service Health';
  const isDeprecation = item.source === 'Deprecations';
  const isCompact = density === 'compact';

  // Calculate days until deprecation if applicable
  let daysUntilEOL = 0;
  let urgencyColor = 'bg-slate-100 text-slate-600';
  
  if (isDeprecation) {
    const futureDateMatch = item.contentSnippet?.match(/(\d{4}-\d{2}-\d{2})/);
    if (futureDateMatch) {
      const eolDate = new Date(futureDateMatch[0]);
      const diffTime = eolDate.getTime() - now.getTime();
      daysUntilEOL = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (daysUntilEOL < 30) {
        urgencyColor = 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
      } else if (daysUntilEOL < 90) {
        urgencyColor = 'bg-orange-50 text-orange-700 border-orange-200';
      } else {
        urgencyColor = 'bg-amber-50 text-amber-700 border-amber-200';
      }
    }
  }

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.link);
    toast.success("Link copied to clipboard", { description: "You can now share this article." });
  };

  const detectedProducts = analysis?.relatedProducts || extractGCPProducts(item.title + " " + item.contentSnippet);
  const displayLabels = Array.from(new Set([...detectedProducts, ...(item.categories || [])]));

  // Determine Incident Status
  let status: 'Resolved' | 'Monitoring' | 'Investigating' = 'Investigating';
  let statusColor = 'bg-rose-50 text-rose-700 border-rose-200';
  let cardBorder = 'border-rose-100';
  let iconColor = 'text-rose-600';

  if (isIncident) {
    const text = (item.title + item.contentSnippet).toLowerCase();
    if (text.includes('resolved')) {
      status = 'Resolved';
      statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      cardBorder = 'border-emerald-100';
      iconColor = 'text-emerald-600';
    } else if (text.includes('monitoring') || text.includes('identified')) {
      status = 'Monitoring';
      statusColor = 'bg-amber-50 text-amber-700 border-amber-200';
      cardBorder = 'border-amber-100';
      iconColor = 'text-amber-600';
    }
  }

  const getSourceStyles = (source: string) => {
    switch (source) {
      case 'Cloud Blog': return 'bg-[#e8f0fe] text-[#1a73e8] border-[#d2e3fc] dark:bg-[#1a73e8]/10 dark:text-[#8ab4f8] dark:border-[#8ab4f8]/20';
      case 'Updates and Innovation':
      case 'Product Updates': return 'bg-[#fef7e0] text-[#b06000] border-[#feefc3] dark:bg-[#f9ab00]/10 dark:text-[#fdd663] dark:border-[#fdd663]/20';
      case 'Release Notes': return 'bg-[#e6f4ea] text-[#1e8e3e] border-[#ceead6] dark:bg-[#1e8e3e]/10 dark:text-[#81c995] dark:border-[#81c995]/20';
      case 'Security Bulletins': return 'bg-[#fce8e6] text-[#d93025] border-[#fad2cf] dark:bg-[#d93025]/10 dark:text-[#f28b82] dark:border-[#f28b82]/20';
      case 'Architecture Center': return 'bg-[#f3e8fd] text-[#9334e6] border-[#e9d2fd] dark:bg-[#9334e6]/10 dark:text-[#c58af9] dark:border-[#c58af9]/20';
      case 'Google AI Research':
      case 'Gemini Enterprise': return 'bg-[#f3e8fd] text-[#9334e6] border-[#e9d2fd] dark:bg-[#9334e6]/10 dark:text-[#c58af9] dark:border-[#c58af9]/20';
      case 'Product Deprecations': return 'bg-[#f1f3f4] text-[#5f6368] border-[#dadce0] dark:bg-[#3c4043] dark:text-[#9aa0a6] dark:border-[#5f6368]/30';
      case 'Google Cloud YouTube': return 'bg-[#fce8e6] text-[#d93025] border-[#fad2cf] dark:bg-[#d93025]/10 dark:text-[#f28b82] dark:border-[#f28b82]/20';
      default: return 'bg-[#f1f3f4] text-[#5f6368] border-[#dadce0] dark:bg-[#3c4043] dark:text-[#9aa0a6] dark:border-[#5f6368]/30';
    }
  };

  const SourceIcon = ({ source, size = 10 }: { source: string, size?: number }) => {
    switch (source) {
      case 'Cloud Blog': return <BookOpen size={size} />;
      case 'Updates and Innovation':
      case 'Product Updates': return <Zap size={size} />;
      case 'Release Notes': return <FileText size={size} />;
      case 'Security Bulletins': return <Shield size={size} />;
      case 'Architecture Center': return <Layout size={size} />;
      case 'Google AI Research': return <Cpu size={size} />;
      case 'Gemini Enterprise': return <Sparkles size={size} />;
      case 'Product Deprecations': return <AlertTriangle size={size} />;
      case 'Google Cloud YouTube': return <Youtube size={size} />;
      default: return <Tag size={size} />;
    }
  };

  const getBorderColor = (source: string) => {
    switch (source) {
      case 'Cloud Blog': return 'border-l-blue-500';
      case 'Product Updates': return 'border-l-emerald-500';
      case 'Release Notes': return 'border-l-blue-500';
      case 'Security Bulletins': return 'border-l-rose-500';
      case 'Architecture Center': return 'border-l-orange-500';
      case 'Google AI Research': return 'border-l-blue-500';
      case 'Gemini Enterprise': return 'border-l-fuchsia-500';
      case 'Product Deprecations': return 'border-l-amber-500';
      case 'Google Cloud YouTube': return 'border-l-red-500';
      default: return 'border-l-transparent';
    }
  };

  // Incident Card Design
  if (isIncident) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`rounded-[24px] shadow-sm border ${cardBorder} dark:border-[#3c4043] flex flex-col relative overflow-hidden group hover:shadow-md transition-all duration-300 bg-white dark:bg-[#202124] ${isPresentationMode ? 'scale-105 shadow-xl' : ''}`}
      >
        {/* Status Header */}
        <div className={`px-5 py-3 border-b ${cardBorder} dark:border-[#3c4043] ${status === 'Resolved' ? 'bg-[#e6f4ea] dark:bg-[#1e8e3e]/10' : status === 'Monitoring' ? 'bg-[#fef7e0] dark:bg-[#f9ab00]/10' : 'bg-[#fce8e6] dark:bg-[#d93025]/10'} flex justify-between items-center`}>
           <div className="flex items-center space-x-2">
              {status === 'Resolved' ? <Check size={14} className={iconColor} /> : <AlertOctagon size={14} className={iconColor} />}
              <span className={`text-[11px] font-bold uppercase tracking-wider ${iconColor}`}>
                {status}
              </span>
           </div>
           <span className="text-[10px] text-[#5f6368] dark:text-[#9aa0a6] font-medium flex items-center">
              <Clock size={12} className="mr-1.5" />
              {new Date(item.isoDate).toLocaleString()}
           </span>
        </div>

        <div className={`${isCompact ? 'p-4' : 'p-5'} flex flex-col flex-1 relative`}>
          {item.serviceName && (
            <div className="mb-3">
              <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#f1f3f4] dark:bg-[#3c4043] text-[#5f6368] dark:text-[#9aa0a6] border border-[#dadce0] dark:border-[#5f6368]">
                <Box size={12} className="mr-1.5" />
                {item.serviceName}
              </span>
            </div>
          )}

          <h3 className={`font-semibold text-[#202124] dark:text-[#e8eaed] mb-2 z-10 relative ${isPresentationMode ? 'text-lg' : isCompact ? 'text-[15px]' : 'text-[17px]'} leading-snug`}>
            <a href={item.link} target="_blank" rel="noopener noreferrer" className={`hover:text-[#1a73e8] dark:hover:text-[#8ab4f8] transition-colors`}>
              {item.title}
            </a>
          </h3>

          <p className={`text-[#5f6368] dark:text-[#9aa0a6] text-[14px] mb-5 z-10 relative flex-1 leading-relaxed ${isPresentationMode ? 'line-clamp-4' : 'line-clamp-3'}`}>
            {item.contentSnippet}
          </p>

          <div className="mt-auto z-10 flex items-center justify-between relative pt-4 border-t border-[#dadce0] dark:border-[#3c4043]">
            <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`inline-flex items-center text-[11px] font-bold uppercase tracking-wider hover:underline transition-colors ${iconColor}`}
            >
                View Incident <ArrowRight size={12} className="ml-1.5" />
            </a>
            
            {!isPresentationMode && (
              <div className="flex space-x-1">
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSummarize(item);
                    }}
                    disabled={isSummarizing}
                    className={`p-2 rounded-full hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] transition-colors ${iconColor}`}
                    title="Summarize Incident"
                >
                  {isSummarizing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Standard Feed Card Design
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "flex group relative rounded-[24px] overflow-hidden transition-all duration-300 glass-card",
        isListView ? "flex-row min-h-[140px]" : "flex-col h-full",
        isSaved && "ring-2 ring-[#1a73e8] ring-offset-2 dark:ring-offset-[#202124]",
        "border-l-4",
        getBorderColor(item.source),
        "hover:-translate-y-1"
      )}
    >
      {/* Deprecation Warning Banner */}
      {isDeprecation && daysUntilEOL > 0 && (
        <div className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between border-b ${urgencyColor}`}>
          <span className="flex items-center">
            <AlertOctagon size={12} className="mr-2" />
            Deprecation Notice
          </span>
          <span>{daysUntilEOL} Days Left</span>
        </div>
      )}

      {/* Image Section */}
      {image && !isPresentationMode && showImages && (
        <div 
          className={`${isListView ? 'w-56 min-w-[224px]' : isCompact ? 'h-36' : 'h-48'} overflow-hidden relative cursor-pointer group/image bg-[#f8f9fa] dark:bg-[#303134] border-b border-[#dadce0] dark:border-[#3c4043]`}
          onClick={(e) => {
            e.stopPropagation();
            onSummarize(item);
          }}
        >
            <img 
                src={image} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
                loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/5 transition-colors duration-300" />
            
            {item.videoId && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg group-hover/image:scale-110 transition-transform duration-300">
                  <Play size={18} className="text-white ml-1 fill-white" />
                </div>
              </div>
            )}

            {item.duration && (
              <div className="absolute bottom-3 right-3 z-20">
                <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-black/70 text-white backdrop-blur-md">
                  {item.duration}
                </span>
              </div>
            )}
        </div>
      )}
      
        <div className={`${isCompact ? 'p-4' : 'p-5'} flex-1 flex flex-col ${isListView ? 'justify-between' : ''}`}>
        <div className="w-full">
          <div className={`flex items-center justify-between w-full ${isCompact ? 'mb-3' : 'mb-3'}`}>
             <div className="flex items-center space-x-2">
                {isNew && !isPresentationMode && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-[#e8f0fe] text-[#1a73e8] dark:bg-[#8ab4f8]/20 dark:text-[#8ab4f8] border border-[#d2e3fc] dark:border-[#8ab4f8]/30 uppercase tracking-widest">
                    <Sparkles size={10} className="text-[#1a73e8] dark:text-[#8ab4f8]" />
                    NEW
                  </span>
                )}
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all duration-300 hover:shadow-sm",
                  getSourceStyles(item.source)
                )}>
                  <SourceIcon source={item.source} />
                  {item.source}
                </span>
                {isTrending && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-[#f1f3f4] text-[#5f6368] dark:bg-[#3c4043] dark:text-[#9aa0a6] border border-[#dadce0] dark:border-[#5f6368] uppercase tracking-widest">
                    <TrendingUp size={10} />
                    TRENDING
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black text-[#5f6368] dark:text-[#9aa0a6] bg-[#f1f3f4] dark:bg-[#3c4043] border border-[#dadce0] dark:border-[#5f6368]/30 uppercase tracking-widest">
                  <Clock size={10} />
                  {readingTime}m
                </span>
             </div>
             <span className="text-[10px] text-[#5f6368] dark:text-[#9aa0a6] font-black uppercase tracking-[0.2em] tabular-nums">
                {date}
             </span>
          </div>
          
          <h3 className={`font-semibold text-[#202124] dark:text-[#e8eaed] ${isCompact ? 'mb-2 text-[15px]' : 'mb-2 text-[17px]'} group-hover:text-[#1a73e8] dark:group-hover:text-[#8ab4f8] transition-colors leading-snug tracking-tight`}>
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="focus:outline-none">
                  {item.title}
              </a>
          </h3>

          {item.channelName && (
            <div className="mb-3 flex items-center text-[12px] text-[#5f6368] dark:text-[#9aa0a6]">
              <Youtube size={14} className="mr-1.5 text-[#ea4335]" />
              <span className="font-medium">{item.channelName}</span>
            </div>
          )}

          {/* Product Labels for Release Notes */}
          {(item.source === 'Release Notes' || item.source === 'Gemini Enterprise') && displayLabels.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1.5">
              {displayLabels.slice(0, 3).map((label) => (
                <span key={label} className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black bg-[#f1f3f4] text-[#5f6368] dark:bg-[#3c4043] dark:text-[#9aa0a6] border border-[#dadce0] dark:border-[#5f6368] uppercase tracking-widest transition-all hover:bg-[#e8f0fe] hover:text-[#1a73e8] hover:border-[#d2e3fc]">
                  <Tag size={10} className="mr-1.5 opacity-70" />
                  {label}
                </span>
              ))}
            </div>
          )}
          
          <div className={`relative ${isCompact ? 'mb-2' : 'mb-3'}`}>
            <div className={`text-[#5f6368] dark:text-[#9aa0a6] ${isCompact ? 'text-[13px] leading-relaxed line-clamp-2' : 'text-[14px] leading-relaxed'} ${!isExpanded && !isCompact && !isPresentationMode ? 'line-clamp-3' : ''} prose dark:prose-invert max-w-none prose-p:my-0`}>
                <ReactMarkdown 
                  components={markdownComponents}
                >
                  {item.contentSnippet || ''}
                </ReactMarkdown>
            </div>
            {item.contentSnippet && item.contentSnippet.length > 150 && !isPresentationMode && !isCompact && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIsExpanded(!isExpanded);
                }}
                className="text-[10px] font-bold text-[#5f6368] hover:text-[#1a73e8] dark:hover:text-[#8ab4f8] mt-1.5 flex items-center focus:outline-none uppercase tracking-widest transition-colors"
              >
                {isExpanded ? (
                  <>Less <ChevronUp size={12} className="ml-0.5" /></>
                ) : (
                  <>More <ChevronDown size={12} className="ml-0.5" /></>
                )}
              </button>
            )}
          </div>

          {/* Categories */}
          {!isPresentationMode && !isCompact && (
          <div className="mb-4 flex flex-wrap gap-2">
              {displayLabels.slice(0, 3).map((cat) => {
                const isSubscribed = subscribedCategories.includes(cat);
                return (
                  <button 
                    key={cat} 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectCategory) onSelectCategory(cat);
                      else onToggleSubscription(cat);
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 border shadow-sm hover:scale-105 active:scale-95",
                      isSubscribed 
                        ? 'bg-[#1a73e8] text-white border-[#1a73e8] shadow-blue-200'
                        : getCategoryStyles(cat)
                    )}
                  >
                      <span className="truncate max-w-[120px]">{cat}</span>
                  </button>
                );
              })}
          </div>
          )}

          {analysis && (
            <div className={`mb-4 bg-[#e8f0fe] dark:bg-[#8ab4f8]/10 rounded-2xl border border-[#d2e3fc] dark:border-[#8ab4f8]/20 ${isCompact ? 'p-3' : 'p-4'} relative overflow-hidden group/ai`}>
              <div className="flex items-center text-[10px] font-bold text-[#1a73e8] dark:text-[#8ab4f8] uppercase tracking-widest mb-2">
                <Sparkles size={12} className="mr-1.5" />
                AI Insight
              </div>
              <p className={`text-[#202124] dark:text-[#e8eaed] leading-relaxed relative z-10 ${isCompact ? 'text-[12px] line-clamp-2' : 'text-[13px] line-clamp-3'}`}>
                {analysis.impact}
              </p>
            </div>
          )}
        </div>
        
        <div className={`mt-auto ${!isListView ? `pt-3 border-t border-[#dadce0] dark:border-[#3c4043] ${isCompact ? 'pt-2' : 'pt-3'}` : ''}`}>
            <div className="flex items-center justify-between w-full">
                <a 
                    href={item.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[11px] font-bold uppercase tracking-widest text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#1a73e8] dark:hover:text-[#8ab4f8] transition-colors group/link"
                >
                    Read <ArrowRight size={12} className="ml-1.5 opacity-50 group-hover/link:opacity-100 transition-opacity" />
                </a>

                {!isPresentationMode && (
                <div className="flex items-center space-x-1">
                  <Tooltip content="Copy Link" position="top">
                    <button
                      onClick={handleCopyLink}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-[#5f6368] hover:text-[#202124] dark:hover:text-[#e8eaed] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] transition-colors"
                      aria-label="Copy Link"
                    >
                      <LinkIcon size={14} />
                    </button>
                  </Tooltip>

                  <Tooltip content={isSaved ? "Remove" : "Save"} position="top">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSave(item);
                      }}
                      className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isSaved ? 'text-[#1a73e8] dark:text-[#8ab4f8] bg-[#e8f0fe] dark:bg-[#8ab4f8]/20' : 'text-[#5f6368] hover:text-[#202124] dark:hover:text-[#e8eaed] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043]'}`}
                      aria-label={isSaved ? "Remove from Read Later" : "Read Later"}
                    >
                      <Bookmark size={14} className={isSaved ? "fill-current" : ""} />
                    </button>
                  </Tooltip>

                <Tooltip content="AI Summary" position="top">
                  <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSummarize(item);
                      }}
                      disabled={isSummarizing}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#1a73e8] dark:bg-[#8ab4f8] text-white dark:text-[#202124] hover:bg-[#1557b0] dark:hover:bg-[#aecbfa] transition-colors text-[10px] font-black disabled:opacity-50 border border-transparent ml-2 uppercase tracking-widest"
                      aria-label="Generate AI Summary"
                  >
                      {isSummarizing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="mr-1.5" />}
                      {isSummarizing ? '' : 'Summarize'}
                  </button>
                </Tooltip>
                </div>
                )}
            </div>
        </div>
      </div>
    </motion.div>
  );
};
