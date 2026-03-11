import React from 'react';

export const SkeletonCard: React.FC<{ viewMode: 'grid' | 'list' }> = ({ viewMode }) => {
  const isList = viewMode === 'list';
  
  return (
    <div className={`bg-white dark:bg-[#202124] rounded-[24px] shadow-sm border border-[#dadce0] dark:border-[#3c4043] overflow-hidden flex ${isList ? 'flex-row h-[200px]' : 'flex-col h-[480px]'}`}>
      <div className={`${isList ? 'w-1/3' : 'h-56'} bg-[#f1f3f4] dark:bg-[#303134] animate-pulse relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      </div>
      <div className="p-8 flex-1 flex flex-col space-y-5">
        <div className="flex space-x-3">
          <div className="h-5 w-24 bg-[#f1f3f4] dark:bg-[#303134] rounded-full animate-pulse" />
          <div className="h-5 w-28 bg-[#f1f3f4] dark:bg-[#303134] rounded-full animate-pulse" />
        </div>
        <div className="h-8 w-5/6 bg-[#f1f3f4] dark:bg-[#303134] rounded-xl animate-pulse" />
        <div className="space-y-3 flex-1">
          <div className="h-4 w-full bg-[#f1f3f4] dark:bg-[#303134] rounded-lg animate-pulse" />
          <div className="h-4 w-full bg-[#f1f3f4] dark:bg-[#303134] rounded-lg animate-pulse" />
          <div className="h-4 w-3/4 bg-[#f1f3f4] dark:bg-[#303134] rounded-lg animate-pulse" />
        </div>
        <div className="flex justify-between items-center pt-6 border-t border-[#dadce0] dark:border-[#3c4043]">
          <div className="h-10 w-32 bg-[#f1f3f4] dark:bg-[#303134] rounded-full animate-pulse" />
          <div className="flex space-x-2">
            <div className="h-10 w-10 bg-[#f1f3f4] dark:bg-[#303134] rounded-full animate-pulse" />
            <div className="h-10 w-10 bg-[#f1f3f4] dark:bg-[#303134] rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
