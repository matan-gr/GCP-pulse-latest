
import React, { useMemo } from 'react';
import { FeedItem } from '../types';
import { Calendar, AlertTriangle, ArrowRight, CheckCircle2, AlertOctagon, Clock, CalendarDays, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { ErrorBoundary } from './ErrorBoundary';
import { toast } from 'sonner';
import { getCategoryStyles, cn } from '../utils';

interface ProductDeprecationsTimelineProps {
  items: FeedItem[];
}

interface TimelineItem extends Omit<FeedItem, 'eolDate'> {
  eolDate: Date | null;
  daysUntil: number | null;
}

export const ProductDeprecationsTimeline: React.FC<ProductDeprecationsTimelineProps> = ({ items }) => {
  return (
    <ErrorBoundary componentName="ProductDeprecationsTimeline">
      <ProductDeprecationsTimelineContent items={items} />
    </ErrorBoundary>
  );
};

const ProductDeprecationsTimelineContent: React.FC<ProductDeprecationsTimelineProps> = ({ items }) => {
  const { sortedItems, stats, groups } = useMemo(() => {
    const processed = items.map(item => {
      // Use extracted eolDate if available, otherwise fallback to isoDate (publication date)
      const eolDate = item.eolDate ? new Date(item.eolDate) : (item.isoDate ? new Date(item.isoDate) : null);
      let daysUntil = null;
      if (eolDate) {
        const now = new Date();
        daysUntil = Math.ceil((eolDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }
      return { ...item, eolDate, daysUntil };
    }).sort((a, b) => {
      if (!a.eolDate) return 1;
      if (!b.eolDate) return -1;
      return a.eolDate.getTime() - b.eolDate.getTime();
    });

    const stats = {
      critical: processed.filter(i => i.daysUntil !== null && i.daysUntil < 90 && i.daysUntil >= 0).length,
      warning: processed.filter(i => i.daysUntil !== null && i.daysUntil >= 90 && i.daysUntil < 180).length,
      total: processed.length
    };

    const groups = {
      imminent: processed.filter(i => i.daysUntil !== null && i.daysUntil < 90 && i.daysUntil >= 0),
      upcoming: processed.filter(i => i.daysUntil !== null && i.daysUntil >= 90 && i.daysUntil < 180),
      future: processed.filter(i => i.daysUntil !== null && i.daysUntil >= 180),
      unknown: processed.filter(i => i.daysUntil === null || i.daysUntil < 0)
    };

    return { sortedItems: processed, stats, groups };
  }, [items]);

  const handleExportCalendar = () => {
    if (sortedItems.length === 0) return;
    
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//GCP Pulse//Product Deprecations//EN\n";
    
    sortedItems.forEach(item => {
      if (item.eolDate) {
        const dateStr = item.eolDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        icsContent += "BEGIN:VEVENT\n";
        icsContent += `SUMMARY:Deprecation: ${item.title}\n`;
        icsContent += `DTSTART:${dateStr}\n`;
        icsContent += `DTEND:${dateStr}\n`;
        icsContent += `DESCRIPTION:${item.contentSnippet || item.title}\\n\\nMigration Guide: ${item.link}\n`;
        icsContent += "END:VEVENT\n";
      }
    });
    
    icsContent += "END:VCALENDAR";
    
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'gcp-deprecations.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Calendar (.ics) downloaded", { description: "You can now import this into your calendar app." });
  };

  if (sortedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No Active Deprecations</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">
          Great news! There are no known product deprecations in the current feed.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header & Stats */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center">
              <CalendarDays className="mr-3 text-blue-600" size={32} />
              Product Deprecations
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Timeline of upcoming service retirements and deprecations.
            </p>
          </div>
          
          <div className="flex gap-3">
             <button 
               onClick={handleExportCalendar}
               className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
             >
               <Download size={16} className="mr-2" />
               Export Calendar
             </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
           <StatCard 
             label="Critical (90d)" 
             value={stats.critical} 
             icon={AlertOctagon} 
             color="red" 
             active={stats.critical > 0}
           />
           <StatCard 
             label="Warning (180d)" 
             value={stats.warning} 
             icon={AlertTriangle} 
             color="amber" 
             active={stats.warning > 0}
           />
           <StatCard 
             label="Total Active" 
             value={stats.total} 
             icon={Calendar} 
             color="blue" 
             active={true}
           />
        </div>

        {/* Timeline */}
        <div className="relative space-y-12 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent dark:before:via-slate-700">
          
          {groups.imminent.length > 0 && (
            <TimelineSection title="Imminent Action Required" color="red" items={groups.imminent} />
          )}
          
          {groups.upcoming.length > 0 && (
            <TimelineSection title="Plan Migration" color="amber" items={groups.upcoming} />
          )}
          
          {groups.future.length > 0 && (
            <TimelineSection title="Future Roadmap" color="blue" items={groups.future} />
          )}

          {groups.unknown.length > 0 && (
            <TimelineSection title="Past / TBD" color="slate" items={groups.unknown} />
          )}

        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, active }: any) => {
  const colors = {
    red: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30',
    blue: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30',
  };
  
  return (
    <div className={`p-4 rounded-xl border ${active ? colors[color as keyof typeof colors] : 'bg-slate-50 text-slate-400 border-slate-100 dark:bg-slate-900 dark:border-slate-800'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</span>
        <Icon size={16} />
      </div>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
};

const TimelineSection = ({ title, color, items }: { title: string, color: string, items: TimelineItem[] }) => {
  const badgeColors = {
    red: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800',
    amber: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/50 dark:text-amber-200 dark:border-amber-800',
    blue: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800',
    slate: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
  };

  return (
    <div className="relative">
      <div className="sticky top-20 z-10 flex justify-center mb-8">
        <span className={`px-4 py-1.5 rounded-lg text-sm font-black uppercase tracking-widest border shadow-sm ${badgeColors[color as keyof typeof badgeColors]}`}>
          {title}
        </span>
      </div>
      <div className="space-y-8">
        {items.map((item, idx) => (
          <TimelineCard key={idx} item={item} color={color} index={idx} />
        ))}
      </div>
    </div>
  );
};

const TimelineCard = ({ item, color, index }: { item: TimelineItem, color: string, index: number }) => {
  const isLeft = index % 2 === 0;
  
  const borderColors = {
    red: 'border-l-4 border-l-red-500',
    amber: 'border-l-4 border-l-amber-500',
    blue: 'border-l-4 border-l-blue-500',
    slate: 'border-l-4 border-l-slate-400',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group`}
    >
      {/* Timeline Dot */}
      <div className="absolute left-0 md:left-1/2 w-10 h-10 -ml-5 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-800 shadow-sm z-10 group-hover:scale-110 transition-transform">
        <Clock size={16} className={`text-${color === 'blue' ? 'blue' : color === 'slate' ? 'slate' : color}-500`} />
      </div>

      {/* Card */}
      <div className={`w-full md:w-[calc(50%-2.5rem)] ml-12 md:ml-0 p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-300 ${borderColors[color as keyof typeof borderColors]}`}>
        <div className="flex justify-between items-start mb-3">
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700`}>
            {item.eolDate ? item.eolDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Date TBD'}
          </span>
          {item.daysUntil !== null && item.daysUntil > 0 && (
            <span className={`text-xs font-bold ${item.daysUntil < 90 ? 'text-red-600 animate-pulse' : 'text-slate-500'}`}>
              {item.daysUntil} Days Left
            </span>
          )}
        </div>
        
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">
          <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
            {item.title}
          </a>
        </h3>
        
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
          {item.contentSnippet}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
           <div className="flex gap-2">
             {item.categories?.slice(0, 2).map(cat => (
               <span key={cat} className={cn(
                 "px-2 py-0.5 text-[9px] font-black rounded-lg uppercase tracking-widest border transition-all duration-300",
                 getCategoryStyles(cat)
               )}>
                 {cat}
               </span>
             ))}
           </div>
           <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-blue-600 hover:underline flex items-center">
             Migration Guide <ArrowRight size={12} className="ml-1" />
           </a>
        </div>
      </div>
    </motion.div>
  );
};
