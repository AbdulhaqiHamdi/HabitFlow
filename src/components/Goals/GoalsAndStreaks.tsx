import React from 'react';
import { Trophy, Flame, Award, CheckCircle2, Star, Sparkles } from 'lucide-react';
import { Habit, CompletionRecord } from '../../types/habit';
import { HabitIcon } from '../Common/HabitIcon';
import { calculateHabitStreak } from '../../utils/dateUtils';

interface GoalsAndStreaksProps {
  habits: Habit[];
  records: CompletionRecord[];
}

const MILESTONES = [
  { days: 7, label: 'Starter Spark', desc: 'Complete 7 consecutive scheduled days', icon: '🌱' },
  { days: 14, label: 'Fortnight Form', desc: 'Hold momentum for 2 unbroken weeks', icon: '⚡' },
  { days: 30, label: 'Habit Anchor', desc: 'Cement the routine into second nature', icon: '🏆' },
  { days: 60, label: 'Master of Flow', desc: 'Transform behavior into natural identity', icon: '🔥' },
  { days: 100, label: 'Century Club', desc: 'Elite consistency of 100 consecutive days', icon: '👑' },
];

export const GoalsAndStreaks: React.FC<GoalsAndStreaksProps> = ({ habits, records }) => {
  const activeHabits = habits.filter((h) => h.isActive);

  // Calculate streaks for all active habits
  const habitStreaks = activeHabits.map((habit) => {
    const info = calculateHabitStreak(habit, records);
    const targetGoal = habit.targetStreak || 30;
    const progressPercent = Math.min(Math.round((info.currentStreak / targetGoal) * 100), 100);

    return {
      habit,
      ...info,
      targetGoal,
      progressPercent,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-6 sm:p-7 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              Habit Goals & Streaks
            </h2>
            <p className="text-xs text-emerald-100">
              Consistency is the compound interest of self-improvement
            </p>
          </div>
        </div>
      </div>

      {/* Global Milestone Badges Grid */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Milestone Achievement Badges</span>
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Badges unlock as you achieve milestone streaks across any habit
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {MILESTONES.map((m) => {
            const qualifyingHabits = habitStreaks.filter((s) => s.bestStreak >= m.days);
            const isUnlocked = qualifyingHabits.length > 0;

            return (
              <div
                key={m.days}
                className={`p-4 rounded-xl border flex flex-col justify-between text-center transition-all ${
                  isUnlocked
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs'
                    : 'border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900 opacity-60'
                }`}
              >
                <div>
                  <div className="text-3xl sm:text-4xl my-1 select-none">{m.icon}</div>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 mt-2">
                    {m.label}
                  </h4>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 line-clamp-2">
                    {m.desc}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800/80">
                  <span
                    className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      isUnlocked
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    {isUnlocked ? `${qualifyingHabits.length} Habits` : 'Locked'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Habit Streak Targets Leaderboard */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>Active Habit Streaks & Target Goals</span>
        </h3>

        {habitStreaks.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-400">
            No active habits found. Create a habit to start tracking streaks!
          </div>
        ) : (
          <div className="space-y-4">
            {habitStreaks.map(
              ({ habit, currentStreak, bestStreak, targetGoal, progressPercent, totalCompletions }) => {
                const isGoalReached = currentStreak >= targetGoal;

                return (
                  <div
                    key={habit.id}
                    className="p-4 rounded-xl border border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-300 shrink-0">
                          <HabitIcon name={habit.icon} className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                              {habit.name}
                            </h4>
                            {isGoalReached && (
                              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">
                                Goal Achieved!
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                            <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5 fill-amber-500" /> {currentStreak} days current
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>Best: {bestStreak} days</span>
                            <span aria-hidden="true">·</span>
                            <span>{totalCompletions} total</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <span className="text-xs font-bold text-stone-800 dark:text-stone-200 tabular-nums">
                          Goal: {targetGoal} Days
                        </span>
                        <span className="block text-[11px] text-stone-400 tabular-nums">
                          {progressPercent}% completed
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isGoalReached
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-amber-500 to-emerald-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
};
