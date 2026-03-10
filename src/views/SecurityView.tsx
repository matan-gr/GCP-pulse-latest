import React, { useState } from 'react';
import { FeedItem } from '../types';
import { ShieldAlert, ShieldCheck, Search, Filter, AlertTriangle, CheckCircle, ExternalLink, Zap, Shield, Activity, ChevronDown, ChevronUp } from 'lucide-react';
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
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
            <Shield size={100} />
          </div>
          <div className="relative z-10">
            <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Total Bulletins</p>
            <h3 className="text-4xl font-extrabold">{processedData.stats.total}</h3>
            <div className="mt-4 flex items-center text-blue-100 text-sm">
              <Activity size={14} className="mr-1" />
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
      <div className="sticky top-[72px] z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between transition-all">
        <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 custom-scrollbar">
          <div className="mr-3 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500">
            <Filter size={18} />
          </div>
          {(['All', 'Critical', 'High', 'Medium', 'Low'] as const).map(sev => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                severityFilter === sev 
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md transform scale-105' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80 group">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search bulletins, CVEs, products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-medium"
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
              className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700"
            >
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck size={32} className="text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No bulletins found</h3>
              <p className="text-slate-500 mt-2 text-sm">Try adjusting your filters or search terms.</p>
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => window.open(item.link, '_blank')}
      className={`group relative rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-lg bg-white dark:bg-slate-900 cursor-pointer ${
        item.severity === 'Critical' ? 'border-l-[6px] border-l-red-500 border-slate-200 dark:border-slate-800' :
        item.severity === 'High' ? 'border-l-[6px] border-l-orange-500 border-slate-200 dark:border-slate-800' :
        item.severity === 'Medium' ? 'border-l-[6px] border-l-yellow-500 border-slate-200 dark:border-slate-800' :
        'border-l-[6px] border-l-blue-500 border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <SeverityBadge severity={item.severity} />
              <span className="text-xs font-medium text-slate-500 flex items-center bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                {new Date(item.isoDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              <a href={item.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                {item.title}
              </a>
            </h3>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0 self-start">
            <button 
              onClick={(e) => { e.stopPropagation(); onSummarize(item); }}
              disabled={summarizingId === item.link}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-900/20 dark:to-blue-900/20 hover:from-blue-100 hover:to-blue-100 dark:hover:from-blue-900/30 dark:hover:to-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold transition-all disabled:opacity-50 border border-blue-100 dark:border-blue-800/50 shadow-sm hover:shadow"
            >
              <Zap size={14} className={`mr-2 ${summarizingId === item.link ? 'animate-spin' : 'fill-blue-500 text-blue-600'}`} />
              {summarizingId === item.link ? 'Analyzing...' : 'AI Analysis'}
            </button>
            <a 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="View Official Bulletin"
            >
              <ExternalLink size={20} />
            </a>
          </div>
        </div>

        <div className={`relative ${isExpanded ? '' : 'max-h-32 overflow-hidden mask-linear-fade'}`}>
           <div 
             className="prose dark:prose-invert max-w-none text-sm text-slate-600 dark:text-slate-300 leading-relaxed prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none"
             dangerouslySetInnerHTML={{ __html: sanitizedContent }}
           />
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
          className="mt-4 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center uppercase tracking-wide transition-colors focus:outline-none"
        >
          {isExpanded ? (
            <>Show Less <ChevronUp size={12} className="ml-1" /></>
          ) : (
            <>Read Full Bulletin <ChevronDown size={12} className="ml-1" /></>
          )}
        </button>

        {item.products.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-5 border-t border-slate-100 dark:border-slate-800 mt-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center shrink-0">
              <Search size={12} className="mr-1.5" />
              Affected Products
            </span>
            <div className="flex flex-wrap gap-2">
              {item.products.slice(0, 6).map(prod => (
                <span key={prod} className={cn(
                  "px-2.5 py-1 text-[10px] rounded-md font-black uppercase tracking-widest border transition-all duration-300",
                  getCategoryStyles(prod)
                )}>
                  {prod}
                </span>
              ))}
              {item.products.length > 6 && (
                <span className="px-2 py-1 bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[10px] rounded-md font-bold border border-transparent">
                  +{item.products.length - 6} more
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
    red: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30',
    orange: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/30',
    yellow: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-900/30',
  };

  const activeColor = colors[color as keyof typeof colors];

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${activeColor}`}>
          <Icon size={24} />
        </div>
        {/* Decorative background icon */}
        <div className="absolute -bottom-4 -right-4 opacity-5 transform rotate-12 scale-150 transition-transform group-hover:scale-125 duration-500">
           <Icon size={80} className={activeColor.split(' ')[0]} />
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">{value}</h3>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
};

const SeverityBadge = ({ severity }: { severity: string }) => {
  let styles = 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800';
  let Icon = Shield;

  if (severity === 'Critical') {
    styles = 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800';
    Icon = ShieldAlert;
  } else if (severity === 'High') {
    styles = 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800';
    Icon = AlertTriangle;
  } else if (severity === 'Medium') {
    styles = 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800';
    Icon = ShieldCheck;
  }

  return (
    <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center border shadow-sm ${styles}`}>
      <Icon size={14} className="mr-1.5" />
      {severity} Severity
    </span>
  );
};
