import React, { useState } from 'react';
import { TimeLog, Category, Language } from '../types';
import { generateProductivityReport } from '../services/geminiService';
import { t } from '../utils';
import { Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIReportProps {
  logs: TimeLog[];
  categories: Category[];
  lang: Language;
}

export const AIReport: React.FC<AIReportProps> = ({ logs, categories, lang }) => {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const result = await generateProductivityReport(logs, categories);
    setReport(result);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
        <div className="flex items-start justify-between">
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                {t(lang, 'weeklyInsight')}
                </h2>
                <p className="text-indigo-100 text-sm mt-1 opacity-90">
                {t(lang, 'insightDesc')}
                </p>
            </div>
        </div>
        
        {!report && !loading && (
            <button
            onClick={handleGenerate}
            className="mt-6 w-full py-3 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 shadow-md"
            >
            <Sparkles size={18} />
            {t(lang, 'generate')}
            </button>
        )}

        {loading && (
             <div className="mt-6 py-8 flex flex-col items-center justify-center text-indigo-100">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <span className="text-sm font-medium">{t(lang, 'crunching')}</span>
             </div>
        )}
      </div>

      {report && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 prose prose-slate max-w-none animate-in fade-in slide-in-from-bottom-4 duration-700">
          <ReactMarkdown>{report}</ReactMarkdown>
          <button 
            onClick={handleGenerate}
            className="mt-6 text-xs text-slate-400 underline hover:text-slate-600"
          >
            {t(lang, 'regenerate')}
          </button>
        </div>
      )}
    </div>
  );
};