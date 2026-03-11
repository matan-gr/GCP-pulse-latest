import React, { useState } from 'react';
import { FeedItem } from '../types';
import { ShieldAlert, ShieldCheck, Search, Filter, AlertTriangle, ExternalLink, Shield, Activity, ChevronDown, ChevronUp, Sparkles, Loader2, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSecurityView } from '../hooks/useSecurityView';
import DOMPurify from 'dompurify';
import { getCategoryStyles, cn } from '../utils';

// Configure DOMPurify to open links in new tab
DOMPurify.addHook('afterSanitizeAttributes', function (node) {
  if ('target' in node) {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

interface SecurityViewProps {
  items: FeedItem[];
  loading: boolean;
  onSummarize: (item: FeedItem) => void;
  summarizingId: string | null;
}

export const SecurityView: React.FC<SecurityViewProps> = ({ 
  items, 
  loading,
  onSummarize,
  summarizingId
}) => {
  const {
    searchTerm,
    setSearchTerm,
    severityFilter,
    setSeverityFilter,
    processedData,
    filteredItems
  } = useSecurityView(items);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-[#202124] p-6 rounded-2xl border border-[#dadce0] dark:border-[#3c4043] shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute -bottom-4 -right-4 opacity-5 transform rotate-12 scale-150 transition-transform group-hover:scale-125 duration-500">
            <Shield size={80} className="text-[#1a73e8]" />
          </div>
          <div className="relative z-10">
            <p className="text-[#5f6368] dark:text-[#9aa0a6] text-[10px] font-bold uppercase tracking-widest mb-1">Total Bulletins</p>
            <h3 className="text-3xl font-black text-[#202124] dark:text-[#e8eaed]">{processedData.stats.total}</h3>
            <div className="mt-4 flex items-center text-[#1a73e8] dark:text-[#8ab4f8] text-[10px] font-bold uppercase tracking-widest">
              <Activity size={12} className="mr-1.5" />
              <span>Active Monitoring</span>
            </div>
          </div>
        </div>

        <StatCard 
          label="Critical Severity" 
          value={processedData.stats.critical} 
          icon={ShieldAlert} 
          color="red" 
        />
        <StatCard 
          label="High Severity" 
          value={processedData.stats.high} 
          icon={AlertTriangle} 
          color="orange" 
        />
        <StatCard 
          label="Medium Severity" 
          value={processedData.stats.medium} 
          icon={ShieldCheck} 
          color="yellow" 
        />
      </div>

      {/* Controls */}
      <div className="sticky top-[64px] z-20 bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-[#dadce0] dark:border-[#3c4043] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between transition-all">
        <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
          <div className="mr-2 p-2 bg-[#f1f3f4] dark:bg-[#3c4043] rounded-xl text-[#5f6368] dark:text-[#9aa0a6]">
            <Filter size={16} />
          </div>
          {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                severityFilter === sev 
                  ? 'bg-[#1a73e8] text-white shadow-sm' 
                  : 'text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80 group">
          <Search size={16} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#5f6368] dark:text-[#9aa0a6] group-focus-within:text-[#1a73e8] transition-colors" />
          <input 
            type="text" 
            placeholder="Search bulletins, CVEs, products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-[#f1f3f4] dark:bg-[#303134] border border-transparent focus:bg-white dark:focus:bg-[#202124] focus:border-[#1a73e8] dark:focus:border-[#8ab4f8] rounded-xl outline-none transition-all text-[13px] font-medium text-[#202124] dark:text-[#e8eaed]"
          />
        </div>
      </div>

      {/* Bulletin List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <SecurityItemCard 
                key={item.id} 
                item={item} 
                index={index} 
                onSummarize={onSummarize} 
                summarizingId={summarizingId} 
              />
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#202124] rounded-2xl border border-dashed border-[#dadce0] dark:border-[#3c4043]"
            >
              <div className="w-16 h-16 bg-[#f1f3f4] dark:bg-[#3c4043] rounded-full flex items-center justify-center mb-4">
                <ShieldCheck size={32} className="text-[#dadce0] dark:text-[#5f6368]" />
              </div>
              <h3 className="text-md font-bold text-[#202124] dark:text-[#e8eaed]">No bulletins found</h3>
              <p className="text-[#5f6368] dark:text-[#9aa0a6] mt-1 text-[12px]">Try adjusting your filters or search terms.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const SecurityItemCard = ({ item, index, onSummarize, summarizingId }: { item: FeedItem, index: number, onSummarize: (item: FeedItem) => void, summarizingId: string | null }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Use content if available (rich HTML), otherwise fallback to snippet
  const contentToRender = item.content || item.contentSnippet || '';
  const sanitizedContent = DOMPurify.sanitize(contentToRender);

  const getSeverityBorder = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'border-l-rose-500';
      case 'High': return 'border-l-orange-500';
      case 'Medium': return 'border-l-amber-500';
      default: return 'border-l-blue-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "group relative rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md bg-white dark:bg-[#202124] border-[#dadce0] dark:border-[#3c4043] hover:border-[#1a73e8]/30 dark:hover:border-[#8ab4f8]/30 border-l-[6px]",
        getSeverityBorder(item.severity)
      )}
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <SeverityBadge severity={item.severity} />
              <span className="text-[9px] font-bold text-[#5f6368] dark:text-[#9aa0a6] flex items-center bg-[#f1f3f4] dark:bg-[#3c4043] px-2 py-0.5 rounded text-center uppercase tracking-widest border border-[#dadce0] dark:border-[#5f6368]">
                {new Date(item.isoDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h3 className="text-lg font-heading font-semibold text-[#202124] dark:text-[#e8eaed] leading-snug group-hover:text-[#1a73e8] dark:group-hover:text-[#8ab4f8] transition-colors tracking-tight">
              <a href={item.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                {item.title}
              </a>
            </h3>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0 self-start">
            <button 
              onClick={(e) => { e.stopPropagation(); onSummarize(item); }}
              disabled={summarizingId === item.link}
              className="inline-flex items-center px-3 py-1.5 bg-[#1a73e8] dark:bg-[#8ab4f8] text-white dark:text-[#202124] hover:bg-[#1557b0] dark:hover:bg-[#aecbfa] rounded-lg text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-sm"
            >
              {summarizingId === item.link ? (
                <Loader2 size={12} className="animate-spin mr-1.5" />
              ) : (
                <Sparkles size={12} className="mr-1.5" />
              )}
              {summarizingId === item.link ? 'Analyzing' : 'Summarize'}
            </button>
            <a 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-[#5f6368] hover:text-[#1a73e8] dark:hover:text-[#8ab4f8] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] rounded-full transition-colors border border-[#dadce0] dark:border-[#5f6368]"
              title="View Official Bulletin"
            >
              <ExternalLink size={16} />
            </a>
          </div>
        </div>

        <div className={`relative ${isExpanded ? '' : 'max-h-24 overflow-hidden mask-linear-fade'}`}>
           <div 
             className="prose dark:prose-invert max-w-none text-[13px] text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed prose-headings:font-bold prose-headings:text-[#202124] dark:prose-headings:text-[#e8eaed] prose-a:text-[#1a73e8] dark:prose-a:text-[#8ab4f8] prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-[#f1f3f4] dark:prose-code:bg-[#3c4043] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none"
             dangerouslySetInnerHTML={{ __html: sanitizedContent }}
           />
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
          className="mt-3 text-[10px] font-bold text-[#1a73e8] dark:text-[#8ab4f8] hover:underline flex items-center uppercase tracking-widest transition-colors focus:outline-none"
        >
          {isExpanded ? (
            <>Less <ChevronUp size={10} className="ml-1" /></>
          ) : (
            <>More <ChevronDown size={10} className="ml-1" /></>
          )}
        </button>

        {item.products.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-4 border-t border-[#dadce0] dark:border-[#3c4043] mt-4">
            <span className="text-[9px] font-bold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-widest flex items-center shrink-0">
              <Tag size={10} className="mr-1.5 opacity-70" />
              Affected
            </span>
            <div className="flex flex-wrap gap-1.5">
              {item.products.slice(0, 6).map(prod => (
                <span key={prod} className={cn(
                  "px-2 py-0.5 text-[9px] rounded-md font-black uppercase tracking-widest border transition-all duration-300",
                  getCategoryStyles(prod)
                )}>
                  {prod}
                </span>
              ))}
              {item.products.length > 6 && (
                <span className="px-2 py-0.5 bg-[#f1f3f4] dark:bg-[#3c4043] text-[#5f6368] dark:text-[#9aa0a6] text-[9px] rounded-md font-bold border border-[#dadce0] dark:border-[#5f6368]">
                  +{item.products.length - 6}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }: any) => {
  const colors = {
    red: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-900/30',
    orange: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/30',
    yellow: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30',
  };

  const activeColor = colors[color as keyof typeof colors];

  return (
    <div className="bg-white dark:bg-[#202124] p-6 rounded-2xl border border-[#dadce0] dark:border-[#3c4043] shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl border ${activeColor}`}>
          <Icon size={24} />
        </div>
        {/* Decorative background icon */}
        <div className="absolute -bottom-4 -right-4 opacity-5 transform rotate-12 scale-150 transition-transform group-hover:scale-125 duration-500">
           <Icon size={80} className={activeColor.split(' ')[0]} />
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-black text-[#202124] dark:text-[#e8eaed] mb-1">{value}</h3>
        <p className="text-[10px] font-bold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
};

const SeverityBadge = ({ severity }: { severity: string }) => {
  let styles = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
  let Icon = Shield;

  if (severity === 'Critical') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800';
    Icon = ShieldAlert;
  } else if (severity === 'High') {
    styles = 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800';
    Icon = AlertTriangle;
  } else if (severity === 'Medium') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800';
    Icon = ShieldCheck;
  }

  return (
    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest flex items-center border shadow-sm ${styles}`}>
      <Icon size={12} className="mr-1.5" />
      {severity}
    </span>
  );
};
