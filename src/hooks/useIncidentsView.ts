import { useState, useMemo } from 'react';
import { FeedItem } from '../types';
import { toast } from 'sonner';

export const useIncidentsView = (items: FeedItem[]) => {
  const [expandedIncidentId, setExpandedIncidentId] = useState<string | null>(null);
  const now = new Date();
  const currentYear = now.getFullYear();

  const toggleExpand = (id: string) => {
    setExpandedIncidentId(prev => prev === id ? null : id);
  };

  // Filter Logic
  const activeIncidents = useMemo(() => 
    items.filter(item => item.isActive)
         .sort((a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime()), 
  [items]);
  
  // Filter history (all non-active incidents)
  const historyIncidents = useMemo(() => items
    .filter(item => !item.isActive)
    .sort((a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime()),
  [items]);

  // Helper: Duration Calculator
  const getDuration = (start: string, end?: string) => {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const diffMs = endDate.getTime() - startDate.getTime();
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;

    if (diffHrs > 0) return `${diffHrs}h ${remainingMins}m`;
    return `${diffMins}m`;
  };

  // Helper: Copy to Clipboard
  const handleCopyUpdate = (item: FeedItem) => {
    const template = `Status Update: We are tracking an active incident with ${item.serviceName || 'Google Cloud'}. Severity: ${item.severity || 'Unknown'}. Impact began at ${new Date(item.begin || '').toLocaleTimeString()}. Google Engineering is investigating.`;
    
    navigator.clipboard.writeText(template);
    toast.success("Update copied to clipboard", { description: "You can now paste the status update." });
  };

  return {
    currentYear,
    activeIncidents,
    historyIncidents,
    getDuration,
    handleCopyUpdate,
    expandedIncidentId,
    toggleExpand
  };
};
