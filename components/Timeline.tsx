import React from 'react';
import { TimeLog, Category, Language } from '../types';
import { formatTimeShort, formatDuration, t } from '../utils';
import { Trash2 } from 'lucide-react';

interface TimelineProps {
  logs: TimeLog[];
  categories: Category[];
  onDelete: (id: string) => void;
  lang: Language;
}

export const Timeline: React.FC<TimelineProps> = ({ logs, categories, onDelete, lang }) => {
  // Group logs by date
  const groupedLogs = logs.reduce((groups, log) => {
    const date = new Date(log.startTime).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {} as Record<string, TimeLog[]>);

  const sortedDates = Object.keys(groupedLogs).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (logs.length === 0) return null;

  return (
    <div className="space-y-8">
      {sortedDates.map(date => (
        <div key={date}>
          <div className="sticky top-0 bg-[#f8fafc] z-10 py-2 mb-2">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
               {date === new Date().toDateString() ? t(lang, 'today') : date}
             </h3>
          </div>
          
          <div className="space-y-3 pl-2 border-l-2 border-slate-200 ml-2">
            {groupedLogs[date].sort((a,b) => b.startTime - a.startTime).map(log => {
              const category = categories.find(c => c.id === log.categoryId);
              const duration = log.endTime ? log.endTime - log.startTime : Date.now() - log.startTime;
              
              return (
                <div key={log.id} className="relative flex items-center gap-3 group pl-4">
                  {/* Timeline dot */}
                  <div className="absolute -left-[9px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: category?.color }}></div>
                  
                  <div className="flex-1 bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-700">{category?.name}</span>
                        {log.note && <span className="text-xs text-slate-400">- {log.note}</span>}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {formatTimeShort(log.startTime)} - {log.endTime ? formatTimeShort(log.endTime) : 'Now'}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-mono font-medium text-slate-600">
                        {formatDuration(duration)}
                        </span>
                        <button 
                            onClick={() => onDelete(log.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all p-1"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};