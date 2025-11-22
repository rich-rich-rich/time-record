import { TimeLog, Category, Language } from './types';

export const formatDuration = (ms: number): string => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)));

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export const formatTimeShort = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
};

export const aggregateDataByCategory = (logs: TimeLog[], categories: Category[]) => {
  const map = new Map<string, number>();

  logs.forEach(log => {
    if (!log.endTime) return;
    const duration = log.endTime - log.startTime;
    const catId = log.categoryId;
    map.set(catId, (map.get(catId) || 0) + duration);
  });

  return Array.from(map.entries()).map(([catId, duration]) => {
    const category = categories.find(c => c.id === catId);
    return {
      name: category ? category.name : 'Unknown',
      value: parseFloat((duration / (1000 * 60 * 60)).toFixed(2)), // Hours
      color: category ? category.color : '#ccc',
      rawDuration: duration
    };
  }).filter(item => item.value > 0).sort((a, b) => b.value - a.value);
};

export const getWeekLogs = (logs: TimeLog[]): TimeLog[] => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return logs.filter(log => log.startTime >= sevenDaysAgo.getTime());
};

export const translations = {
  en: {
    track: 'Track',
    calendar: 'Timeline',
    stats: 'Stats',
    aiReport: 'AI Insight',
    start: 'Start',
    stop: 'Stop',
    tracking: 'Tracking',
    totalTracked: 'Total Tracked',
    topFocus: 'Top Focus',
    distribution: 'Distribution',
    dailyTrend: 'Daily Trend (Last 7 Days)',
    weeklyInsight: 'Weekly Insight',
    insightDesc: 'Get a sarcastic yet helpful analysis of your time usage.',
    generate: 'Generate Report',
    crunching: 'Crunching the numbers...',
    regenerate: 'Regenerate',
    history: 'History',
    logPast: 'Log Past',
    today: 'Today',
    manualEntry: 'Manual Entry',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    editLog: 'Edit Log',
    newLog: 'New Log',
    category: 'Category',
    startTime: 'Start Time',
    endTime: 'End Time',
    duration: 'Duration',
    note: 'Note (Optional)',
    quickLog: 'Quick Log (Past)',
    quickLogDesc: 'Logs ending now.',
    noData: 'No data recorded yet. Start a timer!',
  },
  zh: {
    track: '记录',
    calendar: '时间轴',
    stats: '统计',
    aiReport: 'AI周报',
    start: '开始',
    stop: '结束',
    tracking: '进行中',
    totalTracked: '总时长',
    topFocus: '最专注',
    distribution: '时间分布',
    dailyTrend: '每日趋势 (最近7天)',
    weeklyInsight: '本周点评',
    insightDesc: '生成一份关于你时间利用情况的毒舌点评。',
    generate: '生成报告',
    crunching: 'AI 正在分析...',
    regenerate: '重新生成',
    history: '历史记录',
    logPast: '补录',
    today: '今天',
    manualEntry: '手动录入',
    save: '保存',
    cancel: '取消',
    delete: '删除',
    editLog: '编辑记录',
    newLog: '新建记录',
    category: '分类',
    startTime: '开始时间',
    endTime: '结束时间',
    duration: '时长',
    note: '备注 (可选)',
    quickLog: '快速补录',
    quickLogDesc: '记录刚刚结束的活动。',
    noData: '暂无数据，快去开始计时吧！',
  }
};

export const t = (lang: Language, key: keyof typeof translations.en): string => {
  return translations[lang][key] || translations['en'][key];
};
