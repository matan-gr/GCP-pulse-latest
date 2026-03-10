import { useState, useEffect, useCallback, useRef } from 'react';
import { FeedItem } from '../types';
import { toast } from 'sonner';
import { getAiInstance } from '../services/geminiService';
import { checkRateLimit, recordUsage, getRemainingTime } from '../utils/rateLimiter';

export const useWeeklyBrief = (items: FeedItem[]) => {
  const [brief, setBrief] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);

  const fetchServerCache = async () => {
    try {
      const res = await fetch('/api/weekly-brief');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error("Failed to fetch weekly brief cache", e);
    }
    return null;
  };

  const generateBrief = useCallback(async (force = false) => {
    if (loading || items.length === 0) return;

    if (!force) {
      const serverCache = await fetchServerCache();
      if (serverCache && serverCache.content) {
        const age = Date.now() - serverCache.timestamp;
        if (age < 90 * 60 * 1000) { // 90 minutes
          setBrief(serverCache.content);
          setLastUpdated(new Date(serverCache.timestamp));
          return;
        }
      }
    }

    // Try to acquire lock
    try {
      const lockRes = await fetch('/api/weekly-brief/lock', { method: 'POST' });
      if (!lockRes.ok) {
        // Someone else is generating, start polling
        setLoading(true);
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = setInterval(async () => {
          const cache = await fetchServerCache();
          if (cache && cache.content && !cache.isGenerating) {
            setBrief(cache.content);
            setLastUpdated(new Date(cache.timestamp));
            setLoading(false);
            if (pollingRef.current) clearInterval(pollingRef.current);
          }
        }, 5000);
        return;
      }
    } catch (e) {
      console.error("Failed to acquire lock", e);
    }

    if (!checkRateLimit('weekly_brief', 10, 90)) {
      const waitTime = getRemainingTime('weekly_brief', 10, 90);
      toast.error("Rate limit exceeded", { description: `Please wait ${waitTime} minutes before generating another weekly brief.` });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Filter for last 7 days OR upcoming deprecations
      const now = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const ninetyDaysFromNow = new Date();
      ninetyDaysFromNow.setDate(now.getDate() + 90);

      const weeklyItems = items.filter(item => {
        const itemDate = new Date(item.isoDate);
        
        // 1. Include items from the last 7 days
        if (itemDate >= oneWeekAgo) return true;
        
        // 2. Include UPCOMING deprecations (within next 90 days)
        if (item.source === 'Product Deprecations' && item.eolDate) {
           const eol = new Date(item.eolDate);
           if (eol > now && eol <= ninetyDaysFromNow) return true;
           if (eol >= oneWeekAgo && eol <= now) return true;
        }
        
        return false;
      });
      
      const contextItems = weeklyItems.length > 0 ? weeklyItems : items.slice(0, 50);
      const timeWindow = weeklyItems.length > 0 ? "Last 7 Days + Upcoming Deprecations" : "Recent Updates (Low volume week)";

      const contextData = JSON.stringify(contextItems.map(i => ({
        title: i.title,
        source: i.source,
        date: i.isoDate,
        eolDate: i.eolDate,
        summary: i.contentSnippet || i.content?.slice(0, 1000),
        link: i.link
      })));

      const prompt = `
        You are an expert Principal Cloud Architect and Site Reliability Engineer, AND a strategic Leadership Stakeholder.
        Your goal is to produce a **highly accurate, executive-level Weekly Cloud Briefing** for Google Cloud Platform (GCP).

        **Your briefing must be structured to provide insights from two distinct perspectives:**
        1.  **Principal Cloud Architect / SRE**: Focus on technical implications, reliability, architectural patterns, deprecations, and security.
        2.  **Leadership Stakeholder**: Focus on business value, strategic impact, cost implications, and high-level roadmap alignment.

        **Input Data (${timeWindow}):**
        ${contextData}

        **Critical Instructions:**
        1.  **Comprehensive Scan:** Review ALL provided input data thoroughly. Do not miss any product updates, deprecations, or security bulletins.
        2.  **Accuracy is Paramount:** Verify dates, version numbers, and product names.
        3.  **Deprecation Deep Dive:**
            *   **MANDATORY:** Use the **Google Search tool** to scan for the official "Google Cloud Product Deprecations" list and recent release notes to ensure completeness.
            *   Identify any major deprecations announced in the last 7-14 days that might be missing from the provided feed.
            *   **MUST** include the specific "Shutdown Date" or "EOL Date" for every deprecation listed.
        4.  **New Features & Options:** Highlight *new* capabilities that unlock new architectural patterns (not just minor bug fixes).
        5.  **YouTube/Video:** If the data contains video links, summarize the key takeaway.
        6.  **Synthesis:** Do not just list items. Connect the dots. (e.g., "The release of X complements the recent update to Y...").
        7.  **Detailed Analysis:** Provide a deep dive into the most significant changes, explaining the "Why", "What", and "How" for each.

        **Output Structure:**
        # 📅 Weekly Cloud Briefing
        
        ## 🚀 Executive Summary
        [3-4 sentences on the most impactful changes this week. Focus on "What do I need to do now?"]

        ## 🏗️ Perspective: Principal Cloud Architect / SRE
        [Technical analysis: Reliability, architectural patterns, deprecations, security implications, and technical debt management.]

        ## 📈 Perspective: Leadership Stakeholder
        [Strategic analysis: Business value, roadmap alignment, cost implications, and competitive advantage.]

        ## ⚠️ Critical Deprecations & Breaking Changes (High Priority)
        **MANDATORY:** You MUST present this section as a Markdown table. Do not use a list format for the summary.
        
        You MUST format the table with newlines between each row. It should look exactly like this:
        | Header 1 | Header 2 |
        | --- | --- |
        | Row 1 | Data 1 |
        | Row 2 | Data 2 |
        
        Do not put the entire table on one line.
        
        | Product Name | Description | Action Required By | Priority |
        | :--- | :--- | :--- | :--- |
        | [Name] | [Brief description] | [Date] | [High/Med] |

        Follow the table with a detailed list for actionable items:
        
        **Detailed Action Items:**
        *   **[Product Name]**: [Detailed description of change and impact]. **Action Required by:** [Date].
        *(Ensure this list is comprehensive by cross-referencing with Google Search)*

        ## 🛡️ Security & Reliability
        [Bulletins, Incidents, and Security Feature launches]

        ## 📺 Recommended Watch (YouTube)
        [Highlight 1-2 key video updates if available. Include the title and a direct link.]
      `;

      const ai = getAiInstance();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      const text = response.text;

      if (text) {
        setBrief(text);
        const now = new Date();
        setLastUpdated(now);
        
        recordUsage('weekly_brief', 90);
        
        // Save to server cache
        await fetch('/api/weekly-brief', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: text })
        });
        
      } else {
        throw new Error("No content generated");
      }

    } catch (err: any) {
      console.error("Failed to generate brief:", err);
      setError(err.message || "Failed to generate briefing");
      toast.error("Failed to generate weekly brief", { description: "An error occurred while analyzing the latest updates." });
      
      // Release lock on failure
      await fetch('/api/weekly-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: null }) // This will fail validation but we can handle it or just let it expire
      }).catch(() => {});
      
    } finally {
      setLoading(false);
    }
  }, [items, loading]);

  useEffect(() => {
    // Initial fetch
    if (items.length > 0 && !brief && !loading) {
      generateBrief(false);
    }
  }, [items.length]);

  useEffect(() => {
    // Auto-refresh logic
    if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    
    autoRefreshRef.current = setInterval(async () => {
      const cache = await fetchServerCache();
      if (!cache || !cache.content || (Date.now() - cache.timestamp >= 90 * 60 * 1000)) {
        // Cache is stale or missing, trigger regeneration
        if (items.length > 0) {
          generateBrief(true);
        }
      }
    }, 60000); // Check every minute

    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [items, generateBrief]);

  return {
    brief,
    loading,
    lastUpdated,
    error,
    generateBrief
  };
};
