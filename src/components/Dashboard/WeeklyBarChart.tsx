import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Habit, CompletionRecord } from '../../types/habit';
import { formatDateToKey, isHabitScheduledForDate, getWeekDays } from '../../utils/dateUtils';

interface WeeklyBarChartProps {
  habits: Habit[];
  records: CompletionRecord[];
  weekStartsOn?: 0 | 1;
}

export const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({
  habits,
  records,
  weekStartsOn = 1,
}) => {
  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [hoveredDay, setHoveredDay] = useState<{
    dateKey: string;
    dayName: string;
    completed: number;
    scheduled: number;
    rate: number;
  } | null>(null);

  const today = new Date();
  const todayKey = formatDateToKey(today);

  // Calculate base date for the targeted week
  const targetDate = new Date();
  targetDate.setDate(today.getDate() + weekOffset * 7);

  const weekDays = getWeekDays(targetDate, weekStartsOn);

  const daysData = weekDays.map((d) => {
    const dateKey = formatDateToKey(d);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const scheduled = habits.filter((h) => h.isActive && isHabitScheduledForDate(h, d));
    const dayRecords = records.filter((r) => r.date === dateKey);

    const completed = dayRecords.length;
    const totalScheduled = scheduled.length;
    const rate = totalScheduled > 0 ? Math.round((completed / totalScheduled) * 100) : 0;
    const isFuture = d > today && dateKey !== todayKey;
    const isToday = dateKey === todayKey;

    return {
      date: d,
      dateKey,
      dayName,
      completed,
      scheduled: totalScheduled,
      rate,
      isFuture,
      isToday,
    };
  });

  const maxCount = Math.max(
    ...daysData.map((d) => Math.max(d.scheduled, d.completed, 4))
  );

  const startDateStr = weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endDateStr = weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      {/* Header & Week Nav */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
              Weekly Activity
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {startDateStr} – {endDateStr}
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              disabled={weekOffset === 0}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-40 transition-colors"
            >
              This Week
            </button>
            <button
              onClick={() => setWeekOffset((prev) => prev + 1)}
              disabled={weekOffset >= 0}
              className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-40 transition-colors"
              aria-label="Next week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hover info badge */}
        <div className="h-6 mb-2">
          {hoveredDay ? (
            <p className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {hoveredDay.dayName} ({hoveredDay.dateKey}):
              </span>
              <span>
                {hoveredDay.completed} of {hoveredDay.scheduled} completed ({hoveredDay.rate}%)
              </span>
            </p>
          ) : (
            <p className="text-xs text-stone-400 dark:text-stone-500">
              Hover over bars to inspect daily statistics
            </p>
          )}
        </div>

        {/* Bar Chart Area */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pt-4 border-b border-stone-100 dark:border-stone-800 pb-2">
          {daysData.map((day) => {
            const heightPercent = maxCount > 0 ? (day.completed / maxCount) * 100 : 0;
            const targetHeightPercent = maxCount > 0 ? (day.scheduled / maxCount) * 100 : 0;

            const isAllCompleted = day.scheduled > 0 && day.completed >= day.scheduled;

            return (
              <div
                key={day.dateKey}
                onMouseEnter={() =>
                  setHoveredDay({
                    dateKey: day.dateKey,
                    dayName: day.dayName,
                    completed: day.completed,
                    scheduled: day.scheduled,
                    rate: day.rate,
                  })
                }
                onMouseLeave={() => setHoveredDay(null)}
                className="group relative flex flex-col items-center h-full justify-end cursor-pointer"
              >
                {/* Bar Container */}
                <div className="relative w-full max-w-[38px] bg-stone-100 dark:bg-stone-800/80 rounded-lg h-full flex items-end overflow-hidden group-hover:ring-2 group-hover:ring-stone-300 dark:group-hover:ring-stone-600 transition-all">
                  {/* Scheduled target indicator line */}
                  {day.scheduled > 0 && (
                    <div
                      className="absolute inset-x-0 border-t border-dashed border-stone-400 dark:border-stone-500 z-10"
                      style={{ bottom: `${targetHeightPercent}%` }}
                      title={`Target: ${day.scheduled} habits`}
                    />
                  )}

                  {/* Completed fill */}
                  <div
                    className={`w-full rounded-b-lg transition-all duration-500 ${
                      day.isFuture
                        ? 'bg-stone-300/60 dark:bg-stone-700/60'
                        : isAllCompleted
                        ? 'bg-emerald-500 dark:bg-emerald-400'
                        : day.completed > 0
                        ? 'bg-emerald-400/80 dark:bg-emerald-600/80'
                        : 'bg-transparent'
                    }`}
                    style={{ height: `${Math.min(heightPercent, 100)}%` }}
                  />
                </div>

                {/* Day label */}
                <div className="mt-2 text-center">
                  <span
                    className={`text-xs block font-medium ${
                      day.isToday
                        ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    {day.dayName}
                  </span>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 tabular-nums">
                    {day.date.getDate()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-[11px] text-stone-500 dark:text-stone-400 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-0 border-t border-dashed border-stone-400" />
          <span>Scheduled Target</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-stone-200 dark:bg-stone-800" />
          <span>Pending/Rest</span>
        </div>
      </div>
    </div>
  );
};
