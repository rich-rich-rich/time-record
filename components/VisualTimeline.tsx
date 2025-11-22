import React, { useRef, useState, useEffect, useMemo } from 'react';
import { TimeLog, Category, Language } from '../types';
import { t, formatTimeShort } from '../utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface VisualTimelineProps {
  logs: TimeLog[];
  categories: Category[];
  lang: Language;
  onUpdateLog: (log: TimeLog) => void;
  onDeleteLog: (id: string) => void;
  onAddLog: (log: TimeLog) => void;
  onEditClick: (log: TimeLog) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const PIXELS_PER_MINUTE = 1.5; // Scale: 90px per hour
const PIXELS_PER_HOUR = PIXELS_PER_MINUTE * 60;

export const VisualTimeline: React.FC<VisualTimelineProps> = ({
  logs,
  categories,
  lang,
  onUpdateLog,
  onEditClick,
  onAddLog
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [now, setNow] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragStartY, setDragStartY] = useState<number>(0);
  const [initialStartTime, setInitialStartTime] = useState<number>(0);

  // Update current time line every minute
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Filter logs for the selected date
  const dayLogs = useMemo(() => {
    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999);

    return logs.filter(log => {
      // Must start or end within this day, or span across it (simplified: just check start time for MVP)
      return log.startTime >= startOfDay.getTime() && log.startTime <= endOfDay.getTime();
    });
  }, [logs, currentDate]);

  const handlePrevDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  };

  const handleNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const isToday = currentDate.toDateString() === now.toDateString();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Interactions
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingId) return; // Ignore clicks if we just finished dragging
    if (e.target !== e.currentTarget) return; // Only click on empty canvas

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top + e.currentTarget.scrollTop;
    const minutesOfDay = Math.floor(y / PIXELS_PER_MINUTE);
    
    // Snap to nearest 15 mins
    const snappedMinutes = Math.round(minutesOfDay / 15) * 15;
    
    const startTime = new Date(currentDate);
    startTime.setHours(0, 0, 0, 0);
    startTime.setMinutes(snappedMinutes);

    const endTime = new Date(startTime.getTime() + 30 * 60000); // Default 30 mins

    onAddLog({
      id: crypto.randomUUID(),
      categoryId: categories[0].id,
      startTime: startTime.getTime(),
      endTime: endTime.getTime(),
      note: ''
    });
  };

  const handleMouseDown = (e: React.MouseEvent, log: TimeLog) => {
    e.stopPropagation();
    setDraggingId(log.id);
    setDragStartY(e.clientY);
    setInitialStartTime(log.startTime);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId) return;
    
    const deltaY = e.clientY - dragStartY;
    const deltaMinutes = deltaY / PIXELS_PER_MINUTE;
    
    // Snap to 5 mins
    const snappedDeltaMinutes = Math.round(deltaMinutes / 5) * 5;
    
    if (snappedDeltaMinutes === 0) return;

    const log = logs.find(l => l.id === draggingId);
    if (!log || !log.endTime) return;

    const originalDuration = log.endTime - log.startTime;
    const newStartTime = initialStartTime + (snappedDeltaMinutes * 60000);
    
    onUpdateLog({
      ...log,
      startTime: newStartTime,
      endTime: newStartTime + originalDuration
    });
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Date Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 z-20">
        <button onClick={handlePrevDay} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <ChevronLeft size={20} className="text-slate-600" />
        </button>
        <div className="text-center">
          <h2 className="text-sm font-bold text-slate-800">
            {currentDate.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </h2>
          {isToday && <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide">{t(lang, 'today')}</span>}
        </div>
        <button onClick={handleNextDay} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <ChevronRight size={20} className="text-slate-600" />
        </button>
      </div>

      {/* Timeline Content */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto relative scroll-smooth"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className="flex relative min-h-full" style={{ height: HOURS.length * PIXELS_PER_HOUR }}>
          
          {/* Left Ruler */}
          <div className="w-14 flex-shrink-0 bg-slate-50 border-r border-slate-200 relative">
            {HOURS.map(hour => (
              <div key={hour} className="absolute w-full text-right pr-2 text-xs text-slate-400 font-mono" style={{ top: hour * PIXELS_PER_HOUR - 6 }}>
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
            {/* Half hour markers */}
            {HOURS.map(hour => (
               <div key={`half-${hour}`} className="absolute w-full text-right pr-2 text-[10px] text-slate-300 font-mono" style={{ top: (hour + 0.5) * PIXELS_PER_HOUR - 5 }}>
                 -
               </div>
            ))}
          </div>

          {/* Right Canvas */}
          <div className="flex-1 relative bg-slate-50/30 cursor-crosshair" onClick={handleCanvasClick}>
            {/* Background Lines */}
            {HOURS.map(hour => (
              <div 
                key={hour} 
                className="absolute w-full border-t border-slate-100" 
                style={{ top: hour * PIXELS_PER_HOUR }} 
              />
            ))}
            
            {/* Current Time Line */}
            {isToday && (
              <div 
                className="absolute w-full border-t-2 border-red-500 z-30 pointer-events-none flex items-center"
                style={{ top: currentMinutes * PIXELS_PER_MINUTE }}
              >
                <div className="w-2 h-2 rounded-full bg-red-500 -ml-1"></div>
              </div>
            )}

            {/* Logs Blocks */}
            {dayLogs.map(log => {
              const category = categories.find(c => c.id === log.categoryId);
              const startDate = new Date(log.startTime);
              // Calculate minutes from start of day (00:00)
              const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
              const durationMinutes = log.endTime 
                ? (log.endTime - log.startTime) / 60000 
                : (isToday ? currentMinutes - startMinutes : 60); // Default open timer visual to current time or 1h if passed

              // Visual styling
              const top = startMinutes * PIXELS_PER_MINUTE;
              const height = Math.max(durationMinutes * PIXELS_PER_MINUTE, 20); // Min height 20px

              return (
                <div
                  key={log.id}
                  onMouseDown={(e) => handleMouseDown(e, log)}
                  onClick={(e) => { e.stopPropagation(); onEditClick(log); }}
                  className={`absolute left-1 right-2 rounded-lg border-l-4 shadow-sm group hover:ring-2 ring-slate-200 hover:z-10 transition-shadow select-none cursor-move overflow-hidden ${draggingId === log.id ? 'opacity-80 scale-[1.01] shadow-lg' : ''}`}
                  style={{
                    top,
                    height,
                    backgroundColor: category ? category.color + '15' : '#fff', // 10% opacity hex
                    borderColor: category?.color || '#ccc',
                  }}
                >
                  <div className="px-2 py-1 text-xs">
                    <div className="font-bold truncate text-slate-700">
                      {category?.name} <span className="font-normal text-slate-500 opacity-75 ml-1">{formatTimeShort(log.startTime)}</span>
                    </div>
                    {height > 35 && log.note && (
                      <div className="text-[10px] text-slate-500 truncate">{log.note}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
