import React from 'react';

export const SecuritySkeletonCard: React.FC = () => {
  return (
    <div className="group relative rounded-2xl border shadow-sm overflow-hidden bg-white dark:bg-[#202124] border-[#dadce0] dark:border-[#3c4043] border-l-[6px] border-l-[#f1f3f4] dark:border-l-[#3c4043]">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Severity Badge Skeleton */}
              <div className="h-5 w-24 bg-[#f1f3f4] dark:bg-[#303134] rounded animate-pulse" />
              {/* Date Skeleton */}
              <div className="h-4 w-28 bg-[#f1f3f4] dark:bg-[#303134] rounded animate-pulse" />
            </div>
            {/* Title Skeleton */}
            <div className="space-y-2">
              <div className="h-6 w-full bg-[#f1f3f4] dark:bg-[#303134] rounded-lg animate-pulse" />
              <div className="h-6 w-3/4 bg-[#f1f3f4] dark:bg-[#303134] rounded-lg animate-pulse" />
            </div>
          </div>
          
          {/* Action Buttons Skeleton */}
          <div className="flex items-center gap-2 flex-shrink-0 self-start">
            <div className="h-8 w-24 bg-[#f1f3f4] dark:bg-[#303134] rounded-lg animate-pulse" />
            <div className="h-8 w-8 bg-[#f1f3f4] dark:bg-[#303134] rounded-full animate-pulse" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-3 w-full bg-[#f1f3f4] dark:bg-[#303134] rounded animate-pulse" />
          <div className="h-3 w-full bg-[#f1f3f4] dark:bg-[#303134] rounded animate-pulse" />
          <div className="h-3 w-2/3 bg-[#f1f3f4] dark:bg-[#303134] rounded animate-pulse" />
        </div>
        
        <div className="h-3 w-16 bg-[#f1f3f4] dark:bg-[#303134] rounded animate-pulse mb-4" />

        {/* Affected Products Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-4 border-t border-[#dadce0] dark:border-[#3c4043] mt-4">
          <div className="h-3 w-16 bg-[#f1f3f4] dark:bg-[#303134] rounded animate-pulse" />
          <div className="flex flex-wrap gap-1.5">
            <div className="h-4 w-16 bg-[#f1f3f4] dark:bg-[#303134] rounded-md animate-pulse" />
            <div className="h-4 w-20 bg-[#f1f3f4] dark:bg-[#303134] rounded-md animate-pulse" />
            <div className="h-4 w-12 bg-[#f1f3f4] dark:bg-[#303134] rounded-md animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
