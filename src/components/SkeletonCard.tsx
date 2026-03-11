import React from 'react';

export const SkeletonCard: React.FC<{ viewMode: 'grid' | 'list' }> = ({ viewMode }) => {
  const isList = viewMode === 'list';
  
  return (
    <div className={`bg-white dark:bg-[#202124] rounded-[24px] shadow-sm border border-[#dadce0] dark:border-[#3c4043] overflow-hidden flex ${isList ? 'flex-row h-[180px]' : 'flex-col h-full min-h-[400px]'}`}>
      {/* Image Skeleton */}
      <div className={`${isList ? 'w-full sm:w-56 min-w-0 sm:min-w-[224px]' : 'h-40 sm:h-48'} bg-[#f1f3f4] dark:bg-[#303134] animate-pulse relative overflow-hidden border-b border-[#dadce0] dark:border-[#3c4043]`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      </div>
      
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Category & Date */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <div className="h-4 w-20 bg-[#f1f3f4] dark:bg-[#303134] rounded-md animate-pulse" />
              <div className="h-4 w-24 bg-[#f1f3f4] dark:bg-[#303134] rounded-md animate-pulse" />
            </div>
            <div className="h-3 w-12 bg-[#f1f3f4] dark:bg-[#303134] rounded animate-pulse" />
          </div>
          
          {/* Title */}
          <div className="space-y-2">
            <div className="h-6 w-full bg-[#f1f3f4] dark:bg-[#303134] rounded-lg animate-pulse" />
            <div className="h-6 w-4/5 bg-[#f1f3f4] dark:bg-[#303134] rounded-lg animate-pulse" />
          </div>
          
          {/* Snippet */}
          <div className="space-y-2">
            <div className="h-3 w-full bg-[#f1f3f4] dark:bg-[#303134] rounded animate-pulse" />
            <div className="h-3 w-full bg-[#f1f3f4] dark:bg-[#303134] rounded animate-pulse" />
            <div className="h-3 w-2/3 bg-[#f1f3f4] dark:bg-[#303134] rounded animate-pulse" />
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-[#dadce0] dark:border-[#3c4043] mt-4">
          <div className="h-4 w-16 bg-[#f1f3f4] dark:bg-[#303134] rounded animate-pulse" />
          <div className="flex space-x-2">
            <div className="h-8 w-8 bg-[#f1f3f4] dark:bg-[#303134] rounded-full animate-pulse" />
            <div className="h-8 w-8 bg-[#f1f3f4] dark:bg-[#303134] rounded-full animate-pulse" />
            <div className="h-8 w-20 bg-[#f1f3f4] dark:bg-[#303134] rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
