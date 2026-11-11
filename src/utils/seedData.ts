import { Habit, CompletionRecord, UserSettings } from '../types/habit';
import { formatDateToKey, isHabitScheduledForDate } from './dateUtils';

export const DEFAULT_SETTINGS: UserSettings = {
  userName: 'Alex Morgan',
  userBio: 'Focusing on deep work, physical wellness, and continuous learning.',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  theme: 'light',
  weekStartsOn: 1, // Monday
  notificationsEnabled: true,
  soundEffects: true,
};

export function createInitialSeed(): {
  habits: Habit[];
  records: CompletionRecord[];
  settings: UserSettings;
} {
  const today = new Date();
  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(today.getDate() - 90);

  const habits: Habit[] = [
    {
      id: 'habit-1',
      name: 'Morning Mindfulness & Meditation',
      description: '15 minutes of guided breathwork and meditation before screen time.',
      category: 'Spirituality',
      icon: 'lotus',
      color: 'teal',
      frequency: 'daily',
      specificDays: [0, 1, 2, 3, 4, 5, 6],
      targetValue: 15,
      targetUnit: 'mins',
      targetStreak: 30,
      createdAt: formatDateToKey(ninetyDaysAgo),
      isActive: true,
    },
    {
      id: 'habit-2',
      name: 'Strength Training & Cardio',
      description: 'Full-body resistance training or 5k tempo run at the gym.',
      category: 'Health & Fitness',
      icon: 'dumbbell',
      color: 'emerald',
      frequency: 'specific_days',
      specificDays: [1, 3, 5, 6], // Mon, Wed, Fri, Sat
      targetValue: 45,
      targetUnit: 'mins',
      targetStreak: 60,
      createdAt: formatDateToKey(ninetyDaysAgo),
      isActive: true,
    },
    {
      id: 'habit-3',
      name: 'Read Non-Fiction Books',
      description: 'Read high-impact chapters on technology, mental models, or philosophy.',
      category: 'Learning & Education',
      icon: 'book',
      color: 'indigo',
      frequency: 'daily',
      specificDays: [0, 1, 2, 3, 4, 5, 6],
      targetValue: 25,
      targetUnit: 'pages',
      targetStreak: 100,
      createdAt: formatDateToKey(ninetyDaysAgo),
      isActive: true,
    },
    {
      id: 'habit-4',
      name: 'Deep Work Coding Block',
      description: 'Uninterrupted deep flow development with zero notifications.',
      category: 'Productivity',
      icon: 'laptop',
      color: 'blue',
      frequency: 'specific_days',
      specificDays: [1, 2, 3, 4, 5], // Weekdays
      targetValue: 90,
      targetUnit: 'mins',
      targetStreak: 30,
      createdAt: formatDateToKey(ninetyDaysAgo),
      isActive: true,
    },
    {
      id: 'habit-5',
      name: 'Optimal Hydration',
      description: 'Drink at least 8 glasses of pure water throughout the day.',
      category: 'Health & Fitness',
      icon: 'droplet',
      color: 'teal',
      frequency: 'daily',
      specificDays: [0, 1, 2, 3, 4, 5, 6],
      targetValue: 8,
      targetUnit: 'glasses',
      targetStreak: 30,
      createdAt: formatDateToKey(ninetyDaysAgo),
      isActive: true,
    },
    {
      id: 'habit-6',
      name: 'Track Expenses & Budget',
      description: 'Log all personal and business cash flow entries in the ledger.',
      category: 'Finance',
      icon: 'wallet',
      color: 'amber',
      frequency: 'daily',
      specificDays: [0, 1, 2, 3, 4, 5, 6],
      targetValue: 1,
      targetUnit: 'review',
      targetStreak: 14,
      createdAt: formatDateToKey(ninetyDaysAgo),
      isActive: true,
    },
  ];

  const records: CompletionRecord[] = [];
  const cursor = new Date(ninetyDaysAgo);

  while (cursor <= today) {
    const dateKey = formatDateToKey(cursor);
    const dayOfWeek = cursor.getDay();
    const isToday = dateKey === formatDateToKey(today);

    habits.forEach((habit) => {
      if (isHabitScheduledForDate(habit, cursor)) {
        // High completion chance to simulate a committed user with authentic streaks
        const randomFactor = Math.random();
        const weekendPenalty = dayOfWeek === 0 || dayOfWeek === 6 ? 0.08 : 0.0;
        // On today, let some be completed and some pending for interactive exploration
        const completionThreshold = isToday ? 0.45 : 0.22 + weekendPenalty;

        if (randomFactor > completionThreshold) {
          const hour = 7 + Math.floor(Math.random() * 12);
          const minute = Math.floor(Math.random() * 60);
          const completedTimestamp = new Date(
            cursor.getFullYear(),
            cursor.getMonth(),
            cursor.getDate(),
            hour,
            minute
          ).toISOString();

          records.push({
            id: `rec-${habit.id}-${dateKey}`,
            habitId: habit.id,
            date: dateKey,
            completedAt: completedTimestamp,
            value: habit.targetValue,
          });
        }
      }
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  return { habits, records, settings: DEFAULT_SETTINGS };
}
