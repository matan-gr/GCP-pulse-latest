// ... imports
import express from "express";
import Parser from "rss-parser";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production' || fs.existsSync(path.resolve('dist', 'index.html'));

// Trust Proxy for Cloud Run / Nginx
app.set('trust proxy', 1);

// Initialize Gemini AI client lazily
// REMOVED: AI endpoints have been moved to the frontend to comply with security guidelines.

const FEEDS = [
  { url: "https://cloudblog.withgoogle.com/rss/", name: "Cloud Blog" },
  { url: "https://blog.google/products/google-cloud/rss/", name: "Product Updates" },
  { url: "https://cloud.google.com/feeds/gcp-release-notes.xml", name: "Release Notes" },
  { url: "https://docs.cloud.google.com/feeds/google-cloud-security-bulletins.xml", name: "Security Bulletins" },
  { url: "https://cloud.google.com/feeds/architecture-center-release-notes.xml", name: "Architecture Center" },
  { url: "http://googleaiblog.blogspot.com/atom.xml", name: "Google AI Research" },
  { url: "https://docs.cloud.google.com/feeds/gemini-enterprise-release-notes.xml", name: "Gemini Enterprise" },
  { url: "https://corsproxy.io/?https://www.youtube.com/feeds/videos.xml?channel_id=UCJS9pqu9BzkAMNTmzNMNhvg", name: "Google Cloud YouTube" }
];

const parser = new Parser({
  timeout: 5000, // 5 seconds timeout for RSS feeds
  customFields: {
    item: [
      ['media:group', 'mediaGroup'],
      ['yt:videoId', 'videoId'],
      ['yt:channelId', 'channelId'],
      ['author', 'author'],
    ]
  }
});

// Middleware to parse JSON
app.use(express.json({ limit: '10mb' })); // Increased limit for large payloads

// Compression Middleware
app.use(compression());

// Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for now to avoid issues with external scripts/images if any
  crossOriginEmbedderPolicy: false,
}));

// Rate Limiting Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Helper to clean text
const cleanText = (text: string | undefined) => {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ") // Replace &nbsp;
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
};

// Helper to format ISO 8601 duration
const formatDuration = (isoDuration: string) => {
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return isoDuration;
  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');
  
  let result = '';
  if (hours) result += `${hours}:`;
  result += `${minutes || '0'}:${seconds.padStart(2, '0') || '00'}`;
  return result;
};

// In-memory cache
const youtubeCache = {
  enrichedYouTubeItems: null as any[] | null,
  lastUpdated: 0,
  CACHE_DURATION: 1000 * 60 * 60, // 1 hour
};

