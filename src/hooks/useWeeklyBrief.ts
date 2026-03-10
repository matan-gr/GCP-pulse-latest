import { useState, useEffect, useCallback } from 'react';
import { FeedItem } from '../types';
import { toast } from 'sonner';
import { getAiInstance } from '../services/geminiService';

export const useWeeklyBrief = (items: FeedItem[]) => {
  const [brief, setBrief] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateBrief = useCallback(async (force = false) => {
    if (loading || items.length === 0) return;

    // Check cache first if not forcing
    if (!force) {
      const cached = localStorage.getItem('weekly_brief_cache');
      if (cached) {
        const { content, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        if (age < 6 * 60 * 60 * 1000) { // 6 hours
          setBrief(content);
          setLastUpdated(new Date(timestamp));
          return;
        }
      }
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
           
           // If EOL is in the future and within 90 days, include it
           if (eol > now && eol <= ninetyDaysFromNow) return true;
           
           // If EOL was in the last 7 days, include it
           if (eol >= oneWeekAgo && eol <= now) return true;
        }
        
        return false;
      });
      
      // If no items in last week, fall back to last 30 days but mention it
      const contextItems = weeklyItems.length > 0 ? weeklyItems : items.slice(0, 50);
      const timeWindow = weeklyItems.length > 0 ? "Last 7 Days + Upcoming Deprecations" : "Recent Updates (Low volume week)";

      const contextData = JSON.stringify(contextItems.map(i => ({
        title: i.title,
        source: i.source,
        date: i.isoDate,
        eolDate: i.eolDate,
        summary: i.contentSnippet || i.content?.slice(0, 1000), // Increased context size
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
        Present this section as a table followed by a detailed list for actionable items.
        
        | Product Name | Description | Action Required By | Priority |
        | :--- | :--- | :--- | :--- |
        | [Name] | [Brief description] | [Date] | [High/Med] |

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
        
        // Cache the result
        localStorage.setItem('weekly_brief_cache', JSON.stringify({
          content: text,
          timestamp: now.getTime()
        }));
      } else {
        throw new Error("No content generated");
      }

    } catch (err: any) {
      console.error("Failed to generate brief:", err);
      setError(err.message || "Failed to generate briefing");
      toast.error("Failed to generate weekly brief", { description: "An error occurred while analyzing the latest updates." });
    } finally {
      setLoading(false);
    }
  }, [items, loading]);

  // Load from cache on mount
  useEffect(() => {
    const cached = localStorage.getItem('weekly_brief_cache');
    if (cached) {
      try {
        const { content, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;
        // Check if cache is valid (less than 6 hours old)
        if (age < 6 * 60 * 60 * 1000) {
          setBrief(content);
          setLastUpdated(new Date(timestamp));
        }
      } catch (e) {
        console.error("Failed to parse cached brief", e);
        localStorage.removeItem('weekly_brief_cache');
      }
    }
  }, []);

  return {
    brief,
    loading,
    lastUpdated,
    error,
    generateBrief
  };
};
