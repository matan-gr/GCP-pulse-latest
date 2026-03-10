import React from 'react';
import { FeedItem } from '../types';
import { Activity, TrendingUp, ShieldCheck, Clock, CheckCircle, Minimize2 } from 'lucide-react';
import { motion } from 'motion/react';
import { ActivityChart } from './dashboard/ActivityChart';

interface StatusDashboardProps {
  items: FeedItem[];
  onViewCritical?: () => void;
  isPresentationMode?: boolean;
  onTogglePresentationMode?: () => void;
}

export const StatusDashboard: React.FC<StatusDashboardProps> = ({ 
  items, 
  onViewCritical,
  isPresentationMode = false,
  onTogglePresentationMode
}) => {
  // 1. System Health Logic (Robust)
  const serviceHealthItems = items.filter(i => i.source === 'Service Health');
  const activeIncidents = serviceHealthItems.filter(i => i.isActive);
  const hasActiveIncidents = activeIncidents.length > 0;

  // 2. Security Logic
  const securityBulletins = items.filter(i => i.source === 'Security Bulletins');
  const newSecurityCount = securityBulletins.filter(i => {
    const date = new Date(i.isoDate);
    const now = new Date();
    return (now.getTime() - date.getTime()) < (7 * 24 * 60 * 60 * 1000); // Last 7 days
  }).length;

  // 3. Velocity Logic
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weeklyItems = items.filter(i => new Date(i.isoDate) > oneWeekAgo);

  // 4. Action Items Logic
  const criticalUpdates = items
    .filter(i => i.source === 'Product Deprecations')
    .slice(0, 5);

  return (
    <div className={`container mx-auto px-4 transition-all duration-500 ${isPresentationMode ? 'py-12' : 'mb-16'}`}>
      
      {/* Dashboard Header - Only visible in Presentation Mode */}
      {isPresentationMode && (
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-black text-[#202124] dark:text-[#e8eaed] tracking-tighter">Executive Briefing</h1>
            <p className="text-[#5f6368] dark:text-[#9aa0a6] text-[15px] mt-2 font-medium">Real-time landscape analysis & system health</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-[13px] font-bold text-[#202124] dark:text-[#e8eaed] uppercase tracking-widest">{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
              <p className="text-[10px] text-[#1a73e8] dark:text-[#8ab4f8] font-black uppercase tracking-[0.2em] mt-1">Live Intelligence Feed</p>
            </div>
            <button 
              onClick={onTogglePresentationMode}
              className="p-3 bg-white dark:bg-[#303134] rounded-2xl shadow-sm hover:shadow-md hover:bg-[#f8f9fa] dark:hover:bg-[#3c4043] border border-[#dadce0] dark:border-[#3c4043] text-[#5f6368] dark:text-[#9aa0a6] transition-all active:scale-95"
              title="Exit Presentation Mode"
            >
              <Minimize2 size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className={`grid gap-8 ${isPresentationMode ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
        
        {/* 1. System Health Card */}
        <motion.div 
          layout
          className={`p-6 flex flex-col justify-between relative overflow-hidden border-t-4 rounded-[28px] shadow-sm bg-white dark:bg-[#202124] border border-[#dadce0] dark:border-[#3c4043] transition-all hover:shadow-md ${
            hasActiveIncidents ? 'border-t-[#c5221f]' : 'border-t-[#1e8e3e]'
          } ${isPresentationMode ? 'h-64' : 'h-60'}`}
        >
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-[10px] font-black text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-[0.2em] mb-2">System Health</p>
              <h3 className={`text-2xl font-black tracking-tight ${hasActiveIncidents ? 'text-[#c5221f]' : 'text-[#202124] dark:text-[#e8eaed]'}`}>
                {hasActiveIncidents ? 'Disruption' : 'Operational'}
              </h3>
            </div>
            <div className={`p-2.5 rounded-2xl ${hasActiveIncidents ? 'bg-[#fce8e6] text-[#c5221f]' : 'bg-[#e6f4ea] text-[#1e8e3e]'}`}>
              <Activity size={20} />
            </div>
          </div>

          <div className="z-10 mt-4">
            {hasActiveIncidents ? (
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-[#c5221f] uppercase tracking-wider">
                  {activeIncidents.length} Active Incident{activeIncidents.length > 1 ? 's' : ''}
                </p>
                {activeIncidents.slice(0, 2).map((inc, idx) => (
                  <a key={idx} href={inc.link} target="_blank" rel="noopener noreferrer" className="block text-[12px] text-[#c5221f] hover:underline truncate font-semibold">
                    {inc.serviceName}: {inc.title}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed font-medium">
                All services are running normally. No active incidents detected in the landscape.
              </p>
            )}
          </div>

          <div className="mt-auto pt-4 z-10">
             <div className="w-full bg-[#f1f3f4] dark:bg-[#3c4043] h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: hasActiveIncidents ? '60%' : '100%' }}
                  className={`h-full rounded-full ${hasActiveIncidents ? 'bg-[#c5221f]' : 'bg-[#1e8e3e]'}`}
                />
             </div>
          </div>
        </motion.div>

        {/* 2. Security Posture Card */}
        <motion.div 
          layout
          className={`p-6 flex flex-col justify-between relative overflow-hidden border-t-4 border-t-[#1a73e8] rounded-[28px] shadow-sm bg-white dark:bg-[#202124] border border-[#dadce0] dark:border-[#3c4043] transition-all hover:shadow-md ${isPresentationMode ? 'h-64' : 'h-60'}`}
        >
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-[10px] font-black text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-[0.2em] mb-2">Security Posture</p>
              <h3 className="text-2xl font-black text-[#202124] dark:text-[#e8eaed] tracking-tight">
                {newSecurityCount} New Alerts
              </h3>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#e8f0fe] text-[#1a73e8]">
              <ShieldCheck size={20} />
            </div>
          </div>

          <div className="z-10 mt-4 flex-1">
             <p className="text-[12px] text-[#5f6368] dark:text-[#9aa0a6] mb-3 font-medium">
               {securityBulletins.length} bulletins published in 30d.
             </p>
             <div className="space-y-2">
               {securityBulletins.slice(0, 2).map((item, idx) => (
                 <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="flex items-center text-[12px] text-[#202124] dark:text-[#e8eaed] hover:text-[#1a73e8] dark:hover:text-[#8ab4f8] transition-colors font-semibold group">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#1a73e8] mr-3 flex-shrink-0 group-hover:scale-125 transition-transform" />
                   <span className="truncate">{item.title}</span>
                 </a>
               ))}
             </div>
          </div>
        </motion.div>

        {/* 3. Velocity Card */}
        <motion.div 
          layout
          className={`p-6 flex flex-col justify-between relative overflow-hidden border-t-4 border-t-[#1e8e3e] rounded-[28px] shadow-sm bg-white dark:bg-[#202124] border border-[#dadce0] dark:border-[#3c4043] transition-all hover:shadow-md ${isPresentationMode ? 'h-64' : 'h-60'}`}
        >
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-[10px] font-black text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-[0.2em] mb-2">Innovation Velocity</p>
              <h3 className="text-2xl font-black text-[#202124] dark:text-[#e8eaed] tracking-tight">
                {weeklyItems.length} Updates
              </h3>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#e6f4ea] text-[#1e8e3e]">
              <TrendingUp size={20} />
            </div>
          </div>

          <div className="z-10 mt-2 flex-1 flex flex-col justify-end">
             <div className="h-24 w-full -ml-2">
                <ActivityChart items={items} />
              </div>
             <p className="text-[9px] text-[#5f6368] dark:text-[#9aa0a6] text-center mt-2 font-black uppercase tracking-[0.2em]">7-Day Innovation Trend</p>
          </div>
        </motion.div>

        {/* 4. Action Items Card */}
        <motion.div 
          layout
          className={`p-6 flex flex-col justify-between relative overflow-hidden border-t-4 border-t-[#f9ab00] rounded-[28px] shadow-sm bg-white dark:bg-[#202124] border border-[#dadce0] dark:border-[#3c4043] transition-all hover:shadow-md ${isPresentationMode ? 'h-64' : 'h-60'}`}
        >
          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-[10px] font-black text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-[0.2em] mb-2">Critical Actions</p>
              <h3 className="text-2xl font-black text-[#202124] dark:text-[#e8eaed] tracking-tight">
                {criticalUpdates.length} Pending
              </h3>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#fef7e0] text-[#f9ab00]">
              <Clock size={20} />
            </div>
          </div>

          <div className="z-10 mt-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
             {criticalUpdates.length > 0 ? (
               <div className="space-y-3">
                 {criticalUpdates.map((item, idx) => (
                   <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="block group">
                     <div className="flex justify-between items-center mb-1">
                       <span className="text-[9px] font-black text-[#b06000] bg-[#fef7e0] px-1.5 py-0.5 rounded uppercase tracking-widest">EOL</span>
                       <span className="text-[10px] text-[#5f6368] dark:text-[#9aa0a6] font-bold">{new Date(item.isoDate).toLocaleDateString()}</span>
                     </div>
                     <p className="text-[12px] font-semibold text-[#202124] dark:text-[#e8eaed] group-hover:text-[#1a73e8] dark:group-hover:text-[#8ab4f8] line-clamp-1 transition-colors">
                       {item.title}
                     </p>
                   </a>
                 ))}
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center h-full text-[#5f6368] dark:text-[#9aa0a6]">
                 <CheckCircle size={20} className="mb-2 opacity-20" />
                 <p className="text-[10px] font-black uppercase tracking-[0.2em]">Landscape Clear</p>
               </div>
             )}
          </div>
        </motion.div>

      </div>
    </div>
  );
};
