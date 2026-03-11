import React from 'react';

export const ContentSkeleton: React.FC = () => {
  return (
    <div className="space-y-10 animate-pulse">
      {/* Section 1 */}
      <section className="bg-white dark:bg-[#202124] p-8 rounded-[24px] shadow-sm border border-[#dadce0] dark:border-[#3c4043]">
        <div className="h-4 w-32 bg-[#f1f3f4] dark:bg-[#303134] rounded mb-6" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-[#f1f3f4] dark:bg-[#303134] rounded" />
          <div className="h-4 w-full bg-[#f1f3f4] dark:bg-[#303134] rounded" />
          <div className="h-4 w-full bg-[#f1f3f4] dark:bg-[#303134] rounded" />
          <div className="h-4 w-3/4 bg-[#f1f3f4] dark:bg-[#303134] rounded" />
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Section 2 */}
        <section className="bg-[#fef7e0] dark:bg-[#f9ab00]/10 p-8 rounded-[24px] border border-[#fce8b2] dark:border-[#f9ab00]/30 shadow-sm">
          <div className="h-4 w-28 bg-[#fce8b2] dark:bg-[#f9ab00]/20 rounded mb-6" />
          <div className="space-y-3">
            <div className="h-3 w-full bg-[#fce8b2] dark:bg-[#f9ab00]/20 rounded" />
            <div className="h-3 w-full bg-[#fce8b2] dark:bg-[#f9ab00]/20 rounded" />
            <div className="h-3 w-4/5 bg-[#fce8b2] dark:bg-[#f9ab00]/20 rounded" />
          </div>
        </section>

        {/* Section 3 */}
        <section className="bg-[#e8f0fe] dark:bg-[#8ab4f8]/10 p-8 rounded-[24px] border border-[#d2e3fc] dark:border-[#8ab4f8]/30 shadow-sm">
          <div className="h-4 w-28 bg-[#d2e3fc] dark:bg-[#8ab4f8]/20 rounded mb-6" />
          <div className="space-y-3">
            <div className="h-3 w-full bg-[#d2e3fc] dark:bg-[#8ab4f8]/20 rounded" />
            <div className="h-3 w-full bg-[#d2e3fc] dark:bg-[#8ab4f8]/20 rounded" />
            <div className="h-3 w-4/5 bg-[#d2e3fc] dark:bg-[#8ab4f8]/20 rounded" />
          </div>
        </section>
      </div>

      {/* Section 4 */}
      <section className="bg-white dark:bg-[#202124] p-8 rounded-[24px] shadow-sm border border-[#dadce0] dark:border-[#3c4043]">
        <div className="h-4 w-32 bg-[#f1f3f4] dark:bg-[#303134] rounded mb-6" />
        <div className="flex flex-wrap gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-10 w-24 bg-[#f1f3f4] dark:bg-[#303134] rounded-full" />
          ))}
        </div>
      </section>
    </div>
  );
};
