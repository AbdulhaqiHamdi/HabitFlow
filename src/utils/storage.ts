import { Habit, CompletionRecord, UserSettings } from '../types/habit';
import { createInitialSeed, DEFAULT_SETTINGS } from './seedData';

const HABITS_STORAGE_KEY = 'habitflow_habits_v2';
const RECORDS_STORAGE_KEY = 'habitflow_records_v2';
const SETTINGS_STORAGE_KEY = 'habitflow_settings_v2';

export function loadStoredData(): {
  habits: Habit[];
  records: CompletionRecord[];
  settings: UserSettings;
} {
  try {
    const rawHabits = localStorage.getItem(HABITS_STORAGE_KEY);
    const rawRecords = localStorage.getItem(RECORDS_STORAGE_KEY);
    const rawSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);

    if (rawHabits && rawRecords) {
      const habits: Habit[] = JSON.parse(rawHabits);
      const records: CompletionRecord[] = JSON.parse(rawRecords);
      const settings: UserSettings = rawSettings ? { ...DEFAULT_SETTINGS, ...JSON.parse(rawSettings) } : DEFAULT_SETTINGS;
      return { habits, records, settings };
    }
  } catch (err) {
    console.warn('Could not parse stored data from localStorage. Bootstrapping seed data.', err);
  }

  // First-time visit: bootstrap initial seed
  const seed = createInitialSeed();
  saveHabits(seed.habits);
  saveRecords(seed.records);
  saveSettings(seed.settings);
  return seed;
}

export function saveHabits(habits: Habit[]): void {
  try {
    localStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
  } catch (err) {
    console.error('Failed to save habits to localStorage:', err);
  }
}

export function saveRecords(records: CompletionRecord[]): void {
  try {
    localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save records to localStorage:', err);
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings to localStorage:', err);
  }
}

export function exportDataAsJSON(habits: Habit[], records: CompletionRecord[], settings: UserSettings): void {
  const payload = {
    appName: 'HabitFlow',
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    habits,
    records,
    settings,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `habitflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportDataAsCSV(habits: Habit[], records: CompletionRecord[]): void {
  const habitMap = new Map(habits.map((h) => [h.id, h]));
  let csv = 'Record ID,Date,Habit ID,Habit Name,Category,Target,Target Unit,Value,Completed Timestamp\n';

  records.forEach((rec) => {
    const habit = habitMap.get(rec.habitId);
    const habitName = habit ? habit.name.replace(/"/g, '""') : 'Archived Habit';
    const category = habit ? habit.category : 'General';
    const targetVal = habit ? habit.targetValue : 1;
    const targetUnit = habit ? habit.targetUnit : 'times';
    const loggedVal = rec.value ?? targetVal;

    csv += `"${rec.id}","${rec.date}","${rec.habitId}","${habitName}","${category}",${targetVal},"${targetUnit}",${loggedVal},"${rec.completedAt}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `habitflow-records-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
