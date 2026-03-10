import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Target, Zap, Box, ExternalLink, Loader2, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { InsightCharts } from './InsightCharts';
import { AnalysisResult } from '../types';
import { AILoading } from './ui/AILoading';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  analysis: AnalysisResult | null;
  streamContent?: string;
  isStreaming?: boolean;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({ isOpen, onClose, title, analysis, streamContent, isStreaming }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#202124] rounded-[24px] shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[85vh] border border-[#dadce0] dark:border-[#3c4043]"
            >
              {/* Header */}
              <div className="bg-white dark:bg-[#202124] p-6 border-b border-[#dadce0] dark:border-[#3c4043] flex justify-between items-start shrink-0 sticky top-0 z-10">
                <div className="flex items-start space-x-4 pr-8">
                  <div className="p-3 bg-[#e8f0fe] dark:bg-[#8ab4f8]/20 rounded-2xl">
                    <Sparkles className="text-[#1a73e8] dark:text-[#8ab4f8]" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#202124] dark:text-[#e8eaed] leading-tight line-clamp-2">{title}</h2>
                    <p className="text-sm text-[#5f6368] dark:text-[#9aa0a6] mt-1 flex items-center">
                      <FileText size={12} className="mr-1.5" /> AI-Generated Analysis
                    </p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="text-[#5f6368] hover:text-[#202124] dark:text-[#9aa0a6] dark:hover:text-[#e8eaed] transition-colors p-2 hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] rounded-full"
                >
                  <X size={24} />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-8 overflow-y-auto custom-scrollbar bg-[#f8f9fa] dark:bg-[#303134]">
                {streamContent ? (
                   <div className="prose prose-lg prose-blue dark:prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          h2: ({node, ...props}) => <h2 className="text-xl font-bold text-[#1a73e8] dark:text-[#8ab4f8] mt-8 mb-4 flex items-center border-b border-[#d2e3fc] dark:border-[#8ab4f8]/30 pb-2 tracking-tight" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-[#202124] dark:text-[#e8eaed] mt-6 mb-3 tracking-tight" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-none space-y-3 pl-0 my-5" {...props} />,
                          li: ({node, ...props}) => (
                            <li className="flex items-start text-[#5f6368] dark:text-[#9aa0a6] text-[15px] leading-relaxed">
                              <span className="mr-3 mt-2 w-1.5 h-1.5 bg-[#1a73e8] dark:bg-[#8ab4f8] rounded-full shrink-0 shadow-[0_0_4px_rgba(26,115,232,0.4)]" />
                              <span className="flex-1">{props.children}</span>
                            </li>
                          ),
                          blockquote: ({node, ...props}) => (
                            <blockquote className="border-l-4 border-[#1a73e8] bg-[#e8f0fe] dark:bg-[#8ab4f8]/10 pl-5 py-4 pr-5 my-6 rounded-r-[24px] italic text-[#5f6368] dark:text-[#9aa0a6] shadow-sm text-[15px] leading-relaxed" {...props} />
                          ),
                          strong: ({node, ...props}) => <strong className="font-bold text-[#1557b0] dark:text-[#aecbfa]" {...props} />,
                          code: ({node, ...props}) => <code className="bg-[#f1f3f4] dark:bg-[#3c4043] text-[#d93025] dark:text-[#f28b82] px-1.5 py-0.5 rounded-md text-sm font-mono border border-[#dadce0] dark:border-[#5f6368]" {...props} />,
                        }}
                      >
                        {streamContent}
                      </ReactMarkdown>
                      {isStreaming && (
                        <div className="flex items-center mt-8 text-[#1a73e8] dark:text-[#8ab4f8] animate-pulse font-semibold text-sm tracking-wide">
                          <Loader2 size={18} className="animate-spin mr-2.5" />
                          GENERATING INSIGHTS...
                        </div>
                      )}
                   </div>
                ) : analysis ? (
                  <div className="space-y-10">
                    {/* Executive Summary */}
                    <section className="bg-white dark:bg-[#202124] p-8 rounded-[24px] shadow-sm border border-[#dadce0] dark:border-[#3c4043]">
                      <h3 className="text-[11px] font-bold text-[#1a73e8] dark:text-[#8ab4f8] uppercase tracking-widest mb-5 flex items-center">
                        <Sparkles size={14} className="mr-2" /> Executive Summary
                      </h3>
                      <div className="prose prose-blue dark:prose-invert max-w-none">
                        <div className="text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed text-[16px]">
                          <ReactMarkdown
                            components={{
                              strong: ({node, ...props}) => <strong className="font-bold text-[#1557b0] dark:text-[#aecbfa]" {...props} />,
                              code: ({node, ...props}) => <code className="bg-[#f1f3f4] dark:bg-[#3c4043] text-[#d93025] dark:text-[#f28b82] px-1.5 py-0.5 rounded-md text-sm font-mono" {...props} />,
                            }}
                          >
                            {analysis.summary}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Impact Analysis */}
                      <section className="bg-[#fef7e0] dark:bg-[#f9ab00]/10 p-8 rounded-[24px] border border-[#fce8b2] dark:border-[#f9ab00]/30 shadow-sm">
                        <h3 className="text-[11px] font-bold text-[#e37400] dark:text-[#fdd663] uppercase tracking-widest mb-5 flex items-center">
                          <Zap size={14} className="mr-2" /> Business Impact
                        </h3>
                        <div className="text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed text-[15px]">
                          <ReactMarkdown
                            components={{
                              blockquote: ({node, ...props}) => (
                                <blockquote className="border-l-4 border-[#f9ab00] pl-4 italic my-3 text-[#b06000] dark:text-[#fde293]" {...props} />
                              ),
                            }}
                          >
                            {analysis.impact}
                          </ReactMarkdown>
                        </div>
                      </section>

                      {/* Role-Based Insights */}
                      <section className="bg-[#e8f0fe] dark:bg-[#8ab4f8]/10 p-8 rounded-[24px] border border-[#d2e3fc] dark:border-[#8ab4f8]/30 shadow-sm">
                        <h3 className="text-[11px] font-bold text-[#1a73e8] dark:text-[#8ab4f8] uppercase tracking-widest mb-5 flex items-center">
                          <Target size={14} className="mr-2" /> Role-Based Insights
                        </h3>
                        <div className="text-[#5f6368] dark:text-[#9aa0a6] leading-relaxed text-[15px]">
                          <ReactMarkdown
                            components={{
                              strong: ({node, ...props}) => <strong className="font-bold text-[#1557b0] dark:text-[#aecbfa] block mt-4 mb-2 text-[11px] uppercase tracking-widest" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-none space-y-2 pl-0" {...props} />,
                              li: ({node, ...props}) => (
                                <li className="flex items-start text-[14px]">
                                  <span className="mr-2 mt-1.5 w-1 h-1 bg-[#1a73e8] dark:bg-[#8ab4f8] rounded-full shrink-0" />
                                  <span>{props.children}</span>
                                </li>
                              ),
                              p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                              code: ({node, ...props}) => <code className="bg-white dark:bg-[#202124] text-[#d93025] dark:text-[#f28b82] px-1.5 py-0.5 rounded-md text-xs font-mono" {...props} />,
                            }}
                          >
                            {analysis.targetAudience}
                          </ReactMarkdown>
                        </div>
                      </section>
                    </div>

                    {/* Related Products */}
                    {analysis.relatedProducts.length > 0 && (
                      <section>
                        <h3 className="text-[11px] font-bold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-widest mb-5 flex items-center">
                          <Box size={14} className="mr-2" /> Related Products
                        </h3>
                        <div className="flex flex-wrap gap-3">
                          {analysis.relatedProducts.map((prod, idx) => (
                            <a 
                              key={idx} 
                              href={`https://cloud.google.com/search?q=${encodeURIComponent(prod)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-5 py-2.5 bg-white dark:bg-[#202124] text-[#5f6368] dark:text-[#9aa0a6] rounded-full text-[13px] font-semibold border border-[#dadce0] dark:border-[#3c4043] hover:border-[#8ab4f8] dark:hover:border-[#8ab4f8] hover:text-[#1a73e8] dark:hover:text-[#8ab4f8] hover:shadow-md transition-all flex items-center group active:scale-95"
                            >
                              {prod}
                              <ExternalLink size={12} className="ml-2.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#1a73e8] dark:text-[#8ab4f8]" />
                            </a>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Interactive Charts */}
                    {analysis.chartData && (
                      <section>
                         <h3 className="text-[11px] font-bold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-widest mb-3 flex items-center">
                          <Sparkles size={14} className="mr-2" /> AI Insights & Metrics
                        </h3>
                        <InsightCharts data={analysis.chartData} />
                      </section>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-[#5f6368] dark:text-[#9aa0a6]">
                    {isStreaming ? (
                        <AILoading 
                          variant="inline" 
                          title="Initializing AI Analysis..." 
                          subtitle="Connecting to Gemini 2.5 Flash" 
                          icon={Sparkles}
                        />
                    ) : (
                        <div className="text-center">
                            <Sparkles size={64} className="mx-auto mb-6 opacity-10" />
                            <p className="text-lg font-medium opacity-50">Analysis not available.</p>
                        </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="bg-white dark:bg-[#202124] px-8 py-6 border-t border-[#dadce0] dark:border-[#3c4043] flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2 text-[11px] text-[#5f6368] dark:text-[#9aa0a6] font-bold uppercase tracking-widest">
                    <div className="w-2 h-2 rounded-full bg-[#188038] animate-pulse" />
                    Powered by Google Gemini
                </div>
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-[#1a73e8] dark:bg-[#8ab4f8] text-white dark:text-[#202124] rounded-full hover:bg-[#1557b0] dark:hover:bg-[#aecbfa] transition-colors font-bold text-[14px] shadow-sm hover:shadow-lg transform hover:-translate-y-0.5 transition-all active:scale-95"
                >
                  Close Analysis
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
