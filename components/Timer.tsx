import React, { useEffect, useState } from 'react';
import { Category, TimeLog, Language } from '../types';
import { formatDuration, t } from '../utils';
import { Play, Square } from 'lucide-react';

interface TimerProps {
  activeLog: TimeLog | null;
  categories: Category[];
  onStart: (categoryId: string) => void;
  onStop: () => void;
  lang: Language;
}

export const Timer: React.FC<TimerProps> = ({ activeLog, categories, onStart, onStop, lang }) => {
  const [elapsed, setElapsed] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id || '');

  useEffect(() => {
    let interval: number;
    if (activeLog) {
      const update = () => {
        setElapsed(Date.now() - activeLog.startTime);
      };
      update();
      interval = window.setInterval(update, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [activeLog]);

  const activeCategory = activeLog ? categories.find(c => c.id === activeLog.categoryId) : null;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 w-full max-w-md mx-auto mb-6">
      
      {/* Timer Display */}
      <div className="mb-8 text-center">
        <div className={`font-mono text-6xl font-bold tracking-tighter ${activeLog ? 'text-slate-900' : 'text-slate-300'}`}>
          {formatDuration(elapsed)}
        </div>
        <div className="h-6 mt-2 flex items-center justify-center gap-2">
          {activeLog && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-opacity-10 flex items-center gap-1 animate-pulse" 
                  style={{ backgroundColor: activeCategory?.color + '20', color: activeCategory?.color }}>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: activeCategory?.color }}></div>
              {activeCategory?.name || t(lang, 'tracking')}
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      {activeLog ? (
        <button
          onClick={onStop}
          className="group relative w-20 h-20 rounded-full bg-slate-900 hover:bg-red-500 transition-colors duration-300 flex items-center justify-center shadow-lg hover:shadow-red-500/30"
        >
          <Square className="text-white fill-white" size={32} />
          <span className="absolute -bottom-8 text-xs text-slate-400 group-hover:text-red-500 transition-colors">{t(lang, 'stop')}</span>
        </button>
      ) : (
        <div className="w-full space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 border ${
                  selectedCategory === cat.id 
                    ? 'bg-slate-50 border-slate-300 ring-1 ring-slate-300 scale-105' 
                    : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                 <div className="w-3 h-3 rounded-full mb-2" style={{ backgroundColor: cat.color }} />
                 <span className="text-xs font-medium text-slate-600 truncate w-full text-center">{cat.name}</span>
              </button>
            ))}
          </div>
          
          <div className="flex justify-center pt-4">
            <button
              onClick={() => onStart(selectedCategory)}
              className="group relative w-20 h-20 rounded-full bg-slate-900 hover:bg-emerald-500 transition-colors duration-300 flex items-center justify-center shadow-lg hover:shadow-emerald-500/30"
            >
              <Play className="text-white fill-white ml-1" size={32} />
              <span className="absolute -bottom-8 text-xs text-slate-400 group-hover:text-emerald-500 transition-colors">{t(lang, 'start')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};