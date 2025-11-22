export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string; // Lucide icon name
}

export interface TimeLog {
  id: string;
  categoryId: string;
  startTime: number; // Timestamp
  endTime: number | null; // Null if currently running
  note?: string;
}

export interface DailyStats {
  date: string;
  totalDuration: number;
  categoryBreakdown: Record<string, number>;
}

export type ViewMode = 'track' | 'calendar' | 'stats' | 'ai-report' | 'settings';
export type Language = 'en' | 'zh';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Deep Work', color: '#ef4444', icon: 'Briefcase' }, // Red
  { id: '2', name: 'Learning', color: '#f59e0b', icon: 'BookOpen' }, // Amber
  { id: '3', name: 'Routine', color: '#3b82f6', icon: 'CheckSquare' }, // Blue
  { id: '4', name: 'Health', color: '#10b981', icon: 'Activity' }, // Emerald
  { id: '5', name: 'Leisure', color: '#8b5cf6', icon: 'Coffee' }, // Violet
  { id: '6', name: 'Sleep', color: '#64748b', icon: 'Moon' }, // Slate
];