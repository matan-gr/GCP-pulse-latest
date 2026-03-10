import React, { useState, useMemo, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useGKEVersions } from '../../hooks/useGKEVersions';

export const GKESkewValidator: React.FC = () => {
  const { data: channels, isLoading, isError } = useGKEVersions();
  const [controlPlaneVersion, setControlPlaneVersion] = useState<string>('');
  const [nodeVersion, setNodeVersion] = useState<string>('');

  // Extract available minor versions from the fetched data
  const availableVersions = useMemo(() => {
    if (!channels) return [];
    
    const versionSet = new Set<string>();
    
    channels.forEach(channel => {
      // Add current version
      if (channel.current.version !== 'Unknown' && channel.current.version !== 'Error') {
        const match = channel.current.version.match(/(\d+\.\d+)/);
        if (match) versionSet.add(match[1]);
      }
      // Add history versions
      channel.history.forEach(hist => {
        if (hist.version !== 'Unknown') {
          const match = hist.version.match(/(\d+\.\d+)/);
          if (match) versionSet.add(match[1]);
        }
      });
    });

    // If no data, fallback to a sensible default range
    if (versionSet.size === 0) {
       return ['1.30', '1.29', '1.28', '1.27', '1.26', '1.25', '1.24'];
    }
    
    // Sort descending
    return Array.from(versionSet).sort((a, b) => parseFloat(b) - parseFloat(a));
  }, [channels]);

  // Set defaults once data is loaded
  useEffect(() => {
    if (availableVersions.length > 0 && !controlPlaneVersion) {
      setControlPlaneVersion(availableVersions[0]);
      setNodeVersion(availableVersions[1] || availableVersions[0]);
    }
  }, [availableVersions, controlPlaneVersion]);

  const result = useMemo(() => {
    if (!controlPlaneVersion || !nodeVersion) return null;

    const cpMinor = parseFloat(controlPlaneVersion);
    const nodeMinor = parseFloat(nodeVersion);
    const diff = Math.round((cpMinor - nodeMinor) * 100) / 100; // Handle float precision
    
    // Convert to integer difference for logic (e.g. 1.30 - 1.27 = 0.03 -> 3 minor versions)
    // Actually, simple subtraction of minor parts is safer:
    const cpMinorInt = parseInt(controlPlaneVersion.split('.')[1], 10);
    const nodeMinorInt = parseInt(nodeVersion.split('.')[1], 10);
    const minorDiff = cpMinorInt - nodeMinorInt;

    if (minorDiff < 0) {
      return {
        status: 'invalid',
        title: 'Invalid Configuration',
        message: 'Node version cannot be newer than the Control Plane version.',
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800'
      };
    }

    if (minorDiff <= 3) {
      return {
        status: 'valid',
        title: 'Supported Configuration',
        message: 'This configuration complies with the GKE Version Skew Policy.',
        icon: CheckCircle,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        borderColor: 'border-emerald-200 dark:border-emerald-800'
      };
    }

    return {
      status: 'unsupported',
      title: 'Unsupported Configuration',
      message: 'Nodes are too old. They must be within 3 minor versions of the Control Plane.',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800'
    };
  }, [controlPlaneVersion, nodeVersion]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <Loader2 className="animate-spin mb-4 text-blue-600" size={32} />
        <p>Loading latest GKE versions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card p-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">GKE Version Skew Validator</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Validate upgrade paths against the official <a href="https://cloud.google.com/kubernetes-engine/docs/concepts/release-channels#version_skew_policy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">GKE Version Skew Policy</a>.
              </p>
            </div>
          </div>
          {availableVersions.length > 0 && (
             <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
               <RefreshCw size={12} className="mr-1.5" />
               Synced with official feeds
             </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Control Plane Selection */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Control Plane Version
            </label>
            <div className="relative">
              <select
                value={controlPlaneVersion}
                onChange={(e) => setControlPlaneVersion(e.target.value)}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer transition-all hover:border-blue-400"
              >
                {availableVersions.map(v => (
                  <option key={`cp-${v}`} value={v}>{v}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ArrowRight className="rotate-90" size={20} />
              </div>
            </div>
          </div>

          {/* Node Version Selection */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Node Version
            </label>
            <div className="relative">
              <select
                value={nodeVersion}
                onChange={(e) => setNodeVersion(e.target.value)}
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer transition-all hover:border-blue-400"
              >
                {availableVersions.map(v => (
                  <option key={`node-${v}`} value={v}>{v}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ArrowRight className="rotate-90" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Result Card */}
        {result && (
          <motion.div
            key={`${controlPlaneVersion}-${nodeVersion}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-xl border-2 ${result.bgColor} ${result.borderColor} flex items-start space-x-4`}
          >
            <result.icon size={32} className={`${result.color} flex-shrink-0 mt-0.5`} />
            <div>
              <h3 className={`text-lg font-bold ${result.color} mb-1`}>{result.title}</h3>
              <p className="text-slate-700 dark:text-slate-300 font-medium">{result.message}</p>
              
              <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center text-sm text-slate-500 dark:text-slate-400">
                <Info size={16} className="mr-2" />
                <span>
                  Difference: <span className="font-mono font-bold text-slate-900 dark:text-white">{parseInt(controlPlaneVersion.split('.')[1]) - parseInt(nodeVersion.split('.')[1])}</span> minor versions
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-sm text-slate-500 dark:text-slate-400">
          <p className="font-bold mb-2">Policy Summary:</p>
          <ul className="list-disc list-inside space-y-1">
             <li>Nodes can be up to <strong>3 minor versions older</strong> than the Control Plane.</li>
             <li>Nodes <strong>cannot be newer</strong> than the Control Plane.</li>
             <li>It is recommended to keep nodes within 1 minor version for best performance and feature compatibility.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
