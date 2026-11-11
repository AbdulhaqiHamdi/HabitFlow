import React from 'react';
import {
  BarChart3,
  ListTodo,
  Calendar as CalendarIcon,
  LineChart,
  Trophy,
  Settings as SettingsIcon,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { UserSettings } from '../../types/habit';

export type TabType = 'dashboard' | 'habits' | 'calendar' | 'analytics' | 'goals' | 'settings';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  settings: UserSettings;
  overallStreak: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
  settings,
  overallStreak,
}) => {
  const navItems: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'habits', label: 'My Habits', icon: ListTodo },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'goals', label: 'Goals & Streaks', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 h-screen z-50 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 transition-all duration-200 flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-18' : 'w-64 md:w-64'}`}
      >
        {/* Top: Brand & Navigation */}
        <div className="flex flex-col p-4 flex-1 overflow-y-auto">
          {/* Brand header */}
          <div className="flex items-center justify-between pb-6 pt-1 px-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="font-bold text-base tracking-tight text-stone-900 dark:text-stone-100">
                    HabitFlow
                  </span>
                  <span className="text-[11px] text-stone-400 dark:text-stone-500 font-medium">
                    Personal Habit Studio
                  </span>
                </div>
              )}
            </div>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="hidden md:flex p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-100'
                  } ${isCollapsed ? 'justify-center px-2' : ''}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Streak banner & User Profile */}
        <div className="p-4 border-t border-stone-200 dark:border-stone-800">
          {!isCollapsed && overallStreak > 0 && (
            <div className="mb-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                  {overallStreak} Day Streak
                </span>
              </div>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">Keep going</span>
            </div>
          )}

          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <img
              src={settings.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={settings.userName}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-stone-200 dark:ring-stone-700 shrink-0"
            />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate">
                  {settings.userName}
                </span>
                <span className="text-[10px] text-stone-400 truncate">Productivity Member</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
