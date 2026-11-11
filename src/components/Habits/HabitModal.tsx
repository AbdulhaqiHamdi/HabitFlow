import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Habit, HabitCategory, FrequencyType } from '../../types/habit';
import { HabitIcon } from '../Common/HabitIcon';
import { formatDateToKey } from '../../utils/dateUtils';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Partial<Habit>) => void;
  initialHabit?: Habit | null;
}

const CATEGORIES: HabitCategory[] = [
  'Health & Fitness',
  'Learning & Education',
  'Productivity',
  'Personal Development',
  'Spirituality',
  'Finance',
  'Lifestyle',
  'Others',
];

const ICONS = [
  { id: 'dumbbell', label: 'Workout' },
  { id: 'book', label: 'Read' },
  { id: 'laptop', label: 'Code' },
  { id: 'droplet', label: 'Water' },
  { id: 'lotus', label: 'Mindful' },
  { id: 'wallet', label: 'Finance' },
  { id: 'run', label: 'Run' },
  { id: 'moon', label: 'Sleep' },
  { id: 'coffee', label: 'Coffee' },
  { id: 'apple', label: 'Nutrition' },
  { id: 'music', label: 'Music' },
  { id: 'target', label: 'Goal' },
  { id: 'flame', label: 'Energy' },
  { id: 'smile', label: 'Mood' },
];

const COLORS: Array<'emerald' | 'blue' | 'indigo' | 'amber' | 'rose' | 'teal' | 'purple'> = [
  'emerald',
  'blue',
  'indigo',
  'amber',
  'rose',
  'teal',
  'purple',
];

export const HabitModal: React.FC<HabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialHabit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('Productivity');
  const [icon, setIcon] = useState('target');
  const [color, setColor] = useState<'emerald' | 'blue' | 'indigo' | 'amber' | 'rose' | 'teal' | 'purple'>('emerald');
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [specificDays, setSpecificDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [targetValue, setTargetValue] = useState<number>(1);
  const [targetUnit, setTargetUnit] = useState('times');
  const [targetStreak, setTargetStreak] = useState<number>(30);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialHabit) {
      setName(initialHabit.name);
      setDescription(initialHabit.description || '');
      setCategory(initialHabit.category);
      setIcon(initialHabit.icon || 'target');
      setColor(initialHabit.color || 'emerald');
      setFrequency(initialHabit.frequency);
      setSpecificDays(initialHabit.specificDays || [0, 1, 2, 3, 4, 5, 6]);
      setTargetValue(initialHabit.targetValue);
      setTargetUnit(initialHabit.targetUnit || 'times');
      setTargetStreak(initialHabit.targetStreak || 30);
    } else {
      setName('');
      setDescription('');
      setCategory('Productivity');
      setIcon('target');
      setColor('emerald');
      setFrequency('daily');
      setSpecificDays([1, 2, 3, 4, 5]);
      setTargetValue(1);
      setTargetUnit('times');
      setTargetStreak(30);
    }
    setErrors({});
  }, [initialHabit, isOpen]);

  if (!isOpen) return null;

  const toggleDay = (dayIndex: number) => {
    setSpecificDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex].sort()
    );
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!name.trim()) errs.name = 'Habit name is required';
    if (frequency === 'specific_days' && specificDays.length === 0) {
      errs.days = 'Select at least one day for specific-day schedule';
    }
    if (targetValue <= 0 || isNaN(targetValue)) {
      errs.target = 'Target must be at least 1';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      name: name.trim(),
      description: description.trim(),
      category,
      icon,
      color,
      frequency,
      specificDays: frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : specificDays,
      targetValue: Number(targetValue) || 1,
      targetUnit: targetUnit.trim() || 'times',
      targetStreak: Number(targetStreak) || 30,
      isActive: true,
      createdAt: initialHabit?.createdAt || formatDateToKey(new Date()),
    });
    onClose();
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              {initialHabit ? 'Edit Habit' : 'Create New Habit'}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Set your identity-building routines and targets
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Habit Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Habit Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning Meditation, Read 20 Pages"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why does this habit matter to you?"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category & Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as HabitCategory)}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Color Accent
              </label>
              <div className="flex items-center gap-1.5 pt-1">
                {COLORS.map((c) => {
                  const bgClass =
                    c === 'emerald'
                      ? 'bg-emerald-500'
                      : c === 'blue'
                      ? 'bg-blue-500'
                      : c === 'indigo'
                      ? 'bg-indigo-500'
                      : c === 'amber'
                      ? 'bg-amber-500'
                      : c === 'rose'
                      ? 'bg-rose-500'
                      : c === 'teal'
                      ? 'bg-teal-500'
                      : 'bg-purple-500';

                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full ${bgClass} flex items-center justify-center transition-transform ${
                        color === c ? 'scale-120 ring-2 ring-stone-900 dark:ring-stone-100' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {color === c && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Choose Icon
            </label>
            <div className="grid grid-cols-7 gap-1.5">
              {ICONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIcon(item.id)}
                  title={item.label}
                  className={`p-2 rounded-xl flex items-center justify-center border transition-all ${
                    icon === item.id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300'
                      : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                  }`}
                >
                  <HabitIcon name={item.id} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Frequency & Schedule */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
              Frequency Schedule
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setFrequency('daily')}
                className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
                  frequency === 'daily'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                Every Day
              </button>
              <button
                type="button"
                onClick={() => setFrequency('specific_days')}
                className={`py-2 text-xs font-semibold rounded-xl border transition-colors ${
                  frequency === 'specific_days'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                }`}
              >
                Specific Days
              </button>
            </div>

            {frequency === 'specific_days' && (
              <div className="pt-2">
                <div className="grid grid-cols-7 gap-1">
                  {dayLabels.map((lbl, idx) => {
                    const isSelected = specificDays.includes(idx);
                    return (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => toggleDay(idx)}
                        className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
                        }`}
                      >
                        {lbl}
                      </button>
                    );
                  })}
                </div>
                {errors.days && <p className="text-xs text-rose-500 mt-1">{errors.days}</p>}
              </div>
            )}
          </div>

          {/* Target Value & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Target Value
              </label>
              <input
                type="number"
                min="1"
                value={targetValue}
                onChange={(e) => setTargetValue(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.target && <p className="text-xs text-rose-500 mt-1">{errors.target}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Unit (mins, pages, times)
              </label>
              <input
                type="text"
                value={targetUnit}
                onChange={(e) => setTargetUnit(e.target.value)}
                placeholder="e.g., mins, pages, glasses"
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Target Streak Goal */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Streak Milestone Goal (Days)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="7"
                step="7"
                value={targetStreak}
                onChange={(e) => setTargetStreak(Math.max(7, parseInt(e.target.value) || 7))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-xs text-stone-500 font-medium">days</span>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
            >
              {initialHabit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