// Helper to enrich YouTube items using YouTube Data API v3
const enrichYouTubeItems = async (items: any[]) => {
  const youtubeItems = items.filter(item => item.source === "Google Cloud YouTube");
  if (youtubeItems.length === 0) return items;

  // Check cache
  if (youtubeCache.enrichedYouTubeItems && (Date.now() - youtubeCache.lastUpdated < youtubeCache.CACHE_DURATION)) {
    return items.map(item => {
      const cachedItem = youtubeCache.enrichedYouTubeItems?.find(c => c.id === item.id);
      return cachedItem ? { ...item, ...cachedItem } : item;
    });
  }

  // Extract video IDs
  const videoIds = youtubeItems
    .map(item => {
      let videoId = (item as any).videoId || '';
      if (!videoId && item.id && item.id.includes('yt:video:')) {
        const match = item.id.match(/yt:video:([a-zA-Z0-9_-]{11})/);
        if (match) videoId = match[1];
      }
      if (!videoId && item.link) {
        const match = item.link.match(/(?:v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
        if (match) videoId = match[1];
      }
      return videoId;
    })
    .filter(Boolean);

  if (videoIds.length === 0) return items;

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) throw new Error('YOUTUBE_API_KEY is missing');

    // Fetch details in batches of 50
    const allDetails = [];
    for (let i = 0; i < videoIds.length; i += 50) {
      const batchIds = videoIds.slice(i, i + 50).join(',');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${batchIds}&key=${apiKey}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
           console.warn(`YouTube API error: ${response.statusText}`);
           continue; 
        }

        const data = await response.json();
        if (data.items) allDetails.push(...data.items);
      } catch (err) {
        clearTimeout(timeoutId);
        console.error("Error fetching YouTube batch:", err);
        // Continue to next batch even if one fails
      }
    }

    // Map details back to items
    const enrichedItems = await Promise.all(items.map(async (item) => {
      const videoId = videoIds.find(id => item.link?.includes(id) || item.id?.includes(id));
      const details = allDetails.find(d => d.id === videoId);
      if (details) {
        // Use existing tags from YouTube
        const labels = details.snippet.tags || [];
        
        return {
          ...item,
          duration: formatDuration(details.contentDetails.duration),
          viewCount: parseInt(details.statistics.viewCount, 10),
          likeCount: parseInt(details.statistics.likeCount, 10),
          channelTitle: details.snippet.channelTitle,
          categories: labels,
          videoId: details.id
        };
      }
      return item;
    }));

    // Update cache
    youtubeCache.enrichedYouTubeItems = enrichedItems.filter(item => item.source === "Google Cloud YouTube");
    youtubeCache.lastUpdated = Date.now();

    return enrichedItems;
  } catch (error) {
    console.error("Error enriching YouTube items:", error);
    return items;
  }
};

// Helper to fetch feeds
const fetchFeeds = async () => {
  const feedPromises = FEEDS.map(async (feedSource) => {
    try {
      const feed = await parser.parseURL(feedSource.url);
      const items = feed.items.map(item => ({
        ...item,
        source: feedSource.name,
        title: cleanText(item.title),
        contentSnippet: cleanText(item.contentSnippet || item.content),
        content: item.content || item.contentSnippet || "",
        isoDate: item.isoDate || (item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString())
      }));
      
      return items;
    } catch (error) {
      console.error(`Error fetching feed ${feedSource.name}:`, error);
      return [];
    }
  });

  const allItemsArrays = await Promise.all(feedPromises);
  let allItems = allItemsArrays.flat();
  
  // Enrich YouTube items
  allItems = await enrichYouTubeItems(allItems);

  allItems.forEach((item: any, index) => {
    const baseId = item.id || item.guid || item.link || `generated`;
    item.id = `${baseId}-${index}`;
  });

  allItems.sort((a, b) => {
    return new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime();
  });

  return allItems;
};

// Cache configuration
let cache: {
  data: any;
  timestamp: number;
} | null = null;
const CACHE_DURATION = 1000 * 60 * 60; // 60 minutes cache

// API Routes
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/api/feed", async (req, res) => {
  try {
    // Set Cache-Control header for API response
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600'); // Cache for 5 mins (browser), 10 mins (CDN)

    // Check cache
    if (cache && (Date.now() - cache.timestamp < CACHE_DURATION)) {
      return res.json(cache.data);
    }

    const allItems = await fetchFeeds();

    const responseData = {
      title: "Aggregated GCP Feeds",
      description: "Aggregated news and updates from Google Cloud",
      items: allItems
    };

    // Update cache
    cache = {
      data: responseData,
      timestamp: Date.now()
    };

    res.json(responseData);
  } catch (error) {
    console.error("Error fetching RSS feeds:", error);
    res.status(500).json({ error: "Failed to fetch RSS feeds" });
  }
});

app.get("/api/debug-key", (req, res) => {
  res.json({
    keys: Object.keys(process.env),
    GEMINI_API_KEY_LENGTH: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
  });
});

