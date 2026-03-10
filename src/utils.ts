import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractImage(content: string): string | null {
  if (!content) return null;
  const match = content.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
}

const GCP_PRODUCTS = [
  "Compute Engine", "App Engine", "Kubernetes Engine", "GKE", "Cloud Functions", "Cloud Run",
  "Cloud Storage", "Persistent Disk", "Filestore",
  "BigQuery", "Cloud SQL", "Cloud Spanner", "Bigtable", "Firestore", "Memorystore",
  "VPC", "Cloud Load Balancing", "Cloud CDN", "Cloud DNS",
  "Anthos", "Apigee",
  "Vertex AI", "AutoML", "Dialogflow", "Vision API", "Translation API", "Natural Language API",
  "Gemini", "Duet AI", "GenAI", "Generative AI", "PaLM", "Bard", "Imagen", "Codey",
  "Pub/Sub", "Dataflow", "Dataproc", "Looker",
  "Cloud Build", "Artifact Registry", "Container Registry",
  "IAM", "Cloud Armor", "Secret Manager", "KMS",
  "Operations Suite", "Cloud Logging", "Cloud Monitoring"
];

export function cleanText(text: string | undefined): string {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&nbsp;/g, " ") // Replace &nbsp;
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}

export function extractGCPProducts(text: string): string[] {
  if (!text) return [];
  const found = new Set<string>();
  const lowerText = text.toLowerCase();
  
  GCP_PRODUCTS.forEach(product => {
    if (lowerText.includes(product.toLowerCase())) {
      found.add(product);
    }
  });
  
  return Array.from(found);
}

export function getCategoryColor(cat: string) {
  const c = cat.toLowerCase();
  if (c.includes('compute') || c.includes('engine') || c.includes('kubernetes') || c.includes('gke')) return 'blue';
  if (c.includes('storage') || c.includes('database') || c.includes('sql') || c.includes('spanner')) return 'amber';
  if (c.includes('network')) return 'indigo';
  if (c.includes('vpc') || c.includes('dns') || c.includes('cdn')) return 'emerald';
  if (c.includes('data') || c.includes('analytics') || c.includes('bigquery') || c.includes('pubsub')) return 'blue';
  if (c.includes('ai') || c.includes('ml') || c.includes('vertex') || c.includes('gemini')) return 'purple';
  if (c.includes('security') || c.includes('iam') || c.includes('kms') || c.includes('shield')) return 'rose';
  if (c.includes('ops') || c.includes('monitoring') || c.includes('logging') || c.includes('trace')) return 'slate';
  if (c.includes('dev') || c.includes('code') || c.includes('build') || c.includes('deploy')) return 'cyan';
  return 'slate';
}

export function getCategoryStyles(cat: string) {
  const color = getCategoryColor(cat);
  switch (color) {
    case 'blue': return 'bg-blue-50/50 text-blue-600 border-blue-100/50 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-800/30 hover:bg-blue-100/50 dark:hover:bg-blue-900/20';
    case 'emerald': return 'bg-emerald-50/50 text-emerald-600 border-emerald-100/50 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-800/30 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20';
    case 'amber': return 'bg-amber-50/50 text-amber-600 border-amber-100/50 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-800/30 hover:bg-amber-100/50 dark:hover:bg-amber-900/20';
    case 'rose': return 'bg-rose-50/50 text-rose-600 border-rose-100/50 dark:bg-rose-900/10 dark:text-rose-400 dark:border-rose-800/30 hover:bg-rose-100/50 dark:hover:bg-rose-900/20';
    case 'purple': return 'bg-purple-50/50 text-purple-600 border-purple-100/50 dark:bg-purple-900/10 dark:text-purple-400 dark:border-purple-800/30 hover:bg-purple-100/50 dark:hover:bg-purple-900/20';
    case 'cyan': return 'bg-cyan-50/50 text-cyan-600 border-cyan-100/50 dark:bg-cyan-900/10 dark:text-cyan-400 dark:border-cyan-800/30 hover:bg-cyan-100/50 dark:hover:bg-cyan-900/20';
    case 'indigo': return 'bg-indigo-50/50 text-indigo-600 border-indigo-100/50 dark:bg-indigo-900/10 dark:text-indigo-400 dark:border-indigo-800/30 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/20';
    default: return 'bg-slate-50/50 text-slate-600 border-slate-100/50 dark:bg-slate-900/10 dark:text-slate-400 dark:border-slate-800/30 hover:bg-slate-100/50 dark:hover:bg-slate-900/20';
  }
}
