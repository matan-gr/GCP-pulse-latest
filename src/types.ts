export interface FeedItem {
  id?: string;
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
  categories?: string[];
  isoDate: string;
  enclosure?: { url: string; type?: string };
  source: string;
  
  // Incident specific fields
  serviceName?: string;
  severity?: string;
  begin?: string;
  end?: string;
  isActive?: boolean;
  description?: string;
  updates?: Array<{ created: string; text: string }>;
  products?: string[];
  eolDate?: string;
  videoId?: string;
  thumbnailUrl?: string;
  channelName?: string;
  duration?: string;
  durationSeconds?: number;
}

export interface Feed {
  title: string;
  description: string;
  items: FeedItem[];
}

export interface ChartData {
  riskAnalysis: {
    subject: string;
    A: number; // Current Score
    fullMark: number;
  }[];
  actionPriority: number; // 0-100
}

export interface AnalysisResult {
  summary: string;
  impact: string;
  relatedProducts: string[];
  targetAudience: string;
  chartData?: ChartData;
}

declare global {
  interface Window {
    process?: {
      env?: {
        GEMINI_API_KEY?: string;
      };
    };
  }
}

