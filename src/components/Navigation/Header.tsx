import React from 'react';
import { Menu, Plus, Sun, Moon } from 'lucide-react';
import { TabType } from './Sidebar';

interface HeaderProps {
  activeTab: TabType;
  onOpenMobileMenu: () => void;
  onOpenCreateHabit: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  todayCompletedCount: number;
  todayScheduledCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileMenu,
  onOpenCreateHabit,
  theme,
  onToggleTheme,
  todayCompletedCount,
  todayScheduledCount,
}) => {
  const titles: Record<TabType, { title: string; subtitle: string }> = {
    dashboard: { title: 'Personal Dashboard', subtitle: 'Daily habits and progress overview' },
    habits: { title: 'Habit Management', subtitle: 'Configure schedules, categories, and targets' },
    calendar: { title: 'Monthly Calendar', subtitle: 'Historical schedule and compliance view' },
    analytics: { title: 'Habit Analytics', subtitle: 'Consistency trends and category breakdowns' },
    goals: { title: 'Goals & Streaks', subtitle: 'Milestone badges and habit endurance targets' },
    settings: { title: 'Settings & Data', subtitle: 'Preferences, profile, and data export/import' },
  };

  const { title, subtitle } = titles[activeTab] || { title: 'HabitFlow', subtitle: '' };

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 bg-stone-50/90 dark:bg-stone-950/90 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Zone 1: Title & Mobile Toggle */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-lg transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100 truncate">
            {title}
          </h1>
          <p className="hidden sm:block text-xs text-stone-500 dark:text-stone-400 truncate">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Zone 2: Date & quick completion state */}
      <div className="hidden lg:flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 font-medium">
        <span>{todayFormatted}</span>
        <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
        <span className="tabular-nums">
          {todayCompletedCount}/{todayScheduledCount} Completed Today
        </span>
      </div>

      {/* Zone 3: Actions (Theme Toggle & Primary Action) */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          className="p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
        </button>

        <button
          onClick={onOpenCreateHabit}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl shadow-xs transition-all whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Habit</span>
        </button>
      </div>
    </header>
  );
};
