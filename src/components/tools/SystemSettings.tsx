import React from 'react';
import { RefreshCw, Database, Trash2 } from 'lucide-react';
import { queryClient } from '../../lib/queryClient';
import { toast } from 'sonner';

export const SystemSettings: React.FC = () => {
  const handleRefreshData = async () => {
    try {
      // Clear all react-query cache
      queryClient.clear();
      
      // Clear localStorage caches if any
      localStorage.removeItem('weekly_brief_cache');
      
      // Invalidate all queries to trigger a refetch
      await queryClient.invalidateQueries();
      
      toast.success("Cache cleared successfully", {
        description: "Fetching the absolute latest data from all feeds."
      });
    } catch (error) {
      console.error("Failed to clear cache:", error);
      toast.error("Failed to clear cache", {
        description: "An error occurred while refreshing data."
      });
    }
  };

  return (
    <div className="bg-white dark:bg-[#202124] rounded-2xl shadow-sm border border-[#dadce0] dark:border-[#3c4043] overflow-hidden">
      <div className="p-6 border-b border-[#dadce0] dark:border-[#3c4043]">
        <h2 className="text-xl font-bold text-[#202124] dark:text-[#e8eaed] flex items-center">
          <Database className="mr-3 text-[#1a73e8] dark:text-[#8ab4f8]" size={24} />
          System Settings
        </h2>
        <p className="text-[#5f6368] dark:text-[#9aa0a6] mt-2">
          Manage application cache and system preferences.
        </p>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#f8f9fa] dark:bg-[#303134] rounded-xl border border-[#dadce0] dark:border-[#3c4043]">
          <div>
            <h3 className="text-base font-semibold text-[#202124] dark:text-[#e8eaed] flex items-center">
              <RefreshCw className="mr-2 text-[#5f6368] dark:text-[#9aa0a6]" size={18} />
              Force Data Refresh
            </h3>
            <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6] mt-1 max-w-md">
              Manually clear the cache for all feeds. This allows you to fetch the absolute latest data immediately, bypassing the standard 5-minute cache window.
            </p>
          </div>
          <button
            onClick={handleRefreshData}
            className="mt-4 sm:mt-0 px-6 py-2.5 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center justify-center whitespace-nowrap"
          >
            <Trash2 size={16} className="mr-2" />
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};
