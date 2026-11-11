import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Award,
  AlertCircle,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  BarChart2,
} from 'lucide-react';
import { Habit, CompletionRecord } from '../../types/habit';
import { HabitIcon } from '../Common/HabitIcon';
import {
  formatDateToKey,
  isHabitScheduledForDate,
  calculateHabitStreak,
  formatHumanDate,
} from '../../utils/dateUtils';

interface AnalyticsViewProps {
  habits: Habit[];
  records: CompletionRecord[];
}

type TimeRangeOption = '7' | '30' | '90' | '365' | 'custom';

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ habits, records }) => {
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('30');
  const [customStart, setCustomStart] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return formatDateToKey(d);
  });
  const [customEnd, setCustomEnd] = useState<string>(() => formatDateToKey(new Date()));

  // Compute analytics based on range
  const {
    datesInRange,
    overallRate,
    totalScheduled,
    totalCompleted,
    bestHabit,
    leastHabit,
    statsByHabit,
    categoryBreakdown,
    dailyTrend,
  } = useMemo(() => {
    const today = new Date();
    const dates: Date[] = [];

    if (timeRange === 'custom') {
      const [sy, sm, sd] = customStart.split('-').map(Number);
      const [ey, em, ed] = customEnd.split('-').map(Number);
      const start = new Date(sy, sm - 1, sd, 12, 0, 0);
      const end = new Date(ey, em - 1, ed, 12, 0, 0);

      const cur = new Date(start);
      while (cur <= end && dates.length < 366) {
        dates.push(new Date(cur));
        cur.setDate(cur.getDate() + 1);
      }
    } else {
      const daysCount = parseInt(timeRange, 10);
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        d.setHours(12, 0, 0, 0);
        dates.push(d);
      }
    }

    const dateKeySet = new Set(dates.map((d) => formatDateToKey(d)));
    const relevantRecords = records.filter((r) => dateKeySet.has(r.date));

    // Habit breakdown
    let grandScheduled = 0;
    let grandCompleted = 0;

    const habitStats = habits
      .filter((h) => h.isActive)
      .map((habit) => {
        let scheduledCount = 0;
        dates.forEach((d) => {
          if (isHabitScheduledForDate(habit, d)) {
            scheduledCount++;
          }
        });

        const completedCount = relevantRecords.filter((r) => r.habitId === habit.id).length;
        grandScheduled += scheduledCount;
        grandCompleted += completedCount;

        const rate = scheduledCount > 0 ? Math.round((completedCount / scheduledCount) * 100) : 0;
        const streakInfo = calculateHabitStreak(habit, records);

        return {
          habit,
          scheduledCount,
          completedCount,
          rate,
          currentStreak: streakInfo.currentStreak,
          bestStreak: streakInfo.bestStreak,
        };
      })
      .sort((a, b) => b.rate - a.rate);

    // Category breakdown
    const catMap = new Map<string, { scheduled: number; completed: number }>();
    habitStats.forEach(({ habit, scheduledCount, completedCount }) => {
      const curr = catMap.get(habit.category) || { scheduled: 0, completed: 0 };
      catMap.set(habit.category, {
        scheduled: curr.scheduled + scheduledCount,
        completed: curr.completed + completedCount,
      });
    });

    const categoryList = Array.from(catMap.entries()).map(([cat, val]) => {
      const rate = val.scheduled > 0 ? Math.round((val.completed / val.scheduled) * 100) : 0;
      return {
        category: cat,
        scheduled: val.scheduled,
        completed: val.completed,
        rate,
      };
    }).sort((a, b) => b.rate - a.rate);

    // Daily trend points (sample up to 14-30 points for chart)
    const dailyPoints = dates.map((d) => {
      const key = formatDateToKey(d);
      const scheduledToday = habits.filter((h) => h.isActive && isHabitScheduledForDate(h, d)).length;
      const completedToday = relevantRecords.filter((r) => r.date === key).length;
      const rate = scheduledToday > 0 ? Math.round((completedToday / scheduledToday) * 100) : 0;
      return {
        dateKey: key,
        display: d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
        completed: completedToday,
        scheduled: scheduledToday,
        rate,
      };
    });

    const overall = grandScheduled > 0 ? Math.round((grandCompleted / grandScheduled) * 100) : 0;

    return {
      datesInRange: dates,
      overallRate: overall,
      totalScheduled: grandScheduled,
      totalCompleted: grandCompleted,
      bestHabit: habitStats.length > 0 ? habitStats[0] : null,
      leastHabit: habitStats.length > 0 ? habitStats[habitStats.length - 1] : null,
      statsByHabit: habitStats,
      categoryBreakdown: categoryList,
      dailyTrend: dailyPoints,
    };
  }, [habits, records, timeRange, customStart, customEnd]);

  // Downsample dailyTrend if there are more than 30 points to prevent crowded charts
  const displayTrend = useMemo(() => {
    if (dailyTrend.length <= 30) return dailyTrend;
    const step = Math.ceil(dailyTrend.length / 30);
    return dailyTrend.filter((_, idx) => idx % step === 0 || idx === dailyTrend.length - 1);
  }, [dailyTrend]);

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>Habit Analytics & Insights</span>
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Evaluating consistency across {datesInRange.length} days
          </p>
        </div>

        {/* Buttons / Custom controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs font-medium">
            {[
              { id: '7', label: '7 Days' },
              { id: '30', label: '30 Days' },
              { id: '90', label: '90 Days' },
              { id: '365', label: '12 Months' },
              { id: 'custom', label: 'Custom' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTimeRange(opt.id as TimeRangeOption)}
                className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  timeRange === opt.id
                    ? 'bg-emerald-600 text-white dark:bg-emerald-600 dark:text-white shadow-xs font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {timeRange === 'custom' && (
            <div className="flex items-center gap-2 text-xs">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              />
              <span className="text-stone-400">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              />
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Completion Rate */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
            Overall Completion Rate
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {overallRate}%
            </span>
            <span className="text-xs text-stone-400 tabular-nums">
              ({totalCompleted}/{totalScheduled})
            </span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Average consistency in period</p>
        </div>

        {/* Total Completions */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
            Total Habit Completions
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              {totalCompleted}
            </span>
            <span className="text-xs text-stone-400">actions logged</span>
          </div>
          <p className="text-[11px] text-stone-400 mt-1">Cumulative progress records</p>
        </div>

        {/* Most Consistent Habit */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
            Best-Performing Habit
          </span>
          {bestHabit ? (
            <div className="mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                  {bestHabit.habit.name}
                </span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {bestHabit.rate}%
                </span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5 tabular-nums">
                {bestHabit.completedCount} completed · {bestHabit.currentStreak}d streak
              </p>
            </div>
          ) : (
            <p className="text-xs text-stone-400 mt-2">No data</p>
          )}
        </div>

        {/* Least Consistent Habit */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
            Needs More Focus
          </span>
          {leastHabit ? (
            <div className="mt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                  {leastHabit.habit.name}
                </span>
                <span className="text-base font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  {leastHabit.rate}%
                </span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5 tabular-nums">
                {leastHabit.completedCount} of {leastHabit.scheduledCount} completed
              </p>
            </div>
          ) : (
            <p className="text-xs text-stone-400 mt-2">No data</p>
          )}
        </div>
      </div>

      {/* Completion Trend Visualizer */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Daily Completion Rate Trend
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Percentage of scheduled habits finished each day
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg tabular-nums">
            Average: {overallRate}%
          </span>
        </div>

        {/* Visual Line/Bar Chart */}
        <div className="h-44 flex items-end gap-1 sm:gap-1.5 pt-4 border-b border-stone-100 dark:border-stone-800 pb-1 overflow-x-auto">
          {displayTrend.map((pt) => {
            const heightPct = Math.max(pt.rate, 4);
            const isFull = pt.rate === 100;

            return (
              <div
                key={pt.dateKey}
                title={`${pt.dateKey}: ${pt.completed}/${pt.scheduled} habits (${pt.rate}%)`}
                className="group relative flex-1 min-w-[12px] h-full flex flex-col justify-end items-center cursor-pointer"
              >
                <div
                  className={`w-full max-w-[20px] rounded-t-sm transition-all duration-300 ${
                    isFull
                      ? 'bg-emerald-500'
                      : pt.rate >= 50
                      ? 'bg-emerald-400/80 dark:bg-emerald-600/80'
                      : pt.rate > 0
                      ? 'bg-amber-400 dark:bg-amber-600'
                      : 'bg-stone-200 dark:bg-stone-800'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
            );
          })}
        </div>

        <div className="flex justify-between items-center text-[10px] text-stone-400 mt-2 font-medium">
          <span>{displayTrend[0]?.dateKey}</span>
          <span>{displayTrend[Math.floor(displayTrend.length / 2)]?.dateKey}</span>
          <span>{displayTrend[displayTrend.length - 1]?.dateKey}</span>
        </div>
      </div>

      {/* Grid: Habit Breakdown Table & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habit Performance List */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs">
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-4">
            Habit Consistency Ranking
          </h3>

          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
            {statsByHabit.map(({ habit, rate, completedCount, scheduledCount, currentStreak }) => (
              <div key={habit.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <HabitIcon name={habit.icon} className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                      {habit.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-500 shrink-0 tabular-nums">
                    <span>{rate}%</span>
                    <span className="text-[11px] text-stone-400">
                      ({completedCount}/{scheduledCount})
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      rate >= 80 ? 'bg-emerald-500' : rate >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs">
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-4">
            Completion by Category
          </h3>

          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
            {categoryBreakdown.map((item) => (
              <div key={item.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-stone-800 dark:text-stone-200">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-2 text-stone-500 tabular-nums">
                    <span>{item.rate}%</span>
                    <span className="text-[11px] text-stone-400">
                      ({item.completed}/{item.scheduled})
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                    style={{ width: `${item.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
