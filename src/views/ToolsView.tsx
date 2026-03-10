import React, { useState, Suspense } from 'react';
import { Globe, Server, Loader2, Wrench, GitMerge, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Lazy load tool components
const IPRangeFinder = React.lazy(() => import('../components/IPRangeFinder').then(module => ({ default: module.IPRangeFinder })));
const GKEVersionTracker = React.lazy(() => import('../components/GKEVersionTracker').then(module => ({ default: module.GKEVersionTracker })));
const GKESkewValidator = React.lazy(() => import('../components/tools/GKESkewValidator').then(module => ({ default: module.GKESkewValidator })));

type ToolId = 'ip-ranges' | 'gke-tracker' | 'gke-skew';

interface ToolDef {
  id: ToolId;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const TOOLS: ToolDef[] = [
  {
    id: 'ip-ranges',
    title: 'IP Range Finder',
    description: 'Search and filter official Google Cloud IP ranges by region, service, or IP address.',
    icon: Globe,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    id: 'gke-tracker',
    title: 'GKE Lifecycle',
    description: 'Track official GKE release versions across Stable, Regular, and Rapid channels.',
    icon: Server,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    id: 'gke-skew',
    title: 'GKE Skew Validator',
    description: 'Validate control plane and node version compatibility against the official skew policy.',
    icon: GitMerge,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
  }
];

export const ToolsView: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolId>('ip-ranges');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* Header Section */}
      <div className="mb-12 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/20"
        >
          <Wrench className="text-white" size={32} />
        </motion.div>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight"
        >
          Engineering Utilities
        </motion.h1>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
        >
          Essential tools for Google Cloud engineers, SREs, and developers to streamline daily operations and validate configurations.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-3 sticky top-24 self-start">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`w-full text-left p-4 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                activeTool === tool.id
                  ? 'bg-white dark:bg-slate-800 shadow-md ring-1 ring-slate-200 dark:ring-slate-700'
                  : 'hover:bg-white/50 dark:hover:bg-slate-800/50 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start space-x-4 relative z-10">
                <div className={`p-2.5 rounded-lg ${tool.bgColor} ${tool.color} transition-transform group-hover:scale-110 duration-300`}>
                  <tool.icon size={20} />
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-sm ${activeTool === tool.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
                {activeTool === tool.id && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500">
                    <ChevronRight size={16} />
                  </div>
                )}
              </div>
              {activeTool === tool.id && (
                <motion.div
                  layoutId="activeToolBorder"
                  className="absolute inset-0 border-2 border-blue-500/20 rounded-xl pointer-events-none"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="min-h-[600px]"
            >
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                  <Loader2 className="animate-spin mb-4 text-blue-600" size={48} />
                  <p className="text-lg font-medium">Loading tool resources...</p>
                </div>
              }>
                {activeTool === 'ip-ranges' && <IPRangeFinder />}
                {activeTool === 'gke-tracker' && <GKEVersionTracker />}
                {activeTool === 'gke-skew' && <GKESkewValidator />}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
