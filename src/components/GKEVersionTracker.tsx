import React, { useState } from 'react';
import { Server, AlertTriangle, CheckCircle, Clock, ExternalLink, ShieldAlert, ChevronDown, ChevronUp, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ErrorBoundary } from './ErrorBoundary';
import { useGKEVersions, GKEChannelInfo } from '../hooks/useGKEVersions';
import { cn } from '../utils';

export const GKEVersionTracker: React.FC = () => {
  return (
    <ErrorBoundary componentName="GKEVersionTracker">
      <GKEVersionTrackerContent />
    </ErrorBoundary>
  );
};

const ChannelCard: React.FC<{ channel: GKEChannelInfo; index: number }> = ({ channel, index }) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Security Patch': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400';
      case 'Deprecated': return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400';
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400';
    }
  };

  const statusStyles = getStatusColor(channel.current.status);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex flex-col h-full rounded-[28px] border border-[#dadce0] dark:border-[#3c4043] overflow-hidden hover:shadow-xl transition-all duration-500 bg-white dark:bg-[#202124] group shadow-sm"
    >
      <div className={`p-6 border-b border-[#f1f3f4] dark:border-[#3c4043] flex justify-between items-center relative overflow-hidden`}>
        <div className={`absolute inset-0 opacity-5 ${
          channel.name === 'Stable' ? 'bg-[#1e8e3e]' :
          channel.name === 'Rapid' ? 'bg-[#1a73e8]' : 'bg-[#1a73e8]'
        }`} />
        <div className="relative z-10 flex items-center space-x-4">
           <div className={`p-2.5 rounded-2xl ${
             channel.name === 'Stable' ? 'bg-[#e6f4ea] text-[#1e8e3e]' :
             channel.name === 'Rapid' ? 'bg-[#e8f0fe] text-[#1a73e8]' : 
             'bg-[#e8f0fe] text-[#1a73e8]'
           }`}>
             <Activity size={22} />
           </div>
           <h3 className="font-black text-xl text-[#202124] dark:text-[#e8eaed] tracking-tight">{channel.name}</h3>
        </div>
        {channel.current.status === 'Security Patch' && (
          <div className="relative z-10">
             <motion.div
               animate={{ scale: [1, 1.2, 1] }}
               transition={{ duration: 2, repeat: Infinity }}
             >
                <ShieldAlert size={24} className="text-[#c5221f]" />
             </motion.div>
          </div>
        )}
      </div>

      <div className="p-8 flex-1 flex flex-col">
        <div className="mb-8">
          <div className="flex justify-between items-end mb-3">
             <span className="text-[10px] text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-[0.2em] font-black">Current Release</span>
             <span className="text-[10px] text-[#5f6368] dark:text-[#9aa0a6] bg-[#f1f3f4] dark:bg-[#3c4043] px-3 py-1 rounded-lg flex items-center font-black uppercase tracking-widest border border-[#dadce0] dark:border-[#3c4043]">
                <Clock size={12} className="mr-1.5" /> {channel.current.date}
             </span>
          </div>
          <div className="text-4xl font-mono font-black text-[#202124] dark:text-[#e8eaed] tracking-tighter">
            {channel.current.version}
          </div>
        </div>

        <div className={cn(
          "mb-8 px-4 py-2.5 rounded-xl text-[11px] font-black border flex items-center justify-center uppercase tracking-[0.2em] shadow-sm transition-all duration-300",
          statusStyles
        )}>
            {channel.current.status === 'Healthy' && <CheckCircle size={16} className="mr-2" />}
            {channel.current.status === 'Security Patch' && <ShieldAlert size={16} className="mr-2" />}
            {channel.current.status === 'Deprecated' && <AlertTriangle size={16} className="mr-2" />}
            {channel.current.status}
        </div>

        <p className="text-[14px] text-[#5f6368] dark:text-[#9aa0a6] mb-8 line-clamp-3 leading-relaxed font-medium">
          {channel.current.description}
        </p>

        {/* Collapsible History Section */}
        {channel.history.length > 0 && (
          <div className="mb-6 pt-6 border-t border-[#f1f3f4] dark:border-[#3c4043]">
            <button 
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="w-full flex justify-between items-center text-[10px] text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-[0.2em] font-black mb-3 hover:text-[#1a73e8] transition-colors group/history"
            >
              <span>Recent History</span>
              {isHistoryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} className="group-hover/history:translate-y-0.5 transition-transform" />}
            </button>
            
            <AnimatePresence>
              {isHistoryOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pb-4">
                    {channel.history.map((hist, hIdx) => (
                      <div key={hIdx} className="flex justify-between items-center text-[12px] p-3 rounded-2xl hover:bg-[#f8f9fa] dark:hover:bg-[#303134] transition-colors border border-transparent hover:border-[#dadce0] dark:hover:border-[#3c4043]">
                        <span className="font-mono font-bold text-[#202124] dark:text-[#e8eaed]">{hist.version}</span>
                        <span className="text-[#5f6368] dark:text-[#9aa0a6] font-medium">{hist.date}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="mt-auto pt-6 border-t border-[#f1f3f4] dark:border-[#3c4043]">
          <a 
            href={channel.current.link}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[13px] font-black text-[#1a73e8] hover:text-[#174ea6] dark:text-[#8ab4f8] dark:hover:text-[#aecbfa] flex items-center justify-center w-full py-3 rounded-2xl hover:bg-[#e8f0fe] dark:hover:bg-[#8ab4f8]/10 transition-all active:scale-95 uppercase tracking-widest"
          >
            Read Release Notes <ExternalLink size={16} className="ml-2" />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

const GKEVersionTrackerContent: React.FC = () => {
  const { data: channels, isLoading, error } = useGKEVersions();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#202124] rounded-[32px] p-16 shadow-sm border border-[#dadce0] dark:border-[#3c4043] flex flex-col items-center justify-center min-h-[500px]">
        <div className="relative mb-8">
          <motion.div
            className="absolute inset-0 bg-[#1a73e8] blur-3xl opacity-20 rounded-full"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="relative z-10 w-16 h-16 border-4 border-[#f1f3f4] dark:border-[#3c4043] border-t-[#1a73e8] rounded-full"
          />
        </div>
        <p className="text-[#5f6368] dark:text-[#9aa0a6] font-black uppercase tracking-[0.2em] text-xs">Syncing GKE Release Feeds...</p>
      </div>
    );
  }

  if (error || !channels) {
    return (
      <div className="bg-white dark:bg-[#202124] rounded-[32px] p-16 shadow-sm border border-[#dadce0] dark:border-[#3c4043] flex flex-col items-center justify-center min-h-[500px] text-center">
        <div className="bg-[#fce8e6] p-6 rounded-[32px] mb-8">
          <AlertTriangle size={48} className="text-[#c5221f]" />
        </div>
        <h3 className="text-2xl font-black text-[#202124] dark:text-[#e8eaed] mb-3 tracking-tight">Sync Failed</h3>
        <p className="text-[#5f6368] dark:text-[#9aa0a6] max-w-xs font-medium">Could not retrieve the latest GKE channel information from Google Cloud.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="bg-white dark:bg-[#202124] rounded-[40px] shadow-2xl border border-[#dadce0] dark:border-[#3c4043] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1a73e8] via-[#174ea6] to-[#1a73e8] p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10">
             <Server size={180} />
          </div>
          
          {/* Decorative circles */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center space-x-5 mb-6">
              <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-xl border border-white/20 shadow-lg">
                <Server className="text-white" size={36} />
              </div>
              <h2 className="text-4xl font-black tracking-tighter">GKE Release Channels</h2>
            </div>
            <p className="text-blue-50 max-w-2xl text-xl leading-relaxed font-medium opacity-90">
              Official release status tracked directly from Google Cloud feeds. 
              Monitor the latest versions across Stable, Regular, and Rapid channels.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-12 bg-[#f8f9fa] dark:bg-[#202124]/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {channels.map((channel, index) => (
              <ChannelCard key={channel.name} channel={channel} index={index} />
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex items-center space-x-2 px-6 py-3 bg-white dark:bg-[#303134] rounded-full border border-[#dadce0] dark:border-[#3c4043] shadow-sm">
              <span className="text-[11px] font-black text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-widest">Source</span>
              <div className="w-1 h-1 rounded-full bg-[#dadce0] mx-2" />
              <a href="https://cloud.google.com/kubernetes-engine/docs/release-notes" target="_blank" rel="noopener noreferrer" className="text-[12px] text-[#1a73e8] dark:text-[#8ab4f8] hover:underline font-black uppercase tracking-widest transition-all">
                Google Cloud GKE Release Notes
              </a>
              <ExternalLink size={12} className="text-[#1a73e8] dark:text-[#8ab4f8] ml-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
