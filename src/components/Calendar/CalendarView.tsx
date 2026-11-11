import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Habit, CompletionRecord } from '../../types/habit';
import { HabitIcon } from '../Common/HabitIcon';
import { formatDateToKey, isHabitScheduledForDate, formatHumanDate } from '../../utils/dateUtils';

interface CalendarViewProps {
  habits: Habit[];
  records: CompletionRecord[];
  onToggleHabitForDate: (habitId: string, dateKey: string) => void;
  weekStartsOn?: 0 | 1;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  habits,
  records,
  onToggleHabitForDate,
  weekStartsOn = 1,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateKey, setSelectedDateKey] = useState<string>(formatDateToKey(new Date()));

  const today = new Date();
  const todayKey = formatDateToKey(today);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Month navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDateKey(todayKey);
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Map completions: dateKey -> Set of habitIds
  const recordMap = new Map<string, Set<string>>();
  records.forEach((r) => {
    if (!recordMap.has(r.date)) {
      recordMap.set(r.date, new Set());
    }
    recordMap.get(r.date)!.add(r.habitId);
  });

  // Calculate calendar grid days
  const firstDayOfMonth = new Date(year, month, 1);
  const firstDayWeekday = firstDayOfMonth.getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Adjust for weekStartsOn (0: Sunday, 1: Monday)
  const offset = (firstDayWeekday < weekStartsOn ? 7 : 0) + firstDayWeekday - weekStartsOn;

  const daysHeader = weekStartsOn === 1
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Inspection drill-down for selected day
  const [selY, selM, selD] = selectedDateKey.split('-').map(Number);
  const selectedDateObj = new Date(selY, selM - 1, selD, 12, 0, 0);
  const scheduledOnSelected = habits.filter(
    (h) => h.isActive && isHabitScheduledForDate(h, selectedDateObj)
  );
  const completedOnSelected = recordMap.get(selectedDateKey) || new Set();

  const isSelectedFuture = selectedDateObj > today && selectedDateKey !== todayKey;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Grid (2 Cols) */}
      <div className="lg:col-span-2 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div>
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-emerald-600" />
                <span>{monthName}</span>
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Click any date to view and update scheduled habit activities
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToToday}
                className="px-3 py-1 text-xs font-semibold rounded-lg border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-xs font-semibold text-stone-400 dark:text-stone-500">
            {daysHeader.map((d) => (
              <span key={d} className="py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Blank leading padding days */}
            {Array.from({ length: offset }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="h-20 sm:h-24 rounded-xl bg-stone-50/30 dark:bg-stone-950/30 border border-dashed border-stone-200/40 dark:border-stone-800/40 opacity-40"
              />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateObj = new Date(year, month, dayNum, 12, 0, 0);
              const dateKey = formatDateToKey(dateObj);
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedDateKey;
              const isFuture = dateObj > today && dateKey !== todayKey;

              const scheduled = habits.filter(
                (h) => h.isActive && isHabitScheduledForDate(h, dateObj)
              );
              const completedSet = recordMap.get(dateKey) || new Set();
              const completedCount = completedSet.size;
              const scheduledCount = scheduled.length;

              const isAllDone = scheduledCount > 0 && completedCount >= scheduledCount;
              const isPartiallyDone = completedCount > 0 && completedCount < scheduledCount;
              const isMissed = !isFuture && scheduledCount > 0 && completedCount === 0;

              return (
                <div
                  key={dateKey}
                  onClick={() => setSelectedDateKey(dateKey)}
                  className={`h-20 sm:h-24 p-2 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40 text-stone-900 dark:text-stone-100 shadow-xs'
                      : isAllDone
                      ? 'border-emerald-200/70 dark:border-emerald-800/40 bg-emerald-50/20 dark:bg-emerald-950/20 hover:border-emerald-400 dark:hover:border-emerald-700'
                      : 'border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold'
                          : 'text-stone-700 dark:text-stone-300'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {isAllDone && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </div>

                  {/* Daily completion badge */}
                  <div className="mt-1">
                    {scheduledCount > 0 ? (
                      <div className="text-[10px] font-semibold">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded-md tabular-nums ${
                            isAllDone
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : isPartiallyDone
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                              : isMissed
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                          }`}
                        >
                          {completedCount}/{scheduledCount}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-stone-300 dark:text-stone-600">Rest</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800" />
            <span>All Done</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-800" />
            <span>Partial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-100 dark:bg-rose-950 border border-rose-300 dark:border-rose-800" />
            <span>Missed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-stone-100 dark:bg-stone-800" />
            <span>Rest Day</span>
          </div>
        </div>
      </div>

      {/* Selected Day Details Panel (1 Col) */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="border-b border-stone-100 dark:border-stone-800 pb-4 mb-4">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              {selectedDateKey === todayKey ? "Today's Schedule" : 'Day Details'}
            </span>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-0.5">
              {formatHumanDate(selectedDateKey, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              <span className="tabular-nums font-semibold text-stone-800 dark:text-stone-200">
                {completedOnSelected.size} of {scheduledOnSelected.length}
              </span>{' '}
              habits completed
            </p>
          </div>

          {scheduledOnSelected.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              No habits were scheduled for this day.
            </div>
          ) : (
            <div className="space-y-2.5">
              {scheduledOnSelected.map((habit) => {
                const isDone = completedOnSelected.has(habit.id);

                return (
                  <div
                    key={habit.id}
                    onClick={() => onToggleHabitForDate(habit.id, selectedDateKey)}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                      isDone
                        ? 'border-emerald-200/80 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20'
                        : 'border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0">
                        <HabitIcon name={habit.icon} className="w-4 h-4 text-stone-700 dark:text-stone-300" />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-semibold truncate ${
                            isDone
                              ? 'line-through text-stone-400 dark:text-stone-500'
                              : 'text-stone-800 dark:text-stone-200'
                          }`}
                        >
                          {habit.name}
                        </p>
                        <p className="text-[11px] text-stone-400 truncate">
                          Target: {habit.targetValue} {habit.targetUnit}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : isSelectedFuture
                            ? 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {isDone ? 'Done' : isSelectedFuture ? 'Upcoming' : 'Missed'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-[11px] text-stone-400 text-center mt-6 pt-4 border-t border-stone-100 dark:border-stone-800">
          Tip: Tap any habit card to toggle completion for this date.
        </p>
      </div>
    </div>
  );
};
