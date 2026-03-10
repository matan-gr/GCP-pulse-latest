import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ activeTab, setActiveTab }) => {
  const titles: Record<string, string> = {
    'dashboard': 'Dashboard',
    'all': 'Discover Feed',
    'updates': 'Updates & Innovation',
    'cloud-blog': 'Cloud Blog',
    'release-notes': 'Release Notes',
    'deprecations': 'Product Deprecations',
    'youtube': 'GCP YouTube Channel',
    'incidents': 'Cloud Incidents',
    'security': 'Security Bulletins',
    'architecture': 'Architecture',
    'saved': 'Read Later',
    'tools': 'Tools',
    'weekly-brief': 'Weekly Brief'
  };

  const currentTitle = titles[activeTab] || activeTab;

  return (
    <nav className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400">
      <button 
        onClick={() => setActiveTab('all')}
        className="flex items-center hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <Home size={14} className="mr-1" />
        <span>GCP Pulse</span>
      </button>
      
      <ChevronRight size={14} className="text-slate-300 dark:text-slate-700" />
      
      <span className="text-slate-900 dark:text-white font-semibold">
        {currentTitle}
      </span>
    </nav>
  );
};
