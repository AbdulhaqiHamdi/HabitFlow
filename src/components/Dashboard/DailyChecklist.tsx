import React, { useState } from 'react';
import { Check, Flame, Plus, Sparkles, Filter } from 'lucide-react';
import { Habit, CompletionRecord } from '../../types/habit';
import { HabitIcon } from '../Common/HabitIcon';
import { calculateHabitStreak, formatDateToKey } from '../../utils/dateUtils';
import { fireConfetti } from '../../utils/confetti';

interface DailyChecklistProps {
  scheduledHabits: Habit[];
  records: CompletionRecord[];
  onToggleHabit: (habitId: string) => void;
  onOpenCreateModal: () => void;
  selectedDate?: Date;
}

export const DailyChecklist: React.FC<DailyChecklistProps> = ({
  scheduledHabits,
  records,
  onToggleHabit,
  onOpenCreateModal,
  selectedDate = new Date(),
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const dateKey = formatDateToKey(selectedDate);
  const completedIds = new Set(
    records.filter((r) => r.date === dateKey).map((r) => r.habitId)
  );

  const completedCount = scheduledHabits.filter((h) => completedIds.has(h.id)).length;
  const totalCount = scheduledHabits.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredHabits = scheduledHabits.filter((h) => {
    const isDone = completedIds.has(h.id);
    if (filter === 'completed') return isDone;
    if (filter === 'pending') return !isDone;
    return true;
  });

  const handleToggle = (habitId: string, isCurrentlyDone: boolean) => {
    if (!isCurrentlyDone && completedCount + 1 === totalCount && totalCount > 0) {
      fireConfetti(0.5, 0.4);
    }
    onToggleHabit(habitId);
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Daily Habit Tracker
              </h2>
              {progressPercent === 100 && totalCount > 0 && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                  <Sparkles className="w-3 h-3" /> All Done!
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              <span className="tabular-nums font-semibold text-stone-700 dark:text-stone-300">
                {completedCount} of {totalCount}
              </span>{' '}
              habits completed today
            </p>
          </div>

          {/* Filter tabs styled with selected theme color */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs font-medium self-start sm:self-auto">
            {(['all', 'pending', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                  filter === tab
                    ? 'bg-emerald-600 text-white dark:bg-emerald-600 dark:text-white shadow-xs font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 mb-5">
          <div className="flex justify-between text-[11px] font-medium text-stone-500 dark:text-stone-400">
            <span>Daily Progress</span>
            <span className="tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Habits Checklist */}
        {scheduledHabits.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400 mb-3">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
              No habits scheduled for today
            </p>
            <p className="text-xs text-stone-400 max-w-xs mt-1">
              Add new habits or adjust frequencies in the Habit Manager.
            </p>
            <button
              onClick={onOpenCreateModal}
              className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Habit</span>
            </button>
          </div>
        ) : filteredHabits.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-400">
            No habits match the "{filter}" filter.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredHabits.map((habit) => {
              const isCompleted = completedIds.has(habit.id);
              const { currentStreak } = calculateHabitStreak(habit, records, selectedDate);

              return (
                <div
                  key={habit.id}
                  onClick={() => handleToggle(habit.id, isCompleted)}
                  className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    isCompleted
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-900/40'
                      : 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                  }`}
                >
                  {/* Left: Icon & Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isCompleted
                          ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 group-hover:bg-stone-200/70 dark:group-hover:bg-stone-700/70'
                      }`}
                    >
                      <HabitIcon name={habit.icon} className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <h3
                        className={`text-xs sm:text-sm font-semibold truncate transition-colors ${
                          isCompleted
                            ? 'line-through text-stone-400 dark:text-stone-500'
                            : 'text-stone-800 dark:text-stone-200'
                        }`}
                      >
                        {habit.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400">
                        <span className="truncate">{habit.category}</span>
                        <span aria-hidden="true" className="text-stone-300 dark:text-stone-700">·</span>
                        <span className="tabular-nums whitespace-nowrap">
                          {habit.targetValue} {habit.targetUnit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Streak & Checkbox */}
                  <div className="flex items-center gap-3 shrink-0">
                    {currentStreak > 0 && (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                        <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span className="tabular-nums">{currentStreak}d</span>
                      </div>
                    )}

                    <div
                      role="checkbox"
                      aria-checked={isCompleted}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-emerald-600 text-white shadow-xs border-2 border-emerald-600'
                          : 'border-2 border-stone-300 dark:border-stone-700 group-hover:border-emerald-500 bg-stone-50/60 dark:bg-stone-800/40'
                      }`}
                    >
                      {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
