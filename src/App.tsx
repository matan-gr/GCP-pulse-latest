
import { useState, useEffect, useMemo, Suspense, lazy, useRef, useCallback } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { useFeed, useProductDeprecations, useSecurityBulletins, useArchitectureUpdates, useIncidents, useYouTubeFeed } from './hooks/useFeed';
import { Toaster } from './components/ui/Toaster';
import { FeedItem } from './types';
import { useDebounce } from './hooks/useDebounce';
import { useUserPreferences } from './hooks/useUserPreferences';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { useSummarizer } from './hooks/useSummarizer';
import { ErrorDisplay } from './components/ErrorDisplay';
import { SummaryModal } from './components/SummaryModal';
import { PageLoader } from './components/ui/PageLoader';
import { getAiInstance } from './services/geminiService';

// Layout & Navigation
import { AppLayout } from './components/layout/AppLayout';

// Lazy Loaded Views
const DiscoverView = lazy(() => import('./views/DiscoverView').then(module => ({ default: module.DiscoverView })));
const ProductDeprecationsView = lazy(() => import('./views/ProductDeprecationsView').then(module => ({ default: module.ProductDeprecationsView })));
const ArchitectureView = lazy(() => import('./views/ArchitectureView').then(module => ({ default: module.ArchitectureView })));
const StandardFeedView = lazy(() => import('./views/StandardFeedView').then(module => ({ default: module.StandardFeedView })));
const SavedView = lazy(() => import('./views/SavedView').then(module => ({ default: module.SavedView })));
const IncidentsView = lazy(() => import('./views/IncidentsView').then(module => ({ default: module.IncidentsView })));
const SecurityView = lazy(() => import('./views/SecurityView').then(module => ({ default: module.SecurityView })));
const WeeklyBriefView = lazy(() => import('./views/WeeklyBriefView').then(module => ({ default: module.WeeklyBriefView })));
const ToolsView = lazy(() => import('./views/ToolsView').then(module => ({ default: module.ToolsView })));
const YouTubeView = lazy(() => import('./views/YouTubeView').then(module => ({ default: module.YouTubeView })));

