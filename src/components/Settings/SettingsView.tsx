import React, { useRef, useState } from 'react';
import {
  User,
  Palette,
  Calendar,
  Bell,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  X,
} from 'lucide-react';
import { Habit, CompletionRecord, UserSettings } from '../../types/habit';
import { exportDataAsJSON, exportDataAsCSV } from '../../utils/storage';

interface SettingsViewProps {
  settings: UserSettings;
  habits: Habit[];
  records: CompletionRecord[];
  onUpdateSettings: (newSettings: UserSettings) => void;
  onImportData: (data: { habits: Habit[]; records: CompletionRecord[]; settings?: UserSettings }) => void;
  onResetData: () => void;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  habits,
  records,
  onUpdateSettings,
  onImportData,
  onResetData,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.habits) && Array.isArray(parsed.records)) {
          onImportData(parsed);
          setImportStatus(`Successfully restored ${parsed.habits.length} habits and ${parsed.records.length} records!`);
          setTimeout(() => setImportStatus(null), 4000);
        } else {
          alert('Invalid backup JSON format. Missing habits or records array.');
        }
      } catch (err) {
        alert('Could not parse JSON backup file. Ensure it is valid JSON.');
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const handleConfirmReset = () => {
    onResetData();
    setShowResetModal(false);
    setImportStatus('Dataset reset to default 90-day demo habits!');
    setTimeout(() => setImportStatus(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Import Notification Banner */}
      {importStatus && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{importStatus}</span>
          </div>
          <button
            onClick={() => setImportStatus(null)}
            className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* User Profile */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
            User Profile
          </h3>
        </div>

        <div className="space-y-4">
          {/* Avatar selector */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
              Profile Avatar
            </label>
            <div className="flex items-center gap-3">
              {AVATAR_OPTIONS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, avatarUrl: url })}
                  className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                    settings.avatarUrl === url
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 scale-105'
                      : 'border-stone-200 dark:border-stone-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={settings.userName}
                onChange={(e) => onUpdateSettings({ ...settings, userName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Focus Statement
              </label>
              <input
                type="text"
                value={settings.userBio}
                onChange={(e) => onUpdateSettings({ ...settings, userBio: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Preferences (Theme, Week Start, Notifications) */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
            System Preferences
          </h3>
        </div>

        <div className="space-y-4 divide-y divide-stone-100 dark:divide-stone-800">
          {/* Theme */}
          <div className="flex items-center justify-between pt-3 first:pt-0">
            <div>
              <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                Interface Theme
              </p>
              <p className="text-[11px] text-stone-400">
                Currently using {settings.theme === 'dark' ? 'Dark' : 'Light'} theme
              </p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl text-xs font-medium">
              <button
                onClick={() => onUpdateSettings({ ...settings, theme: 'light' })}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  settings.theme === 'light'
                    ? 'bg-emerald-600 text-white dark:bg-emerald-600 dark:text-white shadow-xs font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  settings.theme === 'dark'
                    ? 'bg-emerald-600 text-white dark:bg-emerald-600 dark:text-white shadow-xs font-semibold'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                Dark
              </button>
            </div>
          </div>

          {/* Week Starts On */}
          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                Week Starting Day
              </p>
              <p className="text-[11px] text-stone-400">
                Affects Weekly Charts and Monthly Calendar alignment
              </p>
            </div>
            <select
              value={settings.weekStartsOn}
              onChange={(e) =>
                onUpdateSettings({ ...settings, weekStartsOn: Number(e.target.value) as 0 | 1 })
              }
              className="text-xs font-medium px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200"
            >
              <option value={1}>Monday</option>
              <option value={0}>Sunday</option>
            </select>
          </div>

          {/* Sound & Confetti */}
          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                Celebration Effects
              </p>
              <p className="text-[11px] text-stone-400">
                Show confetti animation upon completing all daily habits
              </p>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, soundEffects: !settings.soundEffects })}
              className={`w-11 h-6 rounded-full transition-colors flex items-center p-1 ${
                settings.soundEffects ? 'bg-emerald-600 justify-end' : 'bg-stone-200 dark:bg-stone-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
            </button>
          </div>
        </div>
      </div>

      {/* Data Management & Export/Import */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Download className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
            Data Backup & Portability
          </h3>
        </div>

        <p className="text-xs text-stone-500 dark:text-stone-400 mb-4 leading-relaxed">
          All your habit configurations and daily tracking records are stored in browser localStorage.
          Export backups regularly or download CSV spreadsheets for external reporting.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => exportDataAsJSON(habits, records, settings)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Download JSON Backup</span>
          </button>

          <button
            onClick={() => exportDataAsCSV(habits, records)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Export CSV Activity</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-xl transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Restore JSON Backup</span>
          </button>
        </div>
      </div>

      {/* Danger Zone: Reset */}
      <div className="bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <h3 className="text-base font-bold text-rose-800 dark:text-rose-400">
            Reset Application Data
          </h3>
        </div>

        <p className="text-xs text-rose-700 dark:text-rose-300 mb-4 leading-relaxed">
          Resetting will regenerate the original 90-day sample data with preloaded habits, streaks, and heatmap records. Any custom habits created will be cleared.
        </p>

        <button
          type="button"
          onClick={() => setShowResetModal(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
        >
          Reset to Demo Dataset
        </button>
      </div>

      {/* In-App Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Reset Application Data?
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  This will reload the initial 90-day seed dataset and clear any custom habits you have added.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors"
              >
                Yes, Reset Dataset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
