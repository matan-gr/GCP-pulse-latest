import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { FeedItem } from '../types';

export const useStandardFeedView = (items: FeedItem[]) => {
  const [visibleCount, setVisibleCount] = useState(12);
  const { ref, inView } = useInView({ threshold: 0, rootMargin: '200px' });
  
  const hasMore = items.length > visibleCount;

  useEffect(() => {
    if (inView && hasMore) {
      setVisibleCount(prev => prev + 12);
    }
  }, [inView, hasMore]);

  // Reset visible count when items change (e.g. filtering)
  useEffect(() => {
    setVisibleCount(12);
  }, [items]);

  const visibleItems = items.slice(0, visibleCount);

  return {
    visibleItems,
    loadMoreRef: ref,
    hasMore
  };
};
