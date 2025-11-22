import React, { useMemo } from 'react';
import { TimeLog, Category, Language } from '../types';
import { aggregateDataByCategory, t } from '../utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface StatisticsProps {
  logs: TimeLog[];
  categories: Category[];
  lang: Language;
}

export const Statistics: React.FC<StatisticsProps> = ({ logs, categories, lang }) => {
  
  const data = useMemo(() => aggregateDataByCategory(logs, categories), [logs, categories]);
  
  const dailyData = useMemo(() => {
    const days: Record<string, number> = {};
    const last7Days = Array.from({length: 7}, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString();
    }).reverse();

    logs.forEach(log => {
        if(!log.endTime) return;
        const dateKey = new Date(log.startTime).toLocaleDateString();
        const hours = (log.endTime - log.startTime) / (1000 * 60 * 60);
        if (days[dateKey]) days[dateKey] += hours;
        else days[dateKey] = hours;
    });

    return last7Days.map(date => ({
        name: date.split('/')[1] + '/' + date.split('/')[0], // Simple MM/DD
        hours: parseFloat((days[date] || 0).toFixed(1))
    }));
  }, [logs]);

  const totalHours = data.reduce((acc, curr) => acc + curr.value, 0).toFixed(1);

  if (logs.length === 0) {
    return <div className="text-center py-12 text-slate-400">{t(lang, 'noData')}</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Key Metric */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t(lang, 'totalTracked')}</h3>
                <p className="text-3xl font-bold text-slate-900 mt-1">{totalHours}<span className="text-sm text-slate-400 font-normal ml-1">h</span></p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">{t(lang, 'topFocus')}</h3>
                <p className="text-xl font-bold text-slate-900 mt-2 truncate">
                    {data[0]?.name || '-'}
                </p>
            </div>
        </div>

        {/* Distribution Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">{t(lang, 'distribution')}</h3>
            <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                    formatter={(value: number) => [`${value} hrs`, 'Time']}
                />
                </PieChart>
            </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
                {data.map((entry) => (
                    <div key={entry.name} className="flex items-center text-xs text-slate-600">
                        <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }}></div>
                        <span className="flex-1 truncate">{entry.name}</span>
                        <span className="font-mono font-medium">{entry.value}h</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Daily Trend */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">{t(lang, 'dailyTrend')}</h3>
            <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyData}>
                        <XAxis dataKey="name" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                        <YAxis hide />
                        <Tooltip 
                            cursor={{fill: '#f1f5f9'}}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="hours" fill="#1e293b" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </div>
  );
};