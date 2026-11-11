import React, { useState } from 'react';
import { Habit, CompletionRecord } from '../../types/habit';
import { formatDateToKey, isHabitScheduledForDate, formatHumanDate } from '../../utils/dateUtils';

interface ActivityHeatmapProps {
  habits: Habit[];
  records: CompletionRecord[];
}

interface DayCell {
  date: Date;
  dateKey: string;
  completed: number;
  scheduled: number;
  rate: number;
  isFuture: boolean;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({ habits, records }) => {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    dateKey: string;
    completed: number;
    scheduled: number;
    rate: number;
  } | null>(null);

  // Group records by dateKey
  const recordMap = new Map<string, number>();
  records.forEach((r) => {
    recordMap.set(r.date, (recordMap.get(r.date) || 0) + 1);
  });

  const today = new Date();
  const todayKey = formatDateToKey(today);

  // Build exactly 52 weeks ending on the current week's Saturday
  // Day 0 = Sunday, 6 = Saturday
  const endOfWeek = new Date(today);
  const daysUntilSaturday = 6 - today.getDay();
  endOfWeek.setDate(today.getDate() + daysUntilSaturday);

  const totalDays = 52 * 7;
  const startDay = new Date(endOfWeek);
  startDay.setDate(endOfWeek.getDate() - totalDays + 1);

  const weeks: DayCell[][] = [];
  const monthLabels: { label: string; weekIndex: number }[] = [];

  let currentWeek: DayCell[] = [];
  const cursor = new Date(startDay);
  let lastMonth = -1;

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(cursor);
    const dateKey = formatDateToKey(d);
    const isFuture = d > today && dateKey !== todayKey;

    const scheduled = habits.filter((h) => h.isActive && isHabitScheduledForDate(h, d));
    const completed = recordMap.get(dateKey) || 0;
    const rate = scheduled.length > 0 ? Math.min(completed / scheduled.length, 1) : 0;

    // Check month transition for header labels
    if (d.getDate() <= 7 && d.getMonth() !== lastMonth && currentWeek.length === 0) {
      monthLabels.push({
        label: d.toLocaleDateString('en-US', { month: 'short' }),
        weekIndex: weeks.length,
      });
      lastMonth = d.getMonth();
    }

    currentWeek.push({
      date: d,
      dateKey,
      completed,
      scheduled: scheduled.length,
      rate,
      isFuture,
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  const getCellColor = (day: DayCell) => {
    if (day.isFuture) return 'bg-stone-100 dark:bg-stone-900 opacity-40';
    if (day.scheduled === 0 && day.completed === 0) return 'bg-stone-100 dark:bg-stone-800/40';
    if (day.completed === 0) return 'bg-stone-200/70 dark:bg-stone-800';
    if (day.rate <= 0.35) return 'bg-emerald-200 dark:bg-emerald-950/80';
    if (day.rate <= 0.7) return 'bg-emerald-400 dark:bg-emerald-700';
    if (day.rate < 1.0) return 'bg-emerald-500 dark:bg-emerald-600';
    return 'bg-emerald-600 dark:bg-emerald-500';
  };

  const dayLabels = ['Sun', '', 'Tue', '', 'Thu', '', 'Sat'];

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Habit Completion Heatmap
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            52-week activity distribution and momentum history
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 font-medium">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-xs bg-stone-200 dark:bg-stone-800" title="0% completed" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-200 dark:bg-emerald-950" title="1-35% completed" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400 dark:bg-emerald-700" title="36-70% completed" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 dark:bg-emerald-600" title="71-99% completed" />
          <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 dark:bg-emerald-500" title="100% completed" />
          <span>More</span>
        </div>
      </div>

      {/* Grid container with horizontal scroll on small screens */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[720px]">
          {/* Month labels */}
          <div className="flex text-[10px] text-stone-400 font-medium mb-1 pl-7">
            {weeks.map((_, index) => {
              const month = monthLabels.find((m) => m.weekIndex === index);
              return (
                <div key={index} className="w-3.5 mr-1 text-left shrink-0">
                  {month ? month.label : ''}
                </div>
              );
            })}
          </div>

          <div className="flex gap-1.5">
            {/* Day of week labels */}
            <div className="flex flex-col justify-between py-0.5 text-[9px] text-stone-400 font-medium w-6 shrink-0 select-none">
              {dayLabels.map((lbl, idx) => (
                <span key={idx} className="h-3 leading-3">
                  {lbl}
                </span>
              ))}
            </div>

            {/* Weeks columns */}
            <div className="flex gap-1 shrink-0">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1">
                  {week.map((day) => (
                    <div
                      key={day.dateKey}
                      className={`w-3.5 h-3 rounded-[3px] transition-transform hover:scale-125 hover:z-20 cursor-pointer ${getCellColor(
                        day
                      )}`}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({
                          x: rect.left + rect.width / 2,
                          y: rect.top - 8,
                          dateKey: day.dateKey,
                          completed: day.completed,
                          scheduled: day.scheduled,
                          rate: Math.round(day.rate * 100),
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-3 py-1.5 text-xs text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full transition-opacity whitespace-nowrap"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="font-semibold">{formatHumanDate(tooltip.dateKey)}</div>
          <div className="text-[11px] opacity-90 tabular-nums">
            {tooltip.completed} of {tooltip.scheduled} habits completed ({tooltip.rate}%)
          </div>
        </div>
      )}
    </div>
  );
};