app.get("/api/incidents", async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch("https://status.cloud.google.com/incidents.json", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch incidents: ${response.statusText}`);
    }
    const data = await response.json();

    const incidents = data.map((item: any) => {
      // Extract content from updates
      let content = "";
      if (item.most_recent_update?.text) {
        content = item.most_recent_update.text;
      } else if (item.updates && item.updates.length > 0) {
        content = item.updates[0].text;
      }

      // Defensive extraction
      const serviceName = item.service_name || item.service_key || "GCP Service";
      const severity = item.severity || item.priority || "medium"; // Default to medium if unknown
      const description = item.external_desc || item.summary || content || "No description available";
      
      return {
        id: item.uri || item.id || `incident-${Math.random()}`,
        title: description, // Use description as title for the feed item
        link: `https://status.cloud.google.com${item.uri || ''}`,
        isoDate: item.begin || new Date().toISOString(),
        source: 'Service Health',
        content: content,
        contentSnippet: content,
        
        // Specific Incident Fields
        serviceName: serviceName,
        severity: severity,
        description: description,
        updates: item.updates || [], // Pass full updates array
        begin: item.begin,
        end: item.end,
        isActive: !item.end, // Active if no end date
        isHistory: !!item.end
      };
    });

    // Sort by Date Descending (Active first, then by date)
    incidents.sort((a: any, b: any) => {
      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;
      return new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime();
    });

    res.json(incidents);
  } catch (error) {
    console.error("Error fetching incidents:", error);
    res.status(500).json({ error: "Failed to fetch incidents" });
  }
});

app.get("/api/ip-ranges", async (req, res) => {
  try {
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=7200'); // Cache for 1 hour
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch("https://www.gstatic.com/ipranges/cloud.json", {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch IP ranges: ${response.statusText}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching IP ranges:", error);
    res.status(500).json({ error: "Failed to fetch IP ranges" });
  }
});

app.get("/api/gke-feed", async (req, res) => {
  const { channel } = req.query;
  const feedUrls: Record<string, string> = {
    'stable': 'https://cloud.google.com/feeds/gke-stable-channel-release-notes.xml',
    'regular': 'https://cloud.google.com/feeds/gke-regular-channel-release-notes.xml',
    'rapid': 'https://cloud.google.com/feeds/gke-rapid-channel-release-notes.xml',
  };

  const url = feedUrls[String(channel).toLowerCase()];
  if (!url) {
    return res.status(400).json({ error: "Invalid channel" });
  }

  try {
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=7200'); // Cache for 1 hour
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(url, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch GKE feed: ${response.statusText}`);
    }
    const xml = await response.text();
    res.set('Content-Type', 'text/xml');
    res.send(xml);
  } catch (error) {
    console.error(`Error fetching GKE feed for ${channel}:`, error);
    res.status(500).json({ error: "Failed to fetch GKE feed" });
  }
});

// --- AI Endpoints ---

// REMOVED: AI endpoints have been moved to the frontend to comply with security guidelines.

// Vite middleware for development
if (!isProduction) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    configFile: path.resolve(__dirname, '../../vite.config.ts'),
    server: { 
      middlewareMode: true
    },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  // Serve static files in production
  app.use(express.static('dist', { index: false }));
  
  // SPA fallback with runtime env injection
  app.use((req, res) => {
    const indexPath = path.resolve('dist', 'index.html');
    fs.readFile(indexPath, 'utf8', (err, htmlData) => {
      if (err) {
        console.error('Error reading index.html:', err);
        if (!res.headersSent) {
          res.status(500).send('Internal Server Error');
        }
        return;
      }
      
      const apiKey = process.env.GEMINI_API_KEY || '';
      const envScript = `<script>window.__GEMINI_API_KEY__ = ${JSON.stringify(apiKey)}; window.process = window.process || { env: {} }; window.process.env.GEMINI_API_KEY = ${JSON.stringify(apiKey)};</script>`;
      const injectedHtml = htmlData.replace('<head>', `<head>${envScript}`);
      
      res.send(injectedHtml);
    });
  });
}

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