function AppContent() {
  // UI State
  const [activeTab, setActiveTab] = useState<'all' | 'saved' | 'incidents' | 'deprecations' | 'security' | 'architecture' | 'tools' | 'weekly-brief' | 'youtube' | 'cloud-blog' | 'release-notes' | 'updates'>('all');
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data Fetching with React Query
  const { data: feed, isLoading: feedLoading, error: queryError, refetch: refetchFeed, isRefetching: feedRefetching } = useFeed();
  const { data: deprecations, isLoading: deprecationsLoading, error: deprecationsError } = useProductDeprecations();
  const { data: securityBulletins, isLoading: securityLoading, error: securityError } = useSecurityBulletins();
  const { data: architectureUpdates, isLoading: architectureLoading, error: architectureError } = useArchitectureUpdates();
  const { data: incidents, isLoading: incidentsLoading, error: incidentsError } = useIncidents();
  const { data: youtubeFeed, isLoading: youtubeLoading, error: youtubeError } = useYouTubeFeed();
  
  const loading = feedLoading || (activeTab === 'architecture' && architectureLoading) || (activeTab === 'incidents' && incidentsLoading) || (activeTab === 'deprecations' && deprecationsLoading) || (activeTab === 'youtube' && youtubeLoading); // Main loading state

  // Custom Hooks
  const { prefs, updatePrefs, toggleCategorySubscription, toggleSavedPost, clearSavedPosts } = useUserPreferences();
  const { summarizingId, analyses, summaryModal, handleSummarize, closeSummaryModal } = useSummarizer();

  const handleSetActiveTab = (tab: any) => {
    console.log("setActiveTab called with:", tab);
    setActiveTab(tab);
  };

  // Feed Update Toast
  const prevRefetching = useRef(false);
  useEffect(() => {
    if (prevRefetching.current && !feedRefetching && !queryError) {
      toast.success("Feed updated", {
        description: "Latest intelligence and updates have been loaded.",
      });
    }
    prevRefetching.current = feedRefetching;
  }, [feedRefetching, queryError]);

  // Error Handling
  useEffect(() => {
    if (queryError) toast.error("Failed to load feed updates", { description: "Please check your connection and try again." });
    if (deprecationsError) toast.error("Failed to load product deprecations", { description: "Please check your connection and try again." });
    if (architectureError) toast.error("Failed to load architecture updates", { description: "Please check your connection and try again." });
    if (incidentsError) toast.error("Failed to load incidents", { description: "Please check your connection and try again." });
    if (deprecations && !deprecationsLoading && activeTab === 'deprecations') {
      toast.success("Product deprecations updated", { duration: 3000 });
    }
  }, [queryError, deprecationsError, architectureError, incidentsError, deprecations, deprecationsLoading, activeTab]);

  // Search & Filter State
  const [searchMap, setSearchMap] = useState<Record<string, string>>({});
  const search = searchMap[activeTab] || '';
  const setSearch = (val: string) => setSearchMap(prev => ({ ...prev, [activeTab]: val }));
  const [isSmartFilter, setIsSmartFilter] = useState(false);
  const [smartIndices, setSmartIndices] = useState<number[] | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Use prefs for persistence
  const selectedCategories = prefs.filterCategories;
  const filterType = prefs.filterType;
  const dateRange = prefs.filterDateRange;
  const sortBy = prefs.sortBy;
  const sortDirection = prefs.sortDirection;
  
  const handleCategoryChange = useCallback((category: string) => {
    const current = prefs.filterCategories;
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    updatePrefs({ filterCategories: updated });
  }, [prefs.filterCategories, updatePrefs]);

  const handleFilterTypeChange = useCallback((type: 'include' | 'exclude') => {
    updatePrefs({ filterType: type });
  }, [updatePrefs]);

  const handleDateRangeChange = useCallback((range: { start: string; end: string } | null) => {
    updatePrefs({ filterDateRange: range });
    if (range) toast.success("Date filter applied", { description: `Showing items from ${range.start} to ${range.end}.` });
    else toast.info("Date filter cleared", { description: "Showing items from all dates." });
  }, [updatePrefs]);

  const handleSortChange = useCallback((sortBy: 'date' | 'category', sortDirection: 'asc' | 'desc') => {
    updatePrefs({ sortBy, sortDirection });
  }, [updatePrefs]);

  const clearAllFilters = useCallback(() => {
    setSearchMap(prev => ({ ...prev, [activeTab]: '' }));
    setIsSmartFilter(false);
    updatePrefs({ 
      filterCategories: [], 
      filterDateRange: null 
    });
    toast.info("All filters cleared", { description: "Showing all available items." });
  }, [updatePrefs, activeTab]);

  const isAnyFilterActive = useMemo(() => {
    return search.length > 0 || selectedCategories.length > 0 || dateRange !== null || isSmartFilter;
  }, [search, selectedCategories, dateRange, isSmartFilter]);

  const debouncedSearch = useDebounce(search, 800);

  // Merge items for filtering and display
  const allItems = useMemo(() => {
    const itemMap = new Map<string, FeedItem>();

    // 1. Add raw feed items first
    (feed?.items || []).forEach(item => itemMap.set(item.id, item));

    // 2. Overlay specialized items (they have enhanced metadata/categories)
    (deprecations || []).forEach(item => itemMap.set(item.id, item));
    (securityBulletins || []).forEach(item => itemMap.set(item.id, item));
    (architectureUpdates || []).forEach(item => itemMap.set(item.id, item));
    (youtubeFeed || []).forEach(item => itemMap.set(item.id, item));

    // 3. Add incidents (distinct source)
    (incidents || []).forEach(item => itemMap.set(item.id, item));

    return Array.from(itemMap.values()).sort((a, b) => {
      // Prioritize active incidents
      const aActive = !!a.isActive;
      const bActive = !!b.isActive;
      
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;

      return new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime();
    });
  }, [feed, deprecations, securityBulletins, architectureUpdates, incidents, youtubeFeed]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    allItems.forEach(item => item.categories?.forEach(c => cats.add(c)));
    return Array.from(cats).sort();
  }, [allItems]);

  // Smart Filter Logic
  useEffect(() => {
    if (!isSmartFilter || !debouncedSearch || allItems.length === 0) {
      setSmartIndices(null);
      return;
    }

    const fetchSmartFilter = async () => {
      setIsAiLoading(true);
      try {
        const itemsSummary = allItems.map((item, index) => ({
          index,
          title: item.title,
          snippet: item.contentSnippet?.slice(0, 200) || ""
        }));

        const prompt = `
          You are a helpful assistant filtering a blog feed.
          User Query: "${debouncedSearch}"
          Here are the blog posts: ${JSON.stringify(itemsSummary)}
          Return a JSON array of the indices (integers) of the posts that are most relevant to the user's query.
        `;

        const ai = getAiInstance();
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        const indices = JSON.parse(response.text || '[]');
        
        setSmartIndices(indices);
        indices.length === 0 
          ? toast.info("No AI matches found", { description: "Try adjusting your search query." }) 
          : toast.success(`AI found ${indices.length} articles`, { description: "Showing the most relevant results." });
      } catch (e) {
        console.error("AI Filter Error:", e);
        toast.error("AI filtering failed", { description: "An error occurred while analyzing the articles." });
      } finally {
        setIsAiLoading(false);
      }
    };

    fetchSmartFilter();
  }, [debouncedSearch, isSmartFilter, allItems]);

  // Filter Items
  const filteredItems = useMemo(() => {
    let items = allItems;

    if (activeTab === 'saved') items = items.filter(item => prefs.savedPosts.includes(item.link));
    else if (activeTab === 'incidents') items = items.filter(item => item.source === 'Service Health');
    else if (activeTab === 'deprecations') items = items.filter(item => item.source === 'Product Deprecations');
    else if (activeTab === 'security') items = items.filter(item => item.source === 'Security Bulletins');
    else if (activeTab === 'architecture') items = items.filter(item => item.source === 'Architecture Center');
    else if (activeTab === 'youtube') items = items.filter(item => item.source === 'Google Cloud YouTube');
    else if (activeTab === 'cloud-blog') items = items.filter(item => item.source === 'Cloud Blog');
    else if (activeTab === 'release-notes') items = items.filter(item => item.source === 'Release Notes' || item.source === 'Gemini Enterprise');
    else if (activeTab === 'updates') items = items.filter(item => item.source === 'Product Updates' || item.source === 'Google AI Research');

    if (isSmartFilter && smartIndices !== null) {
      const smartItems = smartIndices.map(i => allItems[i]).filter(Boolean);
      const smartLinks = new Set(smartItems.map(i => i.link));
      items = items.filter(item => smartLinks.has(item.link));
    } else if (search) {
      const lowerSearch = search.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(lowerSearch) || 
        item.contentSnippet?.toLowerCase().includes(lowerSearch) ||
        item.categories?.some(cat => cat.toLowerCase().includes(lowerSearch))
      );
    }

    if (selectedCategories.length > 0) {
      if (filterType === 'exclude') {
        items = items.filter(item => 
          !item.categories?.some(cat => selectedCategories.includes(cat))
        );
      } else {
        items = items.filter(item => 
          item.categories?.some(cat => selectedCategories.includes(cat))
        );
      }
    }

    if (dateRange?.start) {
      const start = new Date(dateRange.start).getTime();
      items = items.filter(item => new Date(item.isoDate).getTime() >= start);
    }
    if (dateRange?.end) {
      const end = new Date(dateRange.end).getTime();
      const endDate = new Date(dateRange.end);
      endDate.setDate(endDate.getDate() + 1);
      items = items.filter(item => new Date(item.isoDate).getTime() < endDate.getTime());
    }

    // Sorting
    if (sortBy === 'date') {
      items.sort((a, b) => {
        const dateA = new Date(a.isoDate).getTime();
        const dateB = new Date(b.isoDate).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (sortBy === 'category') {
      items.sort((a, b) => {
        const catA = a.categories?.[0] || '';
        const catB = b.categories?.[0] || '';
        return sortDirection === 'asc' ? catA.localeCompare(catB) : catB.localeCompare(catA);
      });
    }

    return items;
  }, [allItems, search, isSmartFilter, smartIndices, selectedCategories, filterType, dateRange, activeTab, prefs.savedPosts, sortBy, sortDirection]);

  const handleExportCSV = useCallback(() => {
    if (filteredItems.length === 0) {
      toast.error("No items to export", { description: "Please adjust your filters and try again." });
      return;
    }

    const headers = ["Date", "Title", "Category", "Link", "Source"];
    const csvContent = [
      headers.join(","),
      ...filteredItems.map(item => {
        const date = new Date(item.isoDate).toLocaleDateString();
        const title = `"${item.title.replace(/"/g, '""')}"`;
        const category = `"${(item.categories || []).join("; ")}"`;
        return [date, title, category, item.link, item.source].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `gcp_pulse_export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Exported ${filteredItems.length} items to CSV`, { description: "Your download should begin shortly." });
  }, [filteredItems]);

  const handleSave = useCallback((item: FeedItem) => {
    toggleSavedPost(item.link);
  }, [toggleSavedPost]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.focus();
      }
      
      // Tab switching with Cmd/Ctrl + Number
      if (e.metaKey || e.ctrlKey) {
        if (e.key === '1') setActiveTab('weekly-brief');
        if (e.key === '2') setActiveTab('all');
        if (e.key === '3') setActiveTab('incidents');
        if (e.key === '4') setActiveTab('security');
        if (e.key === '5') setActiveTab('deprecations');
        if (e.key === '6') setActiveTab('architecture');
        if (e.key === '7') setActiveTab('youtube');
        if (e.key === '8') setActiveTab('saved');
        if (e.key === '9') setActiveTab('tools');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (queryError) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <ErrorDisplay message="We couldn't load the latest updates." onRetry={() => refetchFeed()} />
        </div>
    );
  }

    return (
    <AppLayout
      activeTab={activeTab}
      setActiveTab={handleSetActiveTab}
      isPresentationMode={isPresentationMode}
      setIsPresentationMode={setIsPresentationMode}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      search={search}
      setSearch={setSearch}
      isSmartFilter={isSmartFilter}
      setIsSmartFilter={setIsSmartFilter}
      isAiLoading={isAiLoading}
      categories={categories}
      selectedCategories={selectedCategories}
      filterType={filterType}
      handleCategoryChange={handleCategoryChange}
      handleFilterTypeChange={handleFilterTypeChange}
      dateRange={dateRange}
      handleDateRangeChange={handleDateRangeChange}
      sortBy={sortBy}
      sortDirection={sortDirection}
      handleSortChange={handleSortChange}
      viewMode={prefs.viewMode}
      onViewModeChange={(mode) => updatePrefs({ viewMode: mode })}
      onExportCSV={handleExportCSV}
      isAnyFilterActive={isAnyFilterActive}
      onClearFilters={clearAllFilters}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Suspense fallback={<PageLoader />}>
            {activeTab === 'tools' ? (
              <ToolsView />
            ) : activeTab === 'weekly-brief' ? (
              <WeeklyBriefView items={allItems} />
            ) : activeTab === 'youtube' ? (
              <YouTubeView items={filteredItems} loading={youtubeLoading} onClearFilters={clearAllFilters} />
            ) : activeTab === 'cloud-blog' ? (
              <StandardFeedView
                items={filteredItems}
                loading={loading}
                viewMode={prefs.viewMode}
                onSummarize={handleSummarize}
                summarizingId={summarizingId}
                onSave={handleSave}
                savedPosts={prefs.savedPosts}
                subscribedCategories={prefs.subscribedCategories}
                toggleCategorySubscription={toggleCategorySubscription}
                handleCategoryChange={handleCategoryChange}
                analyses={analyses}
                isPresentationMode={isPresentationMode}
                onClearFilters={clearAllFilters}
              />
            ) : activeTab === 'incidents' ? (
              <IncidentsView 
                items={filteredItems} 
                loading={loading}
              />
            ) : activeTab === 'deprecations' ? (
              <ProductDeprecationsView items={filteredItems} loading={deprecationsLoading} />
            ) : activeTab === 'architecture' ? (
              <ArchitectureView 
                items={filteredItems} 
                loading={architectureLoading}
                onSummarize={handleSummarize}
                summarizingId={summarizingId}
                onSave={handleSave}
                savedPosts={prefs.savedPosts}
                isPresentationMode={isPresentationMode}
              />
            ) : activeTab === 'security' ? (
              <SecurityView 
                items={filteredItems} 
                loading={securityLoading}
                onSummarize={handleSummarize}
                summarizingId={summarizingId}
              />
            ) : activeTab === 'saved' ? (
              <SavedView
                items={filteredItems}
                loading={loading}
                viewMode={prefs.viewMode}
                onSummarize={handleSummarize}
                summarizingId={summarizingId}
                onSave={handleSave}
                savedPosts={prefs.savedPosts}
                subscribedCategories={prefs.subscribedCategories}
                toggleCategorySubscription={toggleCategorySubscription}
                handleCategoryChange={handleCategoryChange}
                analyses={analyses}
                isPresentationMode={isPresentationMode}
                onClearAll={clearSavedPosts}
                onExplore={() => setActiveTab('all')}
              />
            ) : activeTab === 'all' ? (
              <DiscoverView
                items={filteredItems}
                loading={loading}
                prefs={prefs}
                onSummarize={handleSummarize}
                summarizingId={summarizingId}
                onSave={handleSave}
                toggleCategorySubscription={toggleCategorySubscription}
                handleCategoryChange={handleCategoryChange}
                analyses={analyses}
                isPresentationMode={isPresentationMode}
                isAiLoading={isAiLoading}
                onToggleColumnVisibility={(column) => {
                  const isHidden = prefs.hiddenColumns.includes(column);
                  updatePrefs({
                    hiddenColumns: isHidden 
                      ? prefs.hiddenColumns.filter(c => c !== column)
                      : [...prefs.hiddenColumns, column]
                  });
                }}
                onUpdateColumnOrder={(order) => updatePrefs({ columnOrder: order })}
                onClearFilters={clearAllFilters}
                search={search}
              />
            ) : (
              <StandardFeedView
                items={filteredItems}
                loading={loading}
                viewMode={prefs.viewMode}
                onSummarize={handleSummarize}
                summarizingId={summarizingId}
                onSave={handleSave}
                savedPosts={prefs.savedPosts}
                subscribedCategories={prefs.subscribedCategories}
                toggleCategorySubscription={toggleCategorySubscription}
                handleCategoryChange={handleCategoryChange}
                analyses={analyses}
                isPresentationMode={isPresentationMode}
                onClearFilters={clearAllFilters}
              />
            )}
          </Suspense>
        </motion.div>
      </AnimatePresence>

      {summaryModal && (
        <SummaryModal 
          isOpen={summaryModal.isOpen}
          onClose={closeSummaryModal}
          title={summaryModal.title}
          analysis={summaryModal.analysis}
          streamContent={summaryModal.streamContent}
          isStreaming={summaryModal.isStreaming}
        />
      )}
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
