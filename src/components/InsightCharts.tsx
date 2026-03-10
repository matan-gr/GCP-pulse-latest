import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { motion } from 'motion/react';
import { ChartData } from '../types';

interface InsightChartsProps {
  data: ChartData;
}

export const InsightCharts: React.FC<InsightChartsProps> = ({ data }) => {
  const priorityColor = data.actionPriority > 75 ? '#ea4335' : data.actionPriority > 40 ? '#fbbc04' : '#1a73e8';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Risk Radar Chart */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-[#202124] p-4 rounded-[24px] border border-[#dadce0] dark:border-[#3c4043] shadow-sm"
      >
        <h3 className="text-[11px] font-bold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-widest mb-4 text-center">Risk Assessment</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.riskAnalysis}>
              <PolarGrid stroke="#e8eaed" className="dark:stroke-[#3c4043]" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#5f6368', fontSize: 10 }} className="dark:fill-[#9aa0a6]" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Risk Score"
                dataKey="A"
                stroke="#1a73e8"
                strokeWidth={2}
                fill="#1a73e8"
                fillOpacity={0.2}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', 
                  backgroundColor: 'rgba(255, 255, 255, 0.98)',
                  padding: '12px 16px'
                }}
                itemStyle={{ color: '#1a73e8', fontWeight: '700', fontSize: '12px' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Action Priority Gauge (Simulated with Bar) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-[#202124] p-6 rounded-[24px] border border-[#dadce0] dark:border-[#3c4043] shadow-sm flex flex-col items-center justify-center"
      >
        <h3 className="text-[11px] font-bold text-[#5f6368] dark:text-[#9aa0a6] uppercase tracking-widest mb-8 text-center">Action Priority Score</h3>
        
        <div className="relative w-52 h-52 flex items-center justify-center">
            {/* Circular Progress Background */}
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="104"
                    cy="104"
                    r="94"
                    stroke="currentColor"
                    strokeWidth="14"
                    fill="transparent"
                    className="text-[#f1f3f4] dark:text-[#3c4043]"
                />
                <motion.circle
                    initial={{ strokeDashoffset: 590 }}
                    animate={{ strokeDashoffset: 590 - (590 * data.actionPriority) / 100 }}
                    transition={{ duration: 2, ease: "circOut" }}
                    cx="104"
                    cy="104"
                    r="94"
                    stroke={priorityColor}
                    strokeWidth="14"
                    fill="transparent"
                    strokeDasharray="590"
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_8px_rgba(0,0,0,0.1)]"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="flex flex-col items-center"
                >
                    <span className="text-5xl font-black text-[#202124] dark:text-[#e8eaed] tracking-tighter">
                        {data.actionPriority}
                    </span>
                    <span className={`text-[11px] font-black uppercase mt-2 tracking-widest px-3 py-1 rounded-lg border ${
                        data.actionPriority > 75 ? 'bg-[#fce8e6] text-[#c5221f] border-[#f9d2ce]' : 
                        data.actionPriority > 40 ? 'bg-[#fef7e0] text-[#b06000] border-[#feefc3]' : 
                        'bg-[#e8f0fe] text-[#1a73e8] border-[#d2e3fc]'
                    }`}>
                        {data.actionPriority > 75 ? 'Critical' : data.actionPriority > 40 ? 'Moderate' : 'Low'}
                    </span>
                </motion.div>
            </div>
        </div>
        
        <p className="text-center text-[12px] text-[#5f6368] dark:text-[#9aa0a6] mt-8 max-w-[220px] leading-relaxed font-medium opacity-80">
          AI-calculated urgency based on business impact and technical complexity.
        </p>
      </motion.div>
    </div>
  );
};
