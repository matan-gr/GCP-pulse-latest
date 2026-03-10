import React from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';
import { FeedItem } from '../../types';

interface ActivityChartProps {
  items: FeedItem[];
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ items }) => {
  // Aggregate data by date (last 14 days)
  const data = React.useMemo(() => {
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const counts = last14Days.map(date => {
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: items.filter(item => item.isoDate.startsWith(date)).length
      };
    });

    return counts;
  }, [items]);

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
              backdropFilter: 'blur(8px)',
              borderRadius: '12px', 
              border: '1px solid rgba(228, 228, 231, 0.5)', 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              padding: '8px 12px'
            }}
            itemStyle={{ color: '#18181b', fontSize: '11px', fontWeight: '700' }}
            labelStyle={{ color: '#71717a', fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey="count" 
            stroke="#4f46e5" 
            strokeWidth={2.5}
            fillOpacity={1} 
            fill="url(#colorCount)" 
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
