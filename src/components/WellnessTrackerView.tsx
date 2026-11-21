import { useState, type FormEvent } from 'react';
import { CheckCircle2, Circle, Edit3, Plus, Search, Trash2, Wind, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  createActivityEntry,
  createMoodEntry,
  deleteActivityEntry,
  deleteMoodEntry,
  toggleActivityComplete,
  updateActivityEntry,
  updateMoodEntry,
} from '../services/firestoreService';
import {
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_TYPES,
  EMOTION_LABELS,
  type ActivityEntry,
  type ActivityType,
  type EmotionLabel,
  type MoodEntry,
} from '../types/mindful';

interface WellnessTrackerViewProps {
  moods: MoodEntry[];
  activities: ActivityEntry[];
  onOpenBreathing: () => void;
}

export function WellnessTrackerView({
  moods,
  activities,
  onOpenBreathing,
}: WellnessTrackerViewProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'moods' | 'activities'>('moods');
  const [search, setSearch] = useState('');

  // Mood form state
  const [moodFormOpen, setMoodFormOpen] = useState(false);
  const [editingMoodId, setEditingMoodId] = useState<string | null>(null);
  const [moodScore, setMoodScore] = useState(65);
  const [emotionLabel, setEmotionLabel] = useState<EmotionLabel>('Balanced');
  const [triggersText, setTriggersText] = useState('');
  const [moodNote, setMoodNote] = useState('');
  const [moodBusy, setMoodBusy] = useState(false);

  // Activity form state
  const [actFormOpen, setActFormOpen] = useState(false);
  const [editingActId, setEditingActId] = useState<string | null>(null);
  const [actType, setActType] = useState<ActivityType>('behavioral_activation');
  const [actName, setActName] = useState('');
  const [actDesc, setActDesc] = useState('');
  const [actDuration, setActDuration] = useState(15);
  const [actCompleted, setActCompleted] = useState(true);
  const [actBusy, setActBusy] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const q = search.trim().toLowerCase();
  const filteredMoods = moods.filter(
    (m) =>
      !q ||
      m.emotionLabel.toLowerCase().includes(q) ||
      m.note.toLowerCase().includes(q) ||
      m.triggers.some((t) => t.toLowerCase().includes(q))
  );

  const filteredActivities = activities.filter(
    (a) =>
      !q ||
      a.name.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q) ||
      ACTIVITY_TYPE_LABELS[a.type].toLowerCase().includes(q)
  );

  const openMoodCreate = () => {
    setEditingMoodId(null);
    setMoodScore(65);
    setEmotionLabel('Balanced');
    setTriggersText('');
    setMoodNote('');
    setError(null);
    setMoodFormOpen(true);
  };

  const openMoodEdit = (m: MoodEntry) => {
    setEditingMoodId(m.id);
    setMoodScore(m.score);
    setEmotionLabel(m.emotionLabel);
    setTriggersText((m.triggers || []).join(', '));
    setMoodNote(m.note || '');
    setError(null);
    setMoodFormOpen(true);
  };

  const handleMoodSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setMoodBusy(true);
    setError(null);
    try {
      const triggers = triggersText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (editingMoodId) {
        await updateMoodEntry(editingMoodId, {
          score: moodScore,
          emotionLabel,
          note: moodNote,
          triggers,
        });
      } else {
        await createMoodEntry(user.uid, {
          score: moodScore,
          emotionLabel,
          note: moodNote,
          triggers,
        });
      }
      setMoodFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save mood log.');
    } finally {
      setMoodBusy(false);
    }
  };

  const openActCreate = () => {
    setEditingActId(null);
    setActType('behavioral_activation');
    setActName('');
    setActDesc('');
    setActDuration(15);
    setActCompleted(true);
    setError(null);
    setActFormOpen(true);
  };

  const openActEdit = (a: ActivityEntry) => {
    setEditingActId(a.id);
    setActType(a.type);
    setActName(a.name);
    setActDesc(a.description || '');
    setActDuration(a.duration);
    setActCompleted(a.completed);
    setError(null);
    setActFormOpen(true);
  };

  const handleActSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setActBusy(true);
    setError(null);
    try {
      const payload = {
        type: actType,
        name: actName,
        description: actDesc,
        duration: actDuration,
        completed: actCompleted,
      };
      if (editingActId) {
        await updateActivityEntry(editingActId, payload);
      } else {
        await createActivityEntry(user.uid, payload);
      }
      setActFormOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save activity.');
    } finally {
      setActBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Mood & Behavioral Activation</h1>
          <p className="text-sm text-slate-600 mt-1">
            Monitor emotional shifts and schedule evidence-based coping activities.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenBreathing}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg cursor-pointer"
          >
            <Wind className="w-4 h-4 text-teal-700" />
            <span>Guided Breathing</span>
          </button>
          <button
            type="button"
            onClick={activeTab === 'moods' ? openMoodCreate : openActCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{activeTab === 'moods' ? 'Log Mood' : 'Log Activity'}</span>
          </button>
        </div>
      </div>

      {/* Tab & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="inline-flex p-1 bg-slate-200/70 rounded-lg self-start">
          <button
            type="button"
            onClick={() => setActiveTab('moods')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'moods'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mood Logs ({moods.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('activities')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer ${
              activeTab === 'activities'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            CBT Activities ({activities.length})
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === 'moods' ? 'Filter moods, notes, triggers...' : 'Filter activities...'
            }
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
          />
        </div>
      </div>

      {error && (
        <div className="px-4 py-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      {/* Mood Form */}
      {activeTab === 'moods' && moodFormOpen && (
        <form
          onSubmit={handleMoodSubmit}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">
              {editingMoodId ? 'Edit Mood Entry' : 'New Mood Entry'}
            </h2>
            <button
              type="button"
              onClick={() => setMoodFormOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span>Mood Score (0-100)</span>
                <span className="font-mono tabular-nums text-teal-800">{moodScore}/100</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={moodScore}
                onChange={(e) => setMoodScore(Number(e.target.value))}
                className="w-full accent-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Primary Emotion
              </label>
              <select
                value={emotionLabel}
                onChange={(e) => setEmotionLabel(e.target.value as EmotionLabel)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              >
                {EMOTION_LABELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Triggers (comma-separated, max 5)
              </label>
              <input
                type="text"
                value={triggersText}
                onChange={(e) => setTriggersText(e.target.value)}
                placeholder="Work, Sleep, Deadline"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Reflection Note
              </label>
              <input
                type="text"
                maxLength={1000}
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                placeholder="Context around how you feel right now..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setMoodFormOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={moodBusy}
              className="px-5 py-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-60 rounded-lg cursor-pointer"
            >
              {moodBusy ? 'Saving...' : editingMoodId ? 'Update Mood' : 'Save Mood'}
            </button>
          </div>
        </form>
      )}

      {/* Activity Form */}
      {activeTab === 'activities' && actFormOpen && (
        <form
          onSubmit={handleActSubmit}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">
              {editingActId ? 'Edit CBT Activity' : 'Log CBT Activity'}
            </h2>
            <button
              type="button"
              onClick={() => setActFormOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Activity Category
              </label>
              <select
                value={actType}
                onChange={(e) => setActType(e.target.value as ActivityType)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              >
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {ACTIVITY_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Activity Name
              </label>
              <input
                required
                type="text"
                maxLength={120}
                value={actName}
                onChange={(e) => setActName(e.target.value)}
                placeholder="e.g., 15-minute afternoon walk without phone"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Duration (minutes)
              </label>
              <input
                type="number"
                min={0}
                max={480}
                value={actDuration}
                onChange={(e) => setActDuration(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={actCompleted}
                  onChange={(e) => setActCompleted(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-teal-700"
                />
                <span>Mark as completed</span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Description / Outcome Notes
              </label>
              <textarea
                rows={2}
                maxLength={1000}
                value={actDesc}
                onChange={(e) => setActDesc(e.target.value)}
                placeholder="How did your energy or mood shift afterward?"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActFormOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actBusy}
              className="px-5 py-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-60 rounded-lg cursor-pointer"
            >
              {actBusy ? 'Saving...' : editingActId ? 'Update Activity' : 'Save Activity'}
            </button>
          </div>
        </form>
      )}

      {/* Moods Table */}
      {activeTab === 'moods' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {filteredMoods.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-medium text-slate-800">No mood entries found</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Record your mood score and triggers to build your personal wellbeing history.
              </p>
              <button
                type="button"
                onClick={openMoodCreate}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg cursor-pointer"
              >
                Log First Mood
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Score</th>
                    <th className="py-3 px-4">Emotion</th>
                    <th className="py-3 px-4">Triggers</th>
                    <th className="py-3 px-4">Note</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredMoods.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap font-mono tabular-nums">
                        {m.timestamp?.toDate?.().toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        }) ?? '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                        {m.score}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">{m.emotionLabel}</td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        {m.triggers?.length ? m.triggers.join(' · ') : '—'}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate">
                        {m.note || '—'}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openMoodEdit(m)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 cursor-pointer"
                          aria-label="Edit mood"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteMoodEntry(m.id)}
                          className="p-1.5 text-red-600 hover:text-red-800 cursor-pointer"
                          aria-label="Delete mood"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Activities Table */}
      {activeTab === 'activities' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {filteredActivities.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-sm font-medium text-slate-800">No CBT activities recorded</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Add mindfulness, physical movement, or behavioral activation tasks.
              </p>
              <button
                type="button"
                onClick={openActCreate}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg cursor-pointer"
              >
                Log First Activity
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Activity</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Duration</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => void toggleActivityComplete(act.id, !act.completed)}
                          className={`inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer ${
                            act.completed ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {act.completed ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Circle className="w-4 h-4" />
                          )}
                          <span>{act.completed ? 'Done' : 'Planned'}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">{act.name}</td>
                      <td className="py-3 px-4 text-xs text-slate-600">
                        {ACTIVITY_TYPE_LABELS[act.type]}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-xs text-slate-700">
                        {act.duration} min
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate">
                        {act.description || '—'}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openActEdit(act)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 cursor-pointer"
                          aria-label="Edit activity"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteActivityEntry(act.id)}
                          className="p-1.5 text-red-600 hover:text-red-800 cursor-pointer"
                          aria-label="Delete activity"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
