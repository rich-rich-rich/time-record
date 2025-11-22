import React, { useState, useEffect } from 'react';
import { TimeLog, Category, Language } from '../types';
import { t } from '../utils';
import { X, Trash2 } from 'lucide-react';

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (log: TimeLog) => void;
  onDelete: (id: string) => void;
  initialLog: TimeLog | null;
  categories: Category[];
  lang: Language;
}

export const LogModal: React.FC<LogModalProps> = ({ isOpen, onClose, onSave, onDelete, initialLog, categories, lang }) => {
  const [formData, setFormData] = useState<{
    categoryId: string;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    note: string;
    date: string; // YYYY-MM-DD
  }>({
    categoryId: categories[0]?.id || '',
    startTime: '09:00',
    endTime: '09:30',
    note: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (initialLog) {
      const start = new Date(initialLog.startTime);
      const end = initialLog.endTime ? new Date(initialLog.endTime) : new Date();
      
      // Adjust for timezone offset for input values
      const toLocalISO = (d: Date) => {
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString();
      }

      setFormData({
        categoryId: initialLog.categoryId,
        startTime: toLocalISO(start).slice(11, 16),
        endTime: toLocalISO(end).slice(11, 16),
        note: initialLog.note || '',
        date: toLocalISO(start).slice(0, 10)
      });
    }
  }, [initialLog, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Reconstruct timestamps
    const baseDate = new Date(formData.date);
    const [sh, sm] = formData.startTime.split(':').map(Number);
    const [eh, em] = formData.endTime.split(':').map(Number);

    const start = new Date(baseDate);
    start.setHours(sh, sm, 0, 0);
    
    const end = new Date(baseDate);
    end.setHours(eh, em, 0, 0);

    // Handle overnight? (Simple version: if end < start, assume +1 day? Nah, simpler to just force same day for now)
    if (end.getTime() < start.getTime()) {
      end.setDate(end.getDate() + 1);
    }

    onSave({
      id: initialLog?.id || crypto.randomUUID(),
      categoryId: formData.categoryId,
      startTime: start.getTime(),
      endTime: end.getTime(),
      note: formData.note
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">
            {initialLog ? t(lang, 'editLog') : t(lang, 'newLog')}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{t(lang, 'category')}</label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFormData({...formData, categoryId: cat.id})}
                  className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                    formData.categoryId === cat.id 
                    ? 'border-transparent ring-2 ring-offset-1 ring-slate-900 bg-slate-100 text-slate-900' 
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                  style={{ backgroundColor: formData.categoryId === cat.id ? cat.color + '20' : '' }}
                >
                  <div className="flex items-center gap-1 justify-center">
                    <div className="w-2 h-2 rounded-full" style={{backgroundColor: cat.color}}></div>
                    <span className="truncate">{cat.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{t(lang, 'startTime')}</label>
              <input 
                type="time" 
                value={formData.startTime}
                onChange={e => setFormData({...formData, startTime: e.target.value})}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{t(lang, 'endTime')}</label>
              <input 
                type="time" 
                value={formData.endTime}
                onChange={e => setFormData({...formData, endTime: e.target.value})}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">{t(lang, 'note')}</label>
            <input 
              type="text" 
              value={formData.note}
              onChange={e => setFormData({...formData, note: e.target.value})}
              placeholder="What did you do?"
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

        </div>

        <div className="p-4 border-t border-slate-100 flex gap-3">
          {initialLog && (
            <button 
                onClick={() => { onDelete(initialLog.id); onClose(); }}
                className="p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
            >
                <Trash2 size={20} />
            </button>
          )}
          <button 
            onClick={onClose}
            className="flex-1 py-3 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition-colors"
          >
            {t(lang, 'cancel')}
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
          >
            {t(lang, 'save')}
          </button>
        </div>
      </div>
    </div>
  );
};
