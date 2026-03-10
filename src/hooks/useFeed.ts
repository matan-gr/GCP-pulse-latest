
import { useQuery } from '@tanstack/react-query';
import { Feed, FeedItem } from '../types';
import { extractGCPProducts, cleanText } from '../utils';

const fetchFeed = async (): Promise<Feed> => {
  try {
    const response = await fetch('/api/feed');
    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error("Fetch Feed Error:", error);
    throw error;
  }
};

export const useFeed = () => {
  return useQuery({
    queryKey: ['feed'],
    queryFn: fetchFeed,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useProductDeprecations = () => {
  return useQuery({
    queryKey: ['feed'], // Share cache with useFeed
    queryFn: fetchFeed,
    staleTime: 1000 * 60 * 5,
    select: (data: Feed) => {
      return data.items.filter(item => {
        // We are looking for items from "Release Notes" that are about deprecations.
        // The user provided source is a filter on Release Notes for "Type: Deprecation".
        // We simulate this by filtering the canonical Release Notes feed.
        if (item.source !== 'Release Notes') return false;

        const text = (item.title + " " + (item.content || "") + " " + (item.contentSnippet || "")).toLowerCase();
        const categories = (item.categories || []).map(c => c.toLowerCase());

        const isDeprecation = 
          text.includes('deprecation') || 
          text.includes('deprecated') || 
          text.includes('end of support') || 
          text.includes('end of life') ||
          text.includes('turn down') ||
          text.includes('shut down') ||
          text.includes('discontinued') ||
          categories.includes('deprecation') ||
          categories.includes('security bulletin'); // Sometimes security bulletins are related to EOL

        return isDeprecation;
      }).map(item => {
        // Extract a potential date from the content if possible
        let eolDate = item.isoDate;
        
        // Look for dates in format YYYY-MM-DD or Month DD, YYYY
        const dateRegex = /(\d{4}-\d{2}-\d{2})|([A-Z][a-z]+ \d{1,2}, \d{4})/g;
        const matches = (item.contentSnippet || item.content || "").match(dateRegex);
        
        if (matches) {
            // Parse dates and find the one furthest in the future relative to publication date
            const pubDate = new Date(item.isoDate).getTime();
            let maxDate = pubDate;
            
            matches.forEach(dateStr => {
                const d = new Date(dateStr).getTime();
                if (!isNaN(d) && d > maxDate) {
                    maxDate = d;
                }
            });
            
            if (maxDate > pubDate) {
                eolDate = new Date(maxDate).toISOString();
            }
        }

        return {
          ...item,
          source: 'Product Deprecations',
          categories: Array.from(new Set(['Deprecation', ...(item.categories || [])])),
          eolDate: eolDate
        };
      });
    }
  });
};

export const useSecurityBulletins = () => {
  return useQuery({
    queryKey: ['feed'], // Share cache with useFeed
    queryFn: fetchFeed,
    staleTime: 1000 * 60 * 5,
    select: (data: Feed) => {
      return data.items.filter(item => item.source === 'Security Bulletins').map(item => {
        // Robust Severity Extraction
        let severity = 'Unknown';
        const textToSearch = (item.title + " " + (item.content || item.contentSnippet)).toLowerCase();
        
        // Check for explicit "Severity: X" patterns first
        const severityMatch = textToSearch.match(/severity:\s*(critical|high|medium|low)/i);
        if (severityMatch) {
          severity = severityMatch[1].charAt(0).toUpperCase() + severityMatch[1].slice(1);
        } else {
          // Fallback to keyword search with word boundaries
          if (/\bcritical\b/.test(textToSearch)) severity = 'Critical';
          else if (/\bhigh\b/.test(textToSearch)) severity = 'High';
          else if (/\bmedium\b/.test(textToSearch)) severity = 'Medium';
          else if (/\blow\b/.test(textToSearch)) severity = 'Low';
        }

        const categories = ['Security', 'Bulletin'];
        if (severity !== 'Unknown') categories.push(severity);
        if (item.categories) categories.push(...item.categories);

        return {
          ...item,
          categories: Array.from(new Set(categories))
        };
      });
    }
  });
};

export const useArchitectureUpdates = () => {
  return useQuery({
    queryKey: ['feed'], // Share cache with useFeed
    queryFn: fetchFeed,
    staleTime: 1000 * 60 * 5,
    select: (data: Feed) => {
      return data.items.filter(item => item.source === 'Architecture Center').map(item => {
        let title = item.title;
        let link = item.link || '';
        let description = item.contentSnippet || item.content || '';
        let category = 'Architecture';

        // Attempt to parse HTML content for better title/link/description
        if (item.content) {
          // Extract category from h3 if present (e.g. <h3>Feature</h3>)
          const h3Match = item.content.match(/<h3>(.*?)<\/h3>/i);
          if (h3Match) {
             category = h3Match[1].trim();
          }

          // Simple regex to find the first link in the content which usually contains the real title
          const linkMatch = item.content.match(/<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/i);
          if (linkMatch) {
            const extractedLink = linkMatch[1];
            const extractedTitle = linkMatch[2].replace(/<[^>]+>/g, '').trim(); // Remove any inner tags
            
            if (extractedTitle && extractedLink) {
                title = extractedTitle;
                link = extractedLink;
                
                // Try to get description (text after the link)
                // The format is often: <p>... <a ...>Title</a>: Description ... </p>
                const afterLink = item.content.split('</a>')[1];
                if (afterLink) {
                   // Remove leading colons, hyphens, spaces, and HTML tags
                   description = afterLink.replace(/^[:\s-]+/, '').replace(/<[^>]+>/g, '').trim();
                }
            }
          }
        }

        const products = extractGCPProducts(title + " " + description);
        
        // Fix relative or missing links
        if (link.startsWith('#')) {
          // Handle anchor links common in release notes
          link = `https://docs.cloud.google.com/architecture/release-notes${link}`;
        } else if (link.startsWith('/')) {
          // Handle absolute paths relative to domain
          link = `https://cloud.google.com${link}`;
        } else if (!link.startsWith('http')) {
          // Fallback or relative path without slash
          if (link) {
             link = `https://cloud.google.com/${link}`;
          } else {
             link = 'https://docs.cloud.google.com/architecture/release-notes';
          }
        }

        return {
          ...item,
          title,
          link,
          contentSnippet: description,
          categories: Array.from(new Set([category, ...products, ...(item.categories || [])]))
        };
      });
    }
  });
};


export const useIncidents = () => {
  return useQuery({
    queryKey: ['incidents'],
    queryFn: async (): Promise<FeedItem[]> => {
      const response = await fetch('/api/incidents');
      if (!response.ok) throw new Error('Failed to fetch incidents');
      const data = await response.json();
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useYouTubeFeed = () => {
  return useQuery({
    queryKey: ['feed'], // Share cache with useFeed
    queryFn: fetchFeed,
    staleTime: 1000 * 60 * 5,
    select: (data: Feed) => {
      return data.items.filter(item => item.source === 'Google Cloud YouTube');
    }
  });
};
