import React from 'react';
import { FeedItem } from '../types';
import { Sparkles, RefreshCw, Calendar, FileText, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'motion/react';
import { useWeeklyBrief } from '../hooks/useWeeklyBrief';
import { toast } from 'sonner';
import { marked } from 'marked';
import { AILoading } from '../components/ui/AILoading';

interface WeeklyBriefViewProps {
  items: FeedItem[];
}

export const WeeklyBriefView: React.FC<WeeklyBriefViewProps> = ({ items }) => {
  const { brief, loading, lastUpdated, error, generateBrief } = useWeeklyBrief(items);

  const handleRefresh = () => {
    generateBrief(true);
  };

  const handleExport = async () => {
    if (!brief) return;
    
    const htmlContent = await marked.parse(brief);
    
    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly Cloud Brief - ${new Date().toLocaleDateString()}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    
    :root {
      --color-primary: #1a73e8;
      --color-primary-dark: #1557b0;
      --color-bg: #ffffff;
      --color-text: #202124;
      --color-text-muted: #5f6368;
      --color-border: #dadce0;
      --color-accent-bg: #e8f0fe;
    }

    body {
      font-family: 'Outfit', system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: var(--color-text);
      background-color: #f8f9fa;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 800px;
      margin: 40px auto;
      background: var(--color-bg);
      border-radius: 24px;
      box-shadow: 0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15);
      overflow: hidden;
      border: 1px solid var(--color-border);
    }

    header {
      background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      backdrop-filter: blur(4px);
    }

    .logo-text {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    .meta {
      font-size: 14px;
      opacity: 0.9;
      margin-top: 8px;
    }

    .content {
      padding: 40px;
    }

    /* Markdown Styles */
    .prose h1 { color: var(--color-text); font-size: 28px; border-bottom: 1px solid var(--color-border); padding-bottom: 12px; margin-top: 0; font-weight: 600; }
    .prose h2 { color: var(--color-text); font-size: 22px; margin-top: 32px; margin-bottom: 16px; font-weight: 600; }
    .prose h3 { color: var(--color-text); font-size: 18px; margin-top: 24px; margin-bottom: 12px; font-weight: 600; }
    .prose p { margin-bottom: 16px; }
    .prose ul, .prose ol { margin-bottom: 16px; padding-left: 24px; }
    .prose li { margin-bottom: 8px; }
    .prose blockquote {
      border-left: 4px solid var(--color-primary);
      background: var(--color-accent-bg);
      padding: 16px 24px;
      margin: 24px 0;
      border-radius: 0 12px 12px 0;
      font-style: italic;
    }
    .prose a { color: var(--color-primary); text-decoration: none; font-weight: 500; }
    .prose a:hover { text-decoration: underline; }
    .prose strong { font-weight: 600; color: #202124; }

    footer {
      padding: 24px 40px;
      background: #f8f9fa;
      border-top: 1px solid var(--color-border);
      text-align: center;
      font-size: 13px;
      color: var(--color-text-muted);
    }

    @media print {
      body { background-color: white; }
      .container { box-shadow: none; border: none; margin: 0; max-width: 100%; }
      header { background: white; color: black; border-bottom: 2px solid black; }
      .logo-icon { border: 1px solid black; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header style="background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);">
      <div class="logo">
        <div class="logo-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: white;"><path d="m13 2-2 2.5h3L12 13h2l-4 9 1-9h-3z"/></svg>
        </div>
        <div class="logo-text">GCP Pulse</div>
      </div>
      <h1>Weekly Cloud Brief</h1>
      <div class="meta">Generated on ${new Date().toLocaleDateString()}</div>
    </header>
    <div class="content prose">
      ${htmlContent}
    </div>
    <footer>
      &copy; ${new Date().getFullYear()} GCP Pulse. All rights reserved. Generated by AI.
    </footer>
  </div>
</body>
</html>
    `;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-cloud-brief-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Brief exported as rich HTML", { description: "Your download should begin shortly." });
  };

  const MarkdownComponents = {
    h1: ({...props}: any) => (
      <h1 className="text-3xl font-bold text-[#202124] dark:text-[#e8eaed] mb-6 pb-4 border-b border-[#dadce0] dark:border-[#3c4043]" {...props} />
    ),
    h2: ({...props}: any) => (
      <h2 className="text-2xl font-semibold text-[#202124] dark:text-[#e8eaed] mt-8 mb-4 flex items-center" {...props} />
    ),
    h3: ({...props}: any) => (
      <h3 className="text-xl font-semibold text-[#3c4043] dark:text-[#bdc1c6] mt-6 mb-3" {...props} />
    ),
    strong: ({...props}: any) => (
      <strong className="font-semibold text-[#202124] dark:text-[#e8eaed]" {...props} />
    ),
    ul: ({...props}: any) => (
      <ul className="space-y-2 my-4 list-disc list-outside ml-5 text-[#3c4043] dark:text-[#bdc1c6]" {...props} />
    ),
    ol: ({...props}: any) => (
      <ol className="space-y-2 my-4 list-decimal list-outside ml-5 text-[#3c4043] dark:text-[#bdc1c6]" {...props} />
    ),
    li: ({...props}: any) => (
      <li className="leading-relaxed pl-1">{props.children}</li>
    ),
    blockquote: ({...props}: any) => (
      <blockquote className="pl-4 border-l-4 border-[#1a73e8] bg-[#e8f0fe] dark:bg-[#8ab4f8]/20 py-3 pr-4 rounded-r-xl my-6 text-[#3c4043] dark:text-[#bdc1c6] italic" {...props} />
    ),
    p: ({...props}: any) => (
      <p className="mb-4 leading-7 text-[#3c4043] dark:text-[#bdc1c6]" {...props} />
    ),
    a: ({...props}: any) => (
      <a className="text-[#1a73e8] dark:text-[#8ab4f8] hover:underline font-medium break-all transition-colors" target="_blank" rel="noopener noreferrer" {...props} />
    ),
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202124] dark:text-[#e8eaed] flex items-center tracking-tight">
            <Sparkles className="mr-3 text-[#1a73e8] dark:text-[#8ab4f8]" size={32} />
            Weekly Brief
          </h1>
          <p className="text-[#5f6368] dark:text-[#9aa0a6] mt-1 flex items-center text-[15px]">
            <Calendar size={16} className="mr-2" />
            {lastUpdated 
              ? `Generated ${lastUpdated.toLocaleDateString()} at ${lastUpdated.toLocaleTimeString()}` 
              : loading 
                ? 'Generating...' 
                : 'Ready to generate'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {brief && (
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-white dark:bg-[#303134] border border-[#dadce0] dark:border-[#3c4043] rounded-lg text-sm font-black uppercase tracking-widest text-[#3c4043] dark:text-[#e8eaed] hover:bg-[#f8f9fa] dark:hover:bg-[#3c4043] transition-all flex items-center disabled:opacity-50 shadow-sm active:scale-95"
            >
              <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Regenerate
            </button>
          )}
          <button
            onClick={handleExport}
            disabled={!brief || loading}
            className="px-4 py-2 bg-[#1a73e8] text-white rounded-lg text-sm font-black uppercase tracking-widest hover:bg-[#1557b0] transition-all flex items-center disabled:opacity-50 shadow-sm active:scale-95"
          >
            <Download size={16} className="mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-[#202124] rounded-[24px] border border-[#dadce0] dark:border-[#3c4043] shadow-sm overflow-hidden min-h-[600px] relative">
        {!loading && !brief && !error ? (
          <div className="flex flex-col items-center justify-center h-full p-12 text-center min-h-[600px]">
             <div className="bg-[#e8f0fe] dark:bg-[#8ab4f8]/20 p-8 rounded-2xl mb-8 ring-1 ring-[#d2e3fc] dark:ring-[#8ab4f8]/30">
               <Sparkles size={64} className="text-[#1a73e8] dark:text-[#8ab4f8]" />
             </div>
             <h2 className="text-3xl font-bold text-[#202124] dark:text-[#e8eaed] mb-4 tracking-tight">
               Generate Your Weekly Brief
             </h2>
             <p className="text-[#5f6368] dark:text-[#9aa0a6] max-w-lg mb-10 text-lg leading-relaxed">
               Get a comprehensive AI-generated summary of the most important Google Cloud updates, security bulletins, and architectural changes from the last 7 days.
             </p>
             <button
               onClick={() => generateBrief(true)}
               className="px-8 py-4 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl font-black uppercase tracking-widest text-lg shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center active:scale-95"
             >
               <Sparkles size={24} className="mr-3" />
               Generate Brief
             </button>
          </div>
        ) : loading && !brief ? (
          <div className="absolute inset-0 z-10 bg-white/90 dark:bg-[#202124]/90 backdrop-blur-sm flex items-center justify-center">
            <AILoading 
              variant="card" 
              title="Generating Weekly Brief" 
              subtitle="Analyzing the latest updates, security bulletins, and architecture changes from the last 7 days..." 
              icon={Sparkles}
            />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full p-12 text-center">
            <div className="bg-[#fce8e6] dark:bg-[#ea4335]/20 p-4 rounded-xl mb-4">
              <FileText size={32} className="text-[#ea4335] dark:text-[#f28b82]" />
            </div>
            <h3 className="text-xl font-bold text-[#202124] dark:text-[#e8eaed] mb-2">Failed to Generate Brief</h3>
            <p className="text-[#5f6368] dark:text-[#9aa0a6] mb-6">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-6 py-2 bg-[#1a73e8] text-white rounded-lg font-black uppercase tracking-widest hover:bg-[#1557b0] transition-all active:scale-95 shadow-sm"
            >
              Try Again
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="p-8 md:p-12 max-w-4xl mx-auto"
          >
            <article className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown components={MarkdownComponents}>
                {brief || ''}
              </ReactMarkdown>
            </article>
          </motion.div>
        )}
      </div>
    </div>
  );
};
