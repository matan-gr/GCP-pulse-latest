import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, actionLabel, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-full min-h-[400px]">
      <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl mb-6 border border-slate-200 dark:border-slate-800">
        <Icon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-8 leading-relaxed">
        {description}
      </p>
      {onAction && actionLabel && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-blue-600 text-white text-[10px] font-bold rounded-xl hover:bg-blue-700 transition-all shadow-sm uppercase tracking-widest active:scale-95"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
