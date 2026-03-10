import { useState } from 'react';
import { toast } from 'sonner';
import { FeedItem, AnalysisResult } from '../types';
import { extractGCPProducts } from '../utils';
import { getAiInstance } from '../services/geminiService';

export const useSummarizer = () => {
  const [summarizingId, setSummarizingId] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Record<string, AnalysisResult>>({});
  const [summaryModal, setSummaryModal] = useState<{ 
    isOpen: boolean; 
    title: string; 
    analysis: AnalysisResult | null; 
    streamContent?: string; 
    isStreaming?: boolean 
  } | null>(null);

  const handleSummarize = async (item: FeedItem) => {
    // If we already have an analysis, just open the modal
    if (analyses[item.link]) {
      setSummaryModal({
        isOpen: true,
        title: item.title,
        analysis: analyses[item.link],
        isStreaming: false
      });
      return;
    }

    setSummarizingId(item.link);
    setSummaryModal({
      isOpen: true,
      title: item.title,
      analysis: null,
      streamContent: '',
      isStreaming: true
    });

    toast.info("Analyzing content...", { description: "AI is generating insights for this article." });

    try {
      const contentToSummarize = item.content || item.contentSnippet || item.title;
      const isIncident = item.source === 'Service Health';
      const extractedProducts = extractGCPProducts(item.title + " " + (item.contentSnippet || ""));
      const productsContext = extractedProducts.length > 0 
        ? `The following products were detected in the text: ${extractedProducts.join(', ')}. Please focus on these.` 
        : '';
      
      const prompt = `
        Analyze the following Google Cloud ${isIncident ? 'Service Health incident' : 'blog post/update'}.
        ${productsContext}
        
        Provide a structured summary in Markdown format.
        
        Use rich formatting to make it engaging and easy to read:
        - Use **bold** for key terms and metrics.
        - Use > Blockquotes for important warnings, critical impacts, or "Why this matters".
        - Use \`code\` for product names or technical terms.
        - Use bullet points for lists.
        
        Include the following sections:
        ## 🚀 Executive Summary
        (A high-level, punchy overview. Start with a bold sentence that summarizes the entire update.)
        
        ## 📈 Business & Technical Impact
        (Detail the business value or technical impact. Use a blockquote for the primary impact statement.)
        
        ## ⚠️ Risks & Considerations
        (If relevant, detail any security, operational, or cost risks. If not relevant, state "None identified.")
        
        ## 👥 Role-Based Insights
        Provide specific, actionable takeaways for:
        - **SRE / DevOps**: Operational impact, reliability, monitoring, actions needed.
        - **Developer**: API changes, new features, code required, migration steps.
        - **Architect**: Design patterns, integration strategies, trade-offs, scalability.
        - **CxO / Leadership**: Business value, cost implications, strategic alignment.
        
        ## 🔑 Key Takeaways
        (Bulleted list of 3-5 high-impact points.)
        
        ## 🛠️ Related Products
        (List of specific Google Cloud products mentioned. Do not include generic terms.)

        ---
        
        Finally, append a JSON block at the very end of the response (after the markdown) with the following structure for visualization data:
        \`\`\`json
        {
          "riskAnalysis": [
            { "subject": "Technical", "A": 0-100, "fullMark": 100 },
            { "subject": "Business", "A": 0-100, "fullMark": 100 },
            { "subject": "Security", "A": 0-100, "fullMark": 100 },
            { "subject": "Operational", "A": 0-100, "fullMark": 100 }
          ],
          "actionPriority": 0-100,
          "complexity": 0-100
        }
        \`\`\`

        Title: ${item.title}
        Content: ${contentToSummarize.slice(0, 8000)}
      `;

      const ai = getAiInstance();
      const result = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const reader = result;
      let fullText = '';

      for await (const chunk of reader) {
        const text = chunk.text;
        if (text) {
          fullText += text;
          
          // Only show the markdown part in the stream (hide the JSON block if it starts appearing)
          const cleanText = fullText.split('```json')[0];
          setSummaryModal(prev => prev ? { ...prev, streamContent: cleanText } : null);
        }
      }

      // Parse the final result to extract JSON
      const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/);
      let chartData = undefined;
      if (jsonMatch) {
        try {
          chartData = JSON.parse(jsonMatch[1]);
        } catch (e) {
          console.error("Failed to parse chart data JSON", e);
        }
      }

      // Parse markdown sections
      const summaryMatch = fullText.match(/##\s*.*?Executive Summary\n([\s\S]*?)(?=\n##|$)/);
      const impactMatch = fullText.match(/##\s*.*?Impact\n([\s\S]*?)(?=\n##|$)/);
      const audienceMatch = fullText.match(/##\s*.*?Role-Based Insights\n([\s\S]*?)(?=\n##|$)/);
      const productsMatch = fullText.match(/##\s*.*?Related Products\n([\s\S]*?)(?=\n##|---|$)/);

      const analysis: AnalysisResult = {
        summary: summaryMatch ? summaryMatch[1].trim() : "Summary not available.",
        impact: impactMatch ? impactMatch[1].trim() : "Impact analysis not available.",
        targetAudience: audienceMatch ? audienceMatch[1].trim() : "General Audience",
        relatedProducts: productsMatch 
          ? productsMatch[1].split('\n').map(s => s.replace(/^-\s*/, '').trim()).filter(Boolean) 
          : [],
        chartData: chartData
      };

      setAnalyses(prev => ({ ...prev, [item.link]: analysis }));
      
      setSummaryModal(prev => prev ? { 
        ...prev, 
        isStreaming: false,
        analysis: analysis,
        streamContent: undefined 
      } : null);
      
      toast.success("Analysis complete!", { description: "Insights are ready to view." });
    } catch (e: any) {
      console.error("Summarization failed:", e);
      
      if (e.message?.includes('429') || e.message?.includes('RESOURCE_EXHAUSTED')) {
        toast.error("Daily AI quota exceeded", { description: "Please try again later when your quota resets." });
      } else {
        toast.error("Failed to analyze article", { description: "An unexpected error occurred during analysis." });
      }
      
      setSummaryModal(null);
    } finally {
      setSummarizingId(null);
    }
  };

  const closeSummaryModal = () => setSummaryModal(null);

  return {
    summarizingId,
    analyses,
    summaryModal,
    handleSummarize,
    closeSummaryModal
  };
};
