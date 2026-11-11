/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Habit, CompletionRecord, UserSettings } from './types/habit';
import {
  loadStoredData,
  saveHabits,
  saveRecords,
  saveSettings,
} from './utils/storage';
import {
  formatDateToKey,
  getHabitsScheduledForDate,
  getOverallStreak,
} from './utils/dateUtils';
import { createInitialSeed, DEFAULT_SETTINGS } from './utils/seedData';

// Navigation & Layout Components
import { Sidebar, TabType } from './components/Navigation/Sidebar';
import { Header } from './components/Navigation/Header';

// Dashboard Components
import { OverviewStats } from './components/Dashboard/OverviewStats';
import { DailyChecklist } from './components/Dashboard/DailyChecklist';
import { WeeklyBarChart } from './components/Dashboard/WeeklyBarChart';
import { ActivityHeatmap } from './components/Dashboard/ActivityHeatmap';
import { RecentActivity } from './components/Dashboard/RecentActivity';

// Feature Views
import { HabitManager } from './components/Habits/HabitManager';
import { HabitModal } from './components/Habits/HabitModal';
import { CalendarView } from './components/Calendar/CalendarView';
import { AnalyticsView } from './components/Analytics/AnalyticsView';
import { GoalsAndStreaks } from './components/Goals/GoalsAndStreaks';
import { SettingsView } from './components/Settings/SettingsView';

