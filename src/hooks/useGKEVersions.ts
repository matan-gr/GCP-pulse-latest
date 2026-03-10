import { useQuery } from '@tanstack/react-query';

export interface GKEVersion {
  version: string;
  date: string;
  status: 'Healthy' | 'Security Patch' | 'Deprecated';
  link: string;
  description: string;
}

export interface GKEChannelInfo {
  name: 'Stable' | 'Regular' | 'Rapid';
  current: GKEVersion;
  history: GKEVersion[];
}

const fetchGKEVersions = async (): Promise<GKEChannelInfo[]> => {
  const fetchChannel = async (name: 'Stable' | 'Regular' | 'Rapid'): Promise<GKEChannelInfo> => {
    try {
      const response = await fetch(`/api/gke-feed?channel=${name.toLowerCase()}`);
      if (!response.ok) throw new Error(`Failed to fetch ${name} feed`);
      
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, "text/xml");
      
      let entries = Array.from(xmlDoc.querySelectorAll("entry"));
      if (entries.length === 0) {
        entries = Array.from(xmlDoc.querySelectorAll("item"));
      }

      if (entries.length === 0) throw new Error(`No entries found for ${name}`);

      const parseEntry = (entry: Element): GKEVersion => {
        const title = entry.querySelector("title")?.textContent || "";
        const content = entry.querySelector("content")?.textContent || entry.querySelector("description")?.textContent || "";
        const updated = entry.querySelector("updated")?.textContent || entry.querySelector("pubDate")?.textContent || new Date().toISOString();
        
        let link = "";
        const linkElem = entry.querySelector("link");
        if (linkElem) {
           link = linkElem.getAttribute("href") || linkElem.textContent || "";
        }

        let version = "Unknown";
        const gkeRegex = /(\d+\.\d+\.\d+-gke\.\d+)/;
        const semverRegex = /v?(\d+\.\d+\.\d+)/;
        
        let match = title.match(gkeRegex);
        if (match) {
            version = match[1];
        } else {
            match = title.match(semverRegex);
            if (match) {
                version = match[1];
            } else {
                match = content.match(gkeRegex);
                if (match) {
                    version = match[1];
                }
            }
        }

        let status: 'Healthy' | 'Security Patch' | 'Deprecated' = 'Healthy';
        const lowerContent = (title + " " + content).toLowerCase();
        
        if (lowerContent.includes('security patch') || lowerContent.includes('vulnerability') || lowerContent.includes('cve')) {
          status = 'Security Patch';
        }

        return {
          version,
          date: new Date(updated).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
          status,
          link,
          description: content.replace(/<[^>]*>?/gm, '').slice(0, 150) + "..."
        };
      };

      const versions = entries.map(parseEntry).filter(v => v.version !== "Unknown");
      
      if (versions.length === 0) {
         const fallbackVersion: GKEVersion = {
             version: "Latest",
             date: new Date().toLocaleDateString(),
             status: 'Healthy',
             link: "https://cloud.google.com/kubernetes-engine/docs/release-notes",
             description: "Could not parse exact version number. Click to view release notes."
         };
         return { name, current: fallbackVersion, history: [] };
      }

      const current = versions[0];
      const history = versions.slice(1, 5);

      return { name, current, history };
    } catch (error) {
      console.error(`Error fetching ${name} channel:`, error);
      const errorVersion: GKEVersion = {
        version: 'Error',
        date: '-',
        status: 'Deprecated',
        link: "https://cloud.google.com/kubernetes-engine/docs/release-notes",
        description: 'Failed to load channel data.'
      };
      return { name, current: errorVersion, history: [] };
    }
  };

  const channels = await Promise.all([
    fetchChannel('Stable'),
    fetchChannel('Regular'),
    fetchChannel('Rapid'),
  ]);

  return channels;
};

export const useGKEVersions = () => {
  return useQuery({
    queryKey: ['gke-channels'],
    queryFn: fetchGKEVersions,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
