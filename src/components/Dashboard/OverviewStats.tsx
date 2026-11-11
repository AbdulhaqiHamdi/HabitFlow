import React from 'react';
import { Target, CheckCircle2, Percent, Flame, Award } from 'lucide-react';

interface OverviewStatsProps {
  totalActiveHabits: number;
  completedTodayCount: number;
  completionRate: number;
  currentStreak: number;
  bestStreak: number;
}

export const OverviewStats: React.FC<OverviewStatsProps> = ({
  totalActiveHabits,
  completedTodayCount,
  completionRate,
  currentStreak,
  bestStreak,
}) => {
  const stats = [
    {
      label: 'Active Habits',
      value: totalActiveHabits,
      unit: '',
      subtitle: 'Currently tracking',
      icon: Target,
      color: 'text-stone-700 dark:text-stone-300',
      bgColor: 'bg-stone-100 dark:bg-stone-800',
    },
    {
      label: 'Completed Today',
      value: completedTodayCount,
      unit: `/${totalActiveHabits}`,
      subtitle: `${totalActiveHabits - completedTodayCount} remaining`,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      label: 'Today\'s Rate',
      value: completionRate,
      unit: '%',
      subtitle: completionRate === 100 ? 'All finished today!' : 'Daily schedule',
      icon: Percent,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      label: 'Current Streak',
      value: currentStreak,
      unit: 'd',
      subtitle: currentStreak > 0 ? 'Consecutive days' : 'Start one today',
      icon: Flame,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    },
    {
      label: 'Best Streak',
      value: bestStreak,
      unit: 'd',
      subtitle: 'All-time personal record',
      icon: Award,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {stats.map((s, idx) => {
        const Icon = s.icon;
        const isFifthOnSmall = idx === 4;
        return (
          <div
            key={s.label}
            className={`p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-xs flex flex-col justify-between transition-all hover:border-stone-300 dark:hover:border-stone-700 ${
              isFifthOnSmall ? 'col-span-2 lg:col-span-1' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400 truncate">
                {s.label}
              </span>
              <div className={`w-7 h-7 rounded-lg ${s.bgColor} flex items-center justify-center shrink-0`}>
                <Icon className={`w-3.5 h-3.5 ${s.color}`} />
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl sm:text-3xl font-bold tracking-tight tabular-nums ${s.color}`}>
                  {s.value}
                </span>
                {s.unit && (
                  <span className="text-xs sm:text-sm font-semibold text-stone-400 dark:text-stone-500 tabular-nums">
                    {s.unit}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-400 dark:text-stone-500 mt-0.5 truncate">
                {s.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