export default function App() {
  const [data, setData] = useState<{
    habits: Habit[];
    records: CompletionRecord[];
    settings: UserSettings;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Initialize data on mount
  useEffect(() => {
    const loaded = loadStoredData();
    setData(loaded);
  }, []);

  // Sync theme with document element
  useEffect(() => {
    if (!data) return;
    const isDark = data.settings.theme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [data?.settings.theme]);

  if (!data) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { habits, records, settings } = data;

  // Persistence helpers
  const updateHabits = (newHabits: Habit[]) => {
    setData((prev) => (prev ? { ...prev, habits: newHabits } : null));
    saveHabits(newHabits);
  };

  const updateRecords = (newRecords: CompletionRecord[]) => {
    setData((prev) => (prev ? { ...prev, records: newRecords } : null));
    saveRecords(newRecords);
  };

  const updateSettings = (newSettings: UserSettings) => {
    setData((prev) => (prev ? { ...prev, settings: newSettings } : null));
    saveSettings(newSettings);
  };

  // Toggle habit for today or a specific date
  const handleToggleHabit = (habitId: string, customDateKey?: string) => {
    const today = new Date();
    const dateKey = customDateKey || formatDateToKey(today);

    const existingIndex = records.findIndex(
      (r) => r.habitId === habitId && r.date === dateKey
    );

    if (existingIndex > -1) {
      // Undo completion
      const nextRecords = [...records];
      nextRecords.splice(existingIndex, 1);
      updateRecords(nextRecords);
    } else {
      // Log completion
      const targetHabit = habits.find((h) => h.id === habitId);
      const newRecord: CompletionRecord = {
        id: `rec-${habitId}-${dateKey}-${Date.now()}`,
        habitId,
        date: dateKey,
        completedAt: new Date().toISOString(),
        value: targetHabit?.targetValue || 1,
      };
      updateRecords([...records, newRecord]);
    }
  };

  // Create or edit habit
  const handleSaveHabit = (habitData: Partial<Habit>) => {
    if (editingHabit) {
      const updated = habits.map((h) =>
        h.id === editingHabit.id ? ({ ...h, ...habitData } as Habit) : h
      );
      updateHabits(updated);
    } else {
      const newHabit: Habit = {
        id: `habit-${Date.now()}`,
        name: habitData.name || 'Untitled Habit',
        description: habitData.description || '',
        category: habitData.category || 'Productivity',
        icon: habitData.icon || 'target',
        color: habitData.color || 'emerald',
        frequency: habitData.frequency || 'daily',
        specificDays: habitData.specificDays || [0, 1, 2, 3, 4, 5, 6],
        targetValue: habitData.targetValue || 1,
        targetUnit: habitData.targetUnit || 'times',
        targetStreak: habitData.targetStreak || 30,
        createdAt: formatDateToKey(new Date()),
        isActive: true,
      };
      updateHabits([...habits, newHabit]);
    }
    setEditingHabit(null);
  };

  const handleToggleActive = (habitId: string) => {
    updateHabits(
      habits.map((h) => (h.id === habitId ? { ...h, isActive: !h.isActive } : h))
    );
  };

  const handleDeleteHabit = (habitId: string, deleteRecords = false) => {
    updateHabits(habits.filter((h) => h.id !== habitId));
    if (deleteRecords) {
      updateRecords(records.filter((r) => r.habitId !== habitId));
    }
  };

  const handleImportData = (imported: {
    habits: Habit[];
    records: CompletionRecord[];
    settings?: UserSettings;
  }) => {
    const nextSettings = imported.settings ? { ...DEFAULT_SETTINGS, ...imported.settings } : settings;
    updateHabits(imported.habits);
    updateRecords(imported.records);
    updateSettings(nextSettings);
  };

  const handleResetData = () => {
    const seed = createInitialSeed();
    updateHabits(seed.habits);
    updateRecords(seed.records);
    updateSettings(seed.settings);
  };

  // Compute live dashboard metrics
  const today = new Date();
  const todayKey = formatDateToKey(today);
  const scheduledToday = getHabitsScheduledForDate(habits, today);
  const completedTodayRecords = records.filter((r) => r.date === todayKey);
  const completedTodayIds = new Set(completedTodayRecords.map((r) => r.habitId));

  const completedTodayCount = scheduledToday.filter((h) => completedTodayIds.has(h.id)).length;
  const completionRate =
    scheduledToday.length > 0
      ? Math.round((completedTodayCount / scheduledToday.length) * 100)
      : 0;

  const overallStreaks = getOverallStreak(habits, records, today);
  const totalActiveHabits = habits.filter((h) => h.isActive).length;

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col md:flex-row antialiased font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        settings={settings}
        overallStreak={overallStreaks.current}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenCreateHabit={() => {
            setEditingHabit(null);
            setIsHabitModalOpen(true);
          }}
          theme={settings.theme}
          onToggleTheme={() =>
            updateSettings({
              ...settings,
              theme: settings.theme === 'dark' ? 'light' : 'dark',
            })
          }
          todayCompletedCount={completedTodayCount}
          todayScheduledCount={scheduledToday.length}
        />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* View Routing */}
          {activeTab === 'dashboard' && (
            <>
              {/* Section A: Overview Statistics */}
              <OverviewStats
                totalActiveHabits={totalActiveHabits}
                completedTodayCount={completedTodayCount}
                completionRate={completionRate}
                currentStreak={overallStreaks.current}
                bestStreak={overallStreaks.best}
              />

              {/* Section B & C: Daily Tracker & Weekly Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <DailyChecklist
                  scheduledHabits={scheduledToday}
                  records={records}
                  onToggleHabit={(id) => handleToggleHabit(id)}
                  onOpenCreateModal={() => {
                    setEditingHabit(null);
                    setIsHabitModalOpen(true);
                  }}
                  selectedDate={today}
                />
                <WeeklyBarChart
                  habits={habits}
                  records={records}
                  weekStartsOn={settings.weekStartsOn}
                />
              </div>

              {/* Section D: Habit Completion Heatmap */}
              <ActivityHeatmap habits={habits} records={records} />

              {/* Section E: Recent Activity */}
              <RecentActivity habits={habits} records={records} />
            </>
          )}

          {activeTab === 'habits' && (
            <HabitManager
              habits={habits}
              records={records}
              onOpenCreateModal={() => {
                setEditingHabit(null);
                setIsHabitModalOpen(true);
              }}
              onEditHabit={(habit) => {
                setEditingHabit(habit);
                setIsHabitModalOpen(true);
              }}
              onToggleActive={handleToggleActive}
              onDeleteHabit={handleDeleteHabit}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              habits={habits}
              records={records}
              onToggleHabitForDate={(id, dateKey) => handleToggleHabit(id, dateKey)}
              weekStartsOn={settings.weekStartsOn}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView habits={habits} records={records} />
          )}

          {activeTab === 'goals' && (
            <GoalsAndStreaks habits={habits} records={records} />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              habits={habits}
              records={records}
              onUpdateSettings={updateSettings}
              onImportData={handleImportData}
              onResetData={handleResetData}
            />
          )}
        </main>
      </div>

      {/* Habit Create / Edit Modal */}
      <HabitModal
        isOpen={isHabitModalOpen}
        initialHabit={editingHabit}
        onClose={() => {
          setIsHabitModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
      />
    </div>
  );
}
