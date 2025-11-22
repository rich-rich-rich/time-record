import React, { useState, useEffect } from 'react';
import { Timer } from './components/Timer';
import { Statistics } from './components/Statistics';
import { AIReport } from './components/AIReport';
import { Timeline } from './components/Timeline';
import { VisualTimeline } from './components/VisualTimeline';
import { LogModal } from './components/LogModal';
import { Category, TimeLog, ViewMode, DEFAULT_CATEGORIES, Language } from './types';
import { t } from './utils';
import { LayoutDashboard, Clock, Sparkles, Plus, CalendarDays, Globe } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [logs, setLogs] = useState<TimeLog[]>(() => {
    const saved = localStorage.getItem('chronos_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories] = useState<Category[]>(DEFAULT_CATEGORIES);
  
  const [activeLogId, setActiveLogId] = useState<string | null>(() => {
      return localStorage.getItem('chronos_active_log_id');
  });

  const [view, setView] = useState<ViewMode>('track');
  const [lang, setLang] = useState<Language>('zh'); // Default to Chinese as requested by user context implies CN user
  const [showManualEntry, setShowManualEntry] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<TimeLog | null>(null);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('chronos_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
      if (activeLogId) {
          localStorage.setItem('chronos_active_log_id', activeLogId);
      } else {
          localStorage.removeItem('chronos_active_log_id');
      }
  }, [activeLogId]);

  // --- Logic ---
  const activeLog = logs.find(l => l.id === activeLogId) || null;

  const startTimer = (categoryId: string) => {
    if (activeLog) stopTimer();

    const newLog: TimeLog = {
      id: crypto.randomUUID(),
      categoryId,
      startTime: Date.now(),
      endTime: null,
    };

    setLogs(prev => [newLog, ...prev]);
    setActiveLogId(newLog.id);
  };

  const stopTimer = () => {
    if (!activeLogId) return;

    setLogs(prev => prev.map(log => {
      if (log.id === activeLogId) {
        return { ...log, endTime: Date.now() };
      }
      return log;
    }));
    setActiveLogId(null);
  };

  const deleteLog = (id: string) => {
      if (id === activeLogId) setActiveLogId(null);
      setLogs(prev => prev.filter(l => l.id !== id));
  };

  const addLog = (log: TimeLog) => {
      setLogs(prev => [log, ...prev]);
  };

  const updateLog = (updatedLog: TimeLog) => {
      setLogs(prev => prev.map(l => l.id === updatedLog.id ? updatedLog : l));
  };

  const addManualLog = (categoryId: string, durationMinutes: number) => {
      const endTime = Date.now();
      const startTime = endTime - (durationMinutes * 60 * 1000);
      const newLog: TimeLog = {
          id: crypto.randomUUID(),
          categoryId,
          startTime,
          endTime,
          note: t(lang, 'manualEntry')
      };
      setLogs(prev => [newLog, ...prev]);
      setShowManualEntry(false);
  };

  const handleEditClick = (log: TimeLog) => {
    setEditingLog(log);
    setIsModalOpen(true);
  };

  const handleCreateClick = (presetLog?: TimeLog) => {
    setEditingLog(presetLog || null);
    setIsModalOpen(true);
  };

  const toggleLang = () => {
      setLang(prev => prev === 'en' ? 'zh' : 'en');
  }

  // --- Render Helpers ---
  const renderContent = () => {
    switch (view) {
      case 'track':
        return (
          <>
            <Timer 
              activeLog={activeLog} 
              categories={categories} 
              onStart={startTimer} 
              onStop={stopTimer}
              lang={lang}
            />
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">{t(lang, 'history')}</h2>
                <button 
                    onClick={() => setShowManualEntry(!showManualEntry)}
                    className="text-xs font-medium text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full hover:bg-slate-50 flex items-center gap-1"
                >
                    <Plus size={14}/> {t(lang, 'logPast')}
                </button>
            </div>
            
            {showManualEntry && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-lg animate-in slide-in-from-top-2">
                    <h3 className="text-sm font-bold mb-3">{t(lang, 'quickLog')}</h3>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                        {[15, 30, 60].map(mins => (
                            <button 
                                key={mins}
                                onClick={() => addManualLog(categories[0].id, mins)}
                                className="py-2 px-4 bg-slate-50 rounded-lg text-sm hover:bg-slate-100 border border-slate-100"
                            >
                                {mins}m
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-slate-400 text-center">{t(lang, 'quickLogDesc')}</p>
                </div>
            )}

            <Timeline logs={logs} categories={categories} onDelete={deleteLog} lang={lang} />
          </>
        );
      case 'calendar':
        return (
          <VisualTimeline 
            logs={logs} 
            categories={categories} 
            lang={lang} 
            onUpdateLog={updateLog}
            onDeleteLog={deleteLog}
            onAddLog={(l) => handleCreateClick(l)}
            onEditClick={handleEditClick}
          />
        );
      case 'stats':
        return <Statistics logs={logs} categories={categories} lang={lang} />;
      case 'ai-report':
        return <AIReport logs={logs} categories={categories} lang={lang} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 max-w-lg mx-auto relative shadow-2xl shadow-slate-200">
      {/* Header */}
      <header className="pt-8 pb-4 px-6 bg-white border-b border-slate-100 sticky top-0 z-20 flex items-center justify-between">
        <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">CHRONOS.</h1>
            <p className="text-xs text-slate-400 font-medium">Lyubishchev Tracker</p>
        </div>
        <div className="flex gap-3">
             <button onClick={toggleLang} className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-50 px-2 py-1 rounded-md">
                <Globe size={14} />
                {lang.toUpperCase()}
             </button>
             <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                {new Date().getDate()}
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {renderContent()}
      </main>

      {/* Modal */}
      <LogModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(log) => {
            if (editingLog && editingLog.id === log.id) updateLog(log);
            else addLog(log);
        }}
        onDelete={deleteLog}
        initialLog={editingLog}
        categories={categories}
        lang={lang}
      />

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-lg bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-around py-3 z-30 pb-6 safe-area-bottom">
        <button 
          onClick={() => setView('track')}
          className={`flex flex-col items-center gap-1 transition-colors p-2 ${view === 'track' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Clock size={20} strokeWidth={view === 'track' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">{t(lang, 'track')}</span>
        </button>
        
        <button 
          onClick={() => setView('calendar')}
          className={`flex flex-col items-center gap-1 transition-colors p-2 ${view === 'calendar' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <CalendarDays size={20} strokeWidth={view === 'calendar' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">{t(lang, 'calendar')}</span>
        </button>

        <button 
          onClick={() => setView('stats')}
          className={`flex flex-col items-center gap-1 transition-colors p-2 ${view === 'stats' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <LayoutDashboard size={20} strokeWidth={view === 'stats' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">{t(lang, 'stats')}</span>
        </button>

        <button 
          onClick={() => setView('ai-report')}
          className={`flex flex-col items-center gap-1 transition-colors p-2 ${view === 'ai-report' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <Sparkles size={20} strokeWidth={view === 'ai-report' ? 2.5 : 2} />
          <span className="text-[10px] font-medium">{t(lang, 'aiReport')}</span>
        </button>
      </nav>
    </div>
  );
};

export default App;