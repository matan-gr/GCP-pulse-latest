import { useState, useMemo } from 'react';
import { FeedItem } from '../types';
import { extractGCPProducts } from '../utils';

export const useSecurityView = (items: FeedItem[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'All' | 'Critical' | 'High' | 'Medium' | 'Low'>('All');

  // 1. Process Data & Stats
  const processedData = useMemo(() => {
    const stats = {
      total: items.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    const enrichedItems = items.map(item => {
      // Extract Severity from Categories (added by useSecurityBulletins hook)
      let severity = 'Unknown';
      if (item.categories?.includes('Critical')) severity = 'Critical';
      else if (item.categories?.includes('High')) severity = 'High';
      else if (item.categories?.includes('Medium')) severity = 'Medium';
      else if (item.categories?.includes('Low')) severity = 'Low';

      // Update Stats
      if (severity === 'Critical') stats.critical++;
      if (severity === 'High') stats.high++;
      if (severity === 'Medium') stats.medium++;
      if (severity === 'Low') stats.low++;

      // Extract Products
      const products = extractGCPProducts(item.title + " " + item.contentSnippet);

      return { ...item, severity, products };
    });

    return { stats, items: enrichedItems };
  }, [items]);

  // 2. Filter Logic
  const filteredItems = useMemo(() => {
    return processedData.items.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.contentSnippet?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.products.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSeverity = severityFilter === 'All' || item.severity === severityFilter;

      return matchesSearch && matchesSeverity;
    });
  }, [processedData.items, searchTerm, severityFilter]);

  return {
    searchTerm,
    setSearchTerm,
    severityFilter,
    setSeverityFilter,
    processedData,
    filteredItems
  };
};
