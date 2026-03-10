import React, { useState } from 'react';
import { FeedItem } from '../types';
import { CheckCircle2, AlertTriangle, Copy, ChevronDown, ChevronUp, ExternalLink, Clock, Activity, Search, History, AlertOctagon, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useIncidentsView } from '../hooks/useIncidentsView';
import ReactMarkdown from 'react-markdown';
import { getCategoryStyles, cn } from '../utils';

interface IncidentsViewProps {
  items: FeedItem[];
  loading: boolean;
}

const FormattedUpdateText = ({ text }: { text: string }) => {
  if (!text) return null;

  return (
    <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed prose dark:prose-invert max-w-none prose-sm prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0">
      <ReactMarkdown
        components={{
          strong: ({...props}) => <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-1 rounded" {...props} />,
          h1: ({...props}) => <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3 mb-1" {...props} />,
          h2: ({...props}) => <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-2 mb-1" {...props} />,
          h3: ({...props}) => <h5 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-2 mb-1" {...props} />,
          ul: ({...props}) => <ul className="list-disc list-outside ml-4 space-y-1" {...props} />,
          ol: ({...props}) => <ol className="list-decimal list-outside ml-4 space-y-1" {...props} />,
          li: ({...props}) => <li className="pl-1" {...props} />,
          p: ({...props}) => <p className="mb-2 last:mb-0" {...props} />,
          a: ({...props}) => <a className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};

export const IncidentsView: React.FC<IncidentsViewProps> = ({ items, loading }) => {
  const {
    currentYear,
    activeIncidents,
    historyIncidents,
    getDuration,
    handleCopyUpdate,
    expandedIncidentId,
    toggleExpand
  } = useIncidentsView(items);

  const [historySearch, setHistorySearch] = useState('');

  const filteredHistory = historyIncidents.filter(item => 
    (item.serviceName || '').toLowerCase().includes(historySearch.toLowerCase()) ||
    (item.title || '').toLowerCase().includes(historySearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* System Status Hero */}
      <div className={`relative overflow-hidden rounded-2xl p-8 md:p-12 text-center md:text-left transition-all duration-500 ${
        activeIncidents.length === 0 
          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20' 
          : 'bg-gradient-to-br from-red-600 to-orange-600 text-white shadow-lg shadow-red-600/20'
      }`}>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
              {activeIncidents.length === 0 ? <CheckCircle2 size={32} /> : <AlertOctagon size={32} className="animate-pulse" />}
              <span className="text-sm font-bold uppercase tracking-widest opacity-90">System Status</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              {activeIncidents.length === 0 ? 'All Systems Operational' : `${activeIncidents.length} Active Incident${activeIncidents.length > 1 ? 's' : ''}`}
            </h1>
            <p className="text-lg opacity-90 max-w-2xl mb-6">
              {activeIncidents.length === 0 
                ? 'Google Cloud Platform services are running normally. No active incidents reported.' 
                : 'Our engineering teams are investigating issues affecting some Google Cloud services.'}
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://status.cloud.google.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl text-sm font-bold transition-all"
              >
                Status Page <ExternalLink size={14} className="ml-2" />
              </a>
              <button 
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl text-sm font-bold transition-all"
              >
                <RefreshCw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 md:gap-8 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
              <div className="text-center px-4">
                <div className="text-2xl font-bold">{activeIncidents.length}</div>
                <div className="text-xs font-medium opacity-80 uppercase">Active</div>
              </div>
              <div className="w-px bg-white/20"></div>
              <div className="text-center px-4">
                <div className="text-2xl font-bold">{historyIncidents.length}</div>
                <div className="text-xs font-medium opacity-80 uppercase">Resolved</div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Last Checked</p>
              <p className="text-xs font-bold">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10 transform rotate-12 scale-150 pointer-events-none">
          {activeIncidents.length === 0 ? <Activity size={300} /> : <AlertTriangle size={300} />}
        </div>
      </div>

      {/* Active Incidents Section */}
      {activeIncidents.length > 0 && (
        <section>
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Live Updates</h2>
          </div>
          
          <div className="grid gap-6">
            {activeIncidents.map(item => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden transition-all ${
                  expandedIncidentId === item.id 
                    ? 'border-rose-500 ring-1 ring-rose-500 shadow-rose-100 dark:shadow-none' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-700'
                }`}
              >
                <div 
                  onClick={() => toggleExpand(item.id)}
                  className="p-6 cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={cn(
                          "px-3 py-1 text-[10px] font-black uppercase rounded-lg border flex items-center shadow-sm",
                          getCategoryStyles('security')
                        )}>
                          <AlertTriangle size={12} className="mr-1.5" />
                          {item.severity || "High Severity"}
                        </span>
                        <span className="text-xs text-slate-500 font-mono flex items-center">
                          <Clock size={12} className="mr-1.5" />
                          Started {new Date(item.begin || '').toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 group">
                        {item.serviceName || "GCP Service"}
                        <span className="text-slate-400 group-hover:text-slate-600 transition-colors">
                          {expandedIncidentId === item.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </span>
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
                        {item.title}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden md:block">
                        <div className="text-xs font-bold text-slate-400 uppercase">Duration</div>
                        <div className="text-sm font-mono font-medium text-rose-600 dark:text-rose-400">
                          {getDuration(item.begin || '')}
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyUpdate(item);
                        }}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                        title="Copy Latest Update"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedIncidentId === item.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
                    >
                      <div className="p-6 md:p-8">
                        <div className="flex justify-between items-center mb-6">
                           <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider flex items-center">
                             <Activity size={16} className="mr-2 text-rose-500" />
                             Incident Timeline
                           </h4>
                           <a 
                             href={item.link} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             onClick={(e) => e.stopPropagation()}
                             className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm"
                           >
                             Official Status Page <ExternalLink size={12} className="ml-1.5" />
                           </a>
                        </div>
                        
                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                          {item.updates?.map((update, idx) => (
                            <div key={idx} className="relative pl-8 group">
                              <div className={`absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 z-10 ${idx === 0 ? 'bg-rose-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-2">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                  {new Date(update.created).toLocaleDateString()}
                                </span>
                                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                  {new Date(update.created).toLocaleTimeString()}
                                </span>
                              </div>
                              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm group-hover:shadow-md transition-shadow">
                                <FormattedUpdateText text={update.text} />
                              </div>
                            </div>
                          ))}
                          {(!item.updates || item.updates.length === 0) && (
                            <div className="pl-8 text-slate-500 italic text-sm">No detailed updates available.</div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Incident History */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <History className="text-slate-400" size={20} />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Incident History
            </h2>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter history by service..." 
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs w-48">Date</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs w-64">Service</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs w-32">Duration</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Impact Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item) => (
                    <React.Fragment key={item.id}>
                      <tr 
                        onClick={() => toggleExpand(item.id)}
                        className={`transition-colors cursor-pointer group ${
                          expandedIncidentId === item.id 
                            ? 'bg-blue-50/50 dark:bg-blue-900/10' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-400 font-mono text-xs">
                          {new Date(item.begin || '').toLocaleString(undefined, { 
                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {item.serviceName || "GCP Service"}
                            <span className="text-slate-300 group-hover:text-slate-500 transition-colors">
                              {expandedIncidentId === item.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                            getCategoryStyles('ops')
                          )}>
                            {getDuration(item.begin || '', item.end)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-lg">
                          <p className="line-clamp-1 truncate">
                            {item.description || item.title}
                          </p>
                        </td>
                      </tr>
                      {expandedIncidentId === item.id && (
                        <tr className="bg-slate-50/50 dark:bg-slate-900/50">
                          <td colSpan={4} className="px-0 py-0">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-center mb-4">
                                  <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center">
                                    <Activity size={16} className="mr-2 text-blue-500" />
                                    Incident Timeline
                                  </h4>
                                  <a 
                                    href={item.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs font-bold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center transition-colors"
                                  >
                                    View Official Status Page <ExternalLink size={12} className="ml-1" />
                                  </a>
                                </div>
                                <div className="space-y-6 pl-4 border-l-2 border-slate-200 dark:border-slate-700 ml-2">
                                  {item.updates?.map((update, idx) => (
                                    <div key={idx} className="relative">
                                      <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-slate-900"></div>
                                      <div className="text-xs font-mono text-slate-400 mb-1 flex items-center">
                                        <Clock size={12} className="mr-1" />
                                        {new Date(update.created).toLocaleString()}
                                      </div>
                                      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                        <FormattedUpdateText text={update.text} />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <Search size={32} className="mb-2 opacity-50" />
                        <p>No incidents found matching your search.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
};
