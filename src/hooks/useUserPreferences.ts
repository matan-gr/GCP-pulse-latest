import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface UserPreferences {
  viewMode: 'grid' | 'list';
  subscribedCategories: string[];
  savedPosts: string[]; // Array of link IDs
  filterCategories: string[];
  filterType: 'include' | 'exclude';
  filterDateRange: { start: string; end: string } | null;
  sortBy: 'date' | 'category';
  sortDirection: 'asc' | 'desc';
  columnOrder: string[];
  hiddenColumns: string[];
}

const DEFAULT_PREFS: UserPreferences = {
  viewMode: 'grid',
  subscribedCategories: [],
  savedPosts: [],
  filterCategories: [],
  filterType: 'include',
  filterDateRange: null,
  sortBy: 'date',
  sortDirection: 'desc',
  columnOrder: ['Product Updates', 'Release Notes', 'Google AI Research', 'Gemini Enterprise'],
  hiddenColumns: []
};

export function useUserPreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('user_prefs');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure new columns are added to the end if missing
      const currentDefaults = ['Product Updates', 'Release Notes', 'Google AI Research', 'Gemini Enterprise'];
      const savedOrder = parsed.columnOrder || [];
      const missingColumns = currentDefaults.filter(col => !savedOrder.includes(col));
      
      // Migration: Handle old filterCategory (string) -> filterCategories (string[])
      let categories = parsed.filterCategories || [];
      if (parsed.filterCategory && typeof parsed.filterCategory === 'string') {
        categories = [parsed.filterCategory];
      }

      return { 
        ...DEFAULT_PREFS, 
        ...parsed,
        filterCategories: categories,
        columnOrder: [...savedOrder, ...missingColumns]
      };
    }
    
    return DEFAULT_PREFS;
  });

  useEffect(() => {
    localStorage.setItem('user_prefs', JSON.stringify(prefs));
  }, [prefs]);

  const updatePrefs = (newPrefs: Partial<UserPreferences>) => {
    setPrefs(prev => ({ ...prev, ...newPrefs }));
  };

  const toggleCategorySubscription = (category: string) => {
    setPrefs(prev => {
      const exists = prev.subscribedCategories.includes(category);
      if (exists) {
        toast.success(`Unsubscribed from ${category}`, { description: "You will no longer receive updates for this category." });
        return {
          ...prev,
          subscribedCategories: prev.subscribedCategories.filter(c => c !== category)
        };
      } else {
        toast.success(`Subscribed to ${category}`, { description: "You will now receive updates for this category." });
        return {
          ...prev,
          subscribedCategories: [...prev.subscribedCategories, category]
        };
      }
    });
  };

  const toggleSavedPost = (link: string) => {
    setPrefs(prev => {
      const exists = prev.savedPosts.includes(link);
      if (exists) {
        toast.success("Removed from Read Later", { description: "Item removed from your reading list." });
        return {
          ...prev,
          savedPosts: prev.savedPosts.filter(l => l !== link)
        };
      } else {
        toast.success("Added to Read Later", { description: "Item saved to your reading list." });
        return {
          ...prev,
          savedPosts: [...prev.savedPosts, link]
        };
      }
    });
  };

  const clearSavedPosts = () => {
    setPrefs(prev => ({ ...prev, savedPosts: [] }));
    toast.success("Reading list cleared", { description: "All saved items have been removed." });
  };

  const resetPrefs = () => {
    localStorage.removeItem('user_prefs');
    setPrefs(DEFAULT_PREFS);
    toast.success("Preferences reset to default", { description: "Your settings have been restored to their original state." });
  };

  return {
    prefs,
    updatePrefs,
    toggleCategorySubscription,
    toggleSavedPost,
    clearSavedPosts,
    resetPrefs
  };
}
