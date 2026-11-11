export type HabitCategory =
  | 'Health & Fitness'
  | 'Learning & Education'
  | 'Productivity'
  | 'Personal Development'
  | 'Spirituality'
  | 'Finance'
  | 'Lifestyle'
  | 'Others';

export type FrequencyType = 'daily' | 'specific_days';

export interface Habit {
  id: string;
  name: string;
  description: string;
  category: HabitCategory;
  icon: string;
  color: 'emerald' | 'blue' | 'indigo' | 'amber' | 'rose' | 'teal' | 'purple';
  frequency: FrequencyType;
  specificDays: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  targetValue: number;
  targetUnit: string;
  targetStreak: number;
  createdAt: string; // YYYY-MM-DD
  isActive: boolean;
}

export interface CompletionRecord {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completedAt: string; // ISO timestamp
  value?: number;
}

export interface UserSettings {
  userName: string;
  userBio: string;
  avatarUrl: string;
  theme: 'light' | 'dark';
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
  notificationsEnabled: boolean;
  soundEffects: boolean;
}

export interface HabitStreakInfo {
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
  totalCompletions: number;
}

export interface DayHabitStatus {
  habit: Habit;
  isScheduled: boolean;
  isCompleted: boolean;
  record?: CompletionRecord;
}
