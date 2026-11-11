import React, { useState } from 'react';
import { History, CheckCircle2, Clock } from 'lucide-react';
import { Habit, CompletionRecord } from '../../types/habit';
import { HabitIcon } from '../Common/HabitIcon';
import { formatHumanDate } from '../../utils/dateUtils';

interface RecentActivityProps {
  habits: Habit[];
  records: CompletionRecord[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ habits, records }) => {
  const [selectedHabitId, setSelectedHabitId] = useState<string>('all');
  const habitMap = new Map(habits.map((h) => [h.id, h]));

  const sortedRecords = [...records]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .filter((r) => (selectedHabitId === 'all' ? true : r.habitId === selectedHabitId))
    .slice(0, 8);

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-stone-500" />
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Recent Activity Log
          </h3>
        </div>

        {/* Filter by habit */}
        <div className="flex items-center gap-2">
          <select
            value={selectedHabitId}
            onChange={(e) => setSelectedHabitId(e.target.value)}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Habits</option>
            {habits.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {sortedRecords.length === 0 ? (
        <div className="py-8 text-center text-xs text-stone-400">
          No habit completions logged yet.
        </div>
      ) : (
        <div className="divide-y divide-stone-100 dark:divide-stone-800/80">
          {sortedRecords.map((record) => {
            const habit = habitMap.get(record.habitId);
            const dateObj = new Date(record.completedAt);
            const timeString = isNaN(dateObj.getTime())
              ? 'Logged'
              : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={record.id}
                className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0 text-stone-600 dark:text-stone-300">
                    <HabitIcon name={habit?.icon || 'check'} className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 truncate">
                      {habit ? habit.name : 'Archived Habit'}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-400 dark:text-stone-500">
                      <span>{habit?.category || 'General'}</span>
                      <span aria-hidden="true">·</span>
                      <span>Target: {habit?.targetValue} {habit?.targetUnit}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 text-right">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-stone-400 dark:text-stone-500 mt-0.5 tabular-nums">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>{formatHumanDate(record.date, { month: 'short', day: 'numeric' })} at {timeString}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
