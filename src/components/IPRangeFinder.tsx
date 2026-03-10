import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Copy, Check, Globe, Server, Shield, Database, Cloud, Download } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { ErrorBoundary } from './ErrorBoundary';
import { getCategoryStyles, cn } from '../utils';

interface Prefix {
  ipv4Prefix?: string;
  ipv6Prefix?: string;
  service: string;
  scope: string;
}

interface CloudIPRanges {
  syncToken: string;
  creationTime: string;
  prefixes: Prefix[];
}

const fetchIPRanges = async (): Promise<CloudIPRanges> => {
  const response = await fetch('/api/ip-ranges');
  if (!response.ok) {
    throw new Error('Failed to fetch IP ranges');
  }
  return response.json();
};

export const IPRangeFinder: React.FC = () => {
  return (
    <ErrorBoundary componentName="IPRangeFinder">
      <IPRangeFinderContent />
    </ErrorBoundary>
  );
};

const IPRangeFinderContent: React.FC = () => {
  const [region, setRegion] = useState('');
  const { data, isLoading, error } = useQuery({
    queryKey: ['gcp-ip-ranges'],
    queryFn: fetchIPRanges,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  const filteredPrefixes = useMemo(() => {
    if (!data || !region) return [];
    const lowerRegion = region.trim().toLowerCase();
    return data.prefixes.filter(p => 
      p.scope.toLowerCase().includes(lowerRegion) ||
      p.service.toLowerCase().includes(lowerRegion) ||
      p.ipv4Prefix?.includes(lowerRegion) ||
      p.ipv6Prefix?.includes(lowerRegion)
    ).slice(0, 500); // Limit to 500 for performance
  }, [data, region]);

  const stats = useMemo(() => {
    if (!filteredPrefixes.length) return null;
    return {
      ipv4: filteredPrefixes.filter(p => p.ipv4Prefix).length,
      ipv6: filteredPrefixes.filter(p => p.ipv6Prefix).length,
      services: Array.from(new Set(filteredPrefixes.map(p => p.service))).length
    };
  }, [filteredPrefixes]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard', { description: "You can now paste the IP range." });
  };

  const handleExportCSV = () => {
    if (filteredPrefixes.length === 0) return;
    
    const headers = ["IP Prefix", "Scope", "Service", "Type"];
    const csvContent = [
      headers.join(","),
      ...filteredPrefixes.map(p => {
        const ip = p.ipv4Prefix || p.ipv6Prefix || '';
        const type = p.ipv4Prefix ? 'IPv4' : 'IPv6';
        return [ip, p.scope, p.service, type].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `gcp_ip_ranges_${region.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredPrefixes.length} ranges to CSV`, { description: "Your download should begin shortly." });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-0">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-8 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <Globe className="text-blue-200" size={32} />
            <h2 className="text-2xl font-bold">Google Cloud IP Range Finder</h2>
          </div>
          <p className="text-blue-100 mb-8 max-w-2xl">
            Search and filter official Google Cloud IP ranges by region, service, or IP address. 
            Data is fetched directly from Google's official <code>cloud.json</code>.
          </p>
          
          <div className="relative max-w-2xl group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            </div>
            <input
              type="text"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="Search region (e.g., us-central1), service (e.g., cloud-sql), or IP..."
              className="w-full pl-11 pr-4 py-4 bg-white text-gray-900 rounded-xl shadow-lg focus:ring-4 focus:ring-blue-500/30 focus:outline-none font-medium placeholder-gray-400 text-base transition-all"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-8 min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p>Fetching latest IP ranges...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-red-500">
              <Shield size={48} className="mb-4 opacity-50" />
              <p>Failed to load IP range data.</p>
            </div>
          ) : !region ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500 text-center">
              <Cloud size={64} className="mb-4 opacity-20" />
              <p className="text-lg font-medium text-gray-500 dark:text-gray-400">Enter a search term to start</p>
              <p className="text-sm mt-2">Try "us-east1", "asia-northeast1", or "global"</p>
            </div>
          ) : filteredPrefixes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500">
              <Search size={48} className="mb-4 opacity-20" />
              <p>No IP ranges found for "{region}"</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-800/50 rounded-lg text-blue-600 dark:text-blue-300">
                    <Server size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">IPv4 Ranges</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.ipv4}</p>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-800/50 rounded-lg text-blue-600 dark:text-blue-300">
                    <Database size={24} />
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">IPv6 Ranges</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.ipv6}</p>
                  </div>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg text-emerald-600 dark:text-emerald-300">
                      <Check size={24} />
                    </div>
                    <div>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Total Found</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredPrefixes.length}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 bg-white dark:bg-emerald-800 text-emerald-700 dark:text-emerald-100 text-sm font-bold rounded-lg shadow-sm border border-emerald-200 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-700 transition-colors flex items-center"
                  >
                    <Download size={16} className="mr-2" /> Export CSV
                  </button>
                </div>
              </div>

              {/* Results Table */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        <th className="px-6 py-4">IP Prefix</th>
                        <th className="px-6 py-4">Scope</th>
                        <th className="px-6 py-4">Service</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredPrefixes.map((prefix, idx) => {
                        const ip = prefix.ipv4Prefix || prefix.ipv6Prefix || '';
                        return (
                          <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-200">{ip}</span>
                                {prefix.ipv6Prefix && (
                                  <span className={cn(
                                    "ml-2 text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-widest border",
                                    getCategoryStyles('compute')
                                  )}>IPv6</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              {prefix.scope}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                              <span className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                getCategoryStyles(prefix.service)
                              )}>
                                {prefix.service}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleCopy(ip)}
                                className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                title="Copy IP"
                              >
                                <Copy size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {filteredPrefixes.length > 0 && (
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400">
                    Showing top {Math.min(filteredPrefixes.length, 500)} results. Data last updated: {new Date(data?.creationTime || '').toLocaleString()}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
