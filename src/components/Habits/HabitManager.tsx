import React, { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Archive,
  CheckCircle2,
  Search,
  Filter,
  Flame,
  Calendar,
  ArrowUpDown,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Habit, CompletionRecord, HabitCategory } from '../../types/habit';
import { HabitIcon } from '../Common/HabitIcon';
import { calculateHabitStreak, formatHumanDate } from '../../utils/dateUtils';

interface HabitManagerProps {
  habits: Habit[];
  records: CompletionRecord[];
  onOpenCreateModal: () => void;
  onEditHabit: (habit: Habit) => void;
  onToggleActive: (habitId: string) => void;
  onDeleteHabit: (habitId: string, deleteRecords?: boolean) => void;
}

export const HabitManager: React.FC<HabitManagerProps> = ({
  habits,
  records,
  onOpenCreateModal,
  onEditHabit,
  onToggleActive,
  onDeleteHabit,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);
  const [deleteRecordsToo, setDeleteRecordsToo] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const categories = Array.from(new Set(habits.map((h) => h.category)));

  const filteredHabits = habits.filter((h) => {
    if (statusFilter === 'active' && !h.isActive) return false;
    if (statusFilter === 'archived' && h.isActive) return false;
    if (categoryFilter !== 'all' && h.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = h.name.toLowerCase().includes(q);
      const matchDesc = h.description.toLowerCase().includes(q);
      const matchCat = h.category.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  const confirmDelete = () => {
    if (!habitToDelete) return;
    const name = habitToDelete.name;
    onDeleteHabit(habitToDelete.id, deleteRecordsToo);
    setHabitToDelete(null);
    setDeleteRecordsToo(false);
    setFeedbackMessage(`Deleted "${name}" successfully.`);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Feedback Banner */}
      {feedbackMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Controls Bar */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search habits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Status Tabs (emerald theme consistent) */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs font-medium">
            {(['all', 'active', 'archived'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                  statusFilter === tab
                    ? 'bg-emerald-600 text-white dark:bg-emerald-600 dark:text-white shadow-xs font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs font-medium px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Right: Add Habit */}
        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-98 rounded-xl shadow-xs transition-colors self-start md:self-auto shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Habit</span>
        </button>
      </div>

      {/* Habit Cards Grid */}
      {filteredHabits.length === 0 ? (
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-12 text-center">
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-200">
            No habits match your search or filter
          </p>
          <p className="text-xs text-stone-400 mt-1">
            Try adjusting your search query or reset the filter tabs.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setCategoryFilter('all');
            }}
            className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredHabits.map((habit) => {
            const { currentStreak, bestStreak } = calculateHabitStreak(
              habit,
              records
            );

            return (
              <div
                key={habit.id}
                className={`bg-white dark:bg-stone-900 border rounded-2xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                  habit.isActive
                    ? 'border-stone-200/80 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                    : 'border-stone-200 dark:border-stone-800/60 opacity-60'
                }`}
              >
                <div>
                  {/* Top: Icon, Title & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-300 shrink-0">
                        <HabitIcon name={habit.icon} className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                          {habit.name}
                        </h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                          {habit.category}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${
                        habit.isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400'
                      }`}
                    >
                      {habit.isActive ? 'Active' : 'Archived'}
                    </span>
                  </div>

                  {/* Description */}
                  {habit.description && (
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-3 line-clamp-2 leading-relaxed">
                      {habit.description}
                    </p>
                  )}

                  {/* Schedule badges */}
                  <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800">
                    <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-2">
                      <span>Schedule:</span>
                      <span className="font-semibold text-stone-700 dark:text-stone-300">
                        {habit.frequency === 'daily' ? 'Daily' : 'Specific Days'}
                      </span>
                    </div>

                    {habit.frequency === 'specific_days' && (
                      <div className="flex justify-between gap-1 mb-3">
                        {dayLabels.map((lbl, idx) => {
                          const isScheduled = habit.specificDays.includes(idx);
                          return (
                            <span
                              key={lbl}
                              className={`text-[10px] w-6 h-6 rounded flex items-center justify-center font-medium ${
                                isScheduled
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-bold'
                                  : 'text-stone-300 dark:text-stone-700'
                              }`}
                            >
                              {lbl[0]}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Stats metrics */}
                    <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-stone-50 dark:bg-stone-800/60 text-xs">
                      <div>
                        <span className="text-[10px] text-stone-400 block">Target</span>
                        <span className="font-semibold text-stone-800 dark:text-stone-200 tabular-nums">
                          {habit.targetValue} {habit.targetUnit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 block">Current</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                          {currentStreak}d
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 block">Best</span>
                        <span className="font-semibold text-stone-800 dark:text-stone-200 tabular-nums">
                          {bestStreak}d
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onToggleActive(habit.id)}
                    className="text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 font-medium transition-colors"
                  >
                    {habit.isActive ? 'Archive' : 'Unarchive'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditHabit(habit)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-600 dark:text-stone-400 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                      title="Edit Habit"
                      aria-label={`Edit ${habit.name}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setHabitToDelete(habit);
                        setDeleteRecordsToo(false);
                      }}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-rose-600 dark:text-stone-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Habit"
                      aria-label={`Delete ${habit.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* In-App Delete Confirmation Modal (never blocked by iframes) */}
      {habitToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Delete Habit
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Are you sure you want to delete{' '}
                  <strong className="text-stone-800 dark:text-stone-200 font-semibold">
                    "{habitToDelete.name}"
                  </strong>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2.5 text-xs text-stone-600 dark:text-stone-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={deleteRecordsToo}
                  onChange={(e) => setDeleteRecordsToo(e.target.checked)}
                  className="rounded border-stone-300 dark:border-stone-700 text-rose-600 focus:ring-rose-500"
                />
                <span>Also delete all historical completion records for this habit</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setHabitToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
              >
                Delete Habit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
