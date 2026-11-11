import { Habit, CompletionRecord, HabitStreakInfo } from '../types/habit';

export function formatDateToKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

export function formatHumanDate(dateKey: string, options?: Intl.DateTimeFormatOptions): string {
  const date = parseDateKey(dateKey);
  return date.toLocaleDateString('en-US', options || { month: 'short', day: 'numeric', year: 'numeric' });
}

export function isHabitScheduledForDate(habit: Habit, date: Date): boolean {
  const dateKey = formatDateToKey(date);
  // Do not schedule prior to habit creation date
  if (dateKey < habit.createdAt) return false;

  if (habit.frequency === 'daily') return true;

  if (habit.frequency === 'specific_days') {
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    return habit.specificDays.includes(dayOfWeek);
  }

  return true;
}

export function getHabitsScheduledForDate(habits: Habit[], date: Date): Habit[] {
  return habits.filter((h) => h.isActive && isHabitScheduledForDate(h, date));
}

export function calculateHabitStreak(
  habit: Habit,
  records: CompletionRecord[],
  referenceDate: Date = new Date()
): HabitStreakInfo {
  const habitRecords = new Set(
    records.filter((r) => r.habitId === habit.id).map((r) => r.date)
  );

  const totalCompletions = habitRecords.size;

  // Find most recent completed date
  let lastCompletedDate: string | null = null;
  const sortedDates = Array.from(habitRecords).sort().reverse();
  if (sortedDates.length > 0) {
    lastCompletedDate = sortedDates[0];
  }

  const todayKey = formatDateToKey(referenceDate);
  const isScheduledToday = isHabitScheduledForDate(habit, referenceDate);
  const isCompletedToday = habitRecords.has(todayKey);

  // Check from today or yesterday
  let cursor = new Date(referenceDate);
  if (isScheduledToday && !isCompletedToday) {
    // Today is scheduled but not yet completed. The streak is not broken yet;
    // start checking from yesterday.
    cursor.setDate(cursor.getDate() - 1);
  }

  const createdDate = parseDateKey(habit.createdAt);
  let currentStreak = 0;

  // Walk backwards
  while (cursor >= createdDate) {
    if (isHabitScheduledForDate(habit, cursor)) {
      const key = formatDateToKey(cursor);
      if (habitRecords.has(key)) {
        currentStreak++;
      } else {
        // Streak broken
        break;
      }
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  // Calculate best all-time streak by walking forward from createdAt to referenceDate
  let bestStreak = 0;
  let tempStreak = 0;
  const forwardCursor = new Date(createdDate);

  while (forwardCursor <= referenceDate) {
    if (isHabitScheduledForDate(habit, forwardCursor)) {
      const key = formatDateToKey(forwardCursor);
      if (habitRecords.has(key)) {
        tempStreak++;
        if (tempStreak > bestStreak) {
          bestStreak = tempStreak;
        }
      } else {
        // Missed scheduled day
        tempStreak = 0;
      }
    }
    forwardCursor.setDate(forwardCursor.getDate() + 1);
  }

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
    lastCompletedDate,
    totalCompletions,
  };
}

export function getOverallStreak(
  habits: Habit[],
  records: CompletionRecord[],
  referenceDate: Date = new Date()
): { current: number; best: number } {
  const activeHabits = habits.filter((h) => h.isActive);
  if (activeHabits.length === 0) return { current: 0, best: 0 };

  const streaks = activeHabits.map((h) => calculateHabitStreak(h, records, referenceDate));
  const current = Math.max(...streaks.map((s) => s.currentStreak), 0);
  const best = Math.max(...streaks.map((s) => s.bestStreak), 0);
  return { current, best };
}

export function getWeekDays(baseDate: Date, weekStartsOn: 0 | 1 = 1): Date[] {
  const dayOfWeek = baseDate.getDay();
  // Calculate difference to the week start
  const diff = (dayOfWeek < weekStartsOn ? 7 : 0) + dayOfWeek - weekStartsOn;
  const startOfWeek = new Date(baseDate);
  startOfWeek.setDate(baseDate.getDate() - diff);
  startOfWeek.setHours(12, 0, 0, 0);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    days.push(d);
  }
  return days;
}

export function isSameDay(d1: Date, d2: Date): boolean {
  return formatDateToKey(d1) === formatDateToKey(d2);
}
