import { useState, type FormEvent } from 'react';
import { BookOpen, Edit3, Plus, Search, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  createThoughtRecord,
  deleteThoughtRecord,
  updateThoughtRecord,
} from '../services/firestoreService';
import {
  COGNITIVE_DISTORTIONS,
  type CognitiveDistortion,
  type ThoughtRecord,
} from '../types/mindful';

interface ThoughtRecordsViewProps {
  records: ThoughtRecord[];
}

const EMPTY_FORM = {
  situation: '',
  automaticThought: '',
  distortion: 'Catastrophizing' as CognitiveDistortion,
  emotionIntensityBefore: 70,
  evidenceFor: '',
  evidenceAgainst: '',
  balancedThought: '',
  emotionIntensityAfter: 35,
};

export function ThoughtRecordsView({ records }: ThoughtRecordsViewProps) {
  const { user } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [distortionFilter, setDistortionFilter] = useState<string>('all');

  const filtered = records.filter((rec) => {
    const matchesFilter =
      distortionFilter === 'all' || rec.distortion === distortionFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      rec.situation.toLowerCase().includes(q) ||
      rec.automaticThought.toLowerCase().includes(q) ||
      rec.balancedThought.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setFormOpen(true);
  };

  const openEdit = (record: ThoughtRecord) => {
    setEditingId(record.id);
    setForm({
      situation: record.situation,
      automaticThought: record.automaticThought,
      distortion: record.distortion,
      emotionIntensityBefore: record.emotionIntensityBefore,
      evidenceFor: record.evidenceFor,
      evidenceAgainst: record.evidenceAgainst,
      balancedThought: record.balancedThought,
      emotionIntensityAfter: record.emotionIntensityAfter,
    });
    setError(null);
    setFormOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await updateThoughtRecord(editingId, form);
      } else {
        await createThoughtRecord(user.uid, form);
      }
      setFormOpen(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save thought record.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteThoughtRecord(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete thought record.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">CBT Thought Records</h1>
          <p className="text-sm text-slate-600 mt-1">
            Examine automatic thoughts, weigh objective evidence, and build balanced alternatives.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Thought Record</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search situations, automatic thoughts, or reframes..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
          />
        </div>
        <select
          value={distortionFilter}
          onChange={(e) => setDistortionFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
        >
          <option value="all">All Distortions</option>
          {COGNITIVE_DISTORTIONS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Create / Edit Drawer Form */}
      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-xl p-6 space-y-5"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">
              {editingId ? 'Edit Thought Record' : '7-Step Thought Restructuring Worksheet'}
            </h2>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              aria-label="Close form"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                1. Situation / Trigger
              </label>
              <textarea
                required
                rows={3}
                maxLength={500}
                value={form.situation}
                onChange={(e) => setForm({ ...form, situation: e.target.value })}
                placeholder="Where were you, and what happened?"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                2. Automatic Negative Thought
              </label>
              <textarea
                required
                rows={3}
                maxLength={500}
                value={form.automaticThought}
                onChange={(e) => setForm({ ...form, automaticThought: e.target.value })}
                placeholder="What went through your mind in that moment?"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                3. Cognitive Distortion Pattern
              </label>
              <select
                value={form.distortion}
                onChange={(e) =>
                  setForm({ ...form, distortion: e.target.value as CognitiveDistortion })
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              >
                {COGNITIVE_DISTORTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span>4. Distress Intensity Before</span>
                <span className="font-mono tabular-nums">{form.emotionIntensityBefore}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={form.emotionIntensityBefore}
                onChange={(e) =>
                  setForm({ ...form, emotionIntensityBefore: Number(e.target.value) })
                }
                className="w-full accent-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                5. Evidence Supporting the Thought
              </label>
              <textarea
                rows={2}
                maxLength={500}
                value={form.evidenceFor}
                onChange={(e) => setForm({ ...form, evidenceFor: e.target.value })}
                placeholder="Objective facts that support this thought..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                6. Evidence Against the Thought
              </label>
              <textarea
                rows={2}
                maxLength={500}
                value={form.evidenceAgainst}
                onChange={(e) => setForm({ ...form, evidenceAgainst: e.target.value })}
                placeholder="Facts or past experiences that contradict the thought..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                7. Balanced Alternative Thought
              </label>
              <textarea
                required
                rows={2}
                maxLength={500}
                value={form.balancedThought}
                onChange={(e) => setForm({ ...form, balancedThought: e.target.value })}
                placeholder="A more realistic, compassionate way to view the situation..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <span>Distress Intensity After Reframing</span>
                <span className="font-mono tabular-nums text-teal-800">
                  {form.emotionIntensityAfter}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={form.emotionIntensityAfter}
                onChange={(e) =>
                  setForm({ ...form, emotionIntensityAfter: Number(e.target.value) })
                }
                className="w-full accent-teal-700"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-60 rounded-lg cursor-pointer"
            >
              {saving ? 'Saving...' : editingId ? 'Update Worksheet' : 'Save Thought Record'}
            </button>
          </div>
        </form>
      )}

      {/* Records List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-slate-900">No thought records match</h2>
          <p className="text-sm text-slate-500 mt-1 mb-5">
            Capture an automatic thought to practice cognitive restructuring and track distress
            relief over time.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="px-4 py-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg cursor-pointer"
          >
            Create Thought Record
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((rec) => {
            const delta = rec.emotionIntensityBefore - rec.emotionIntensityAfter;
            return (
              <article
                key={rec.id}
                className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-semibold text-slate-800">{rec.distortion}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      Distress: {rec.emotionIntensityBefore}% → {rec.emotionIntensityAfter}%
                    </span>
                    {delta > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-emerald-700 font-medium font-mono tabular-nums">
                          -{delta}% relief
                        </span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span>
                      {rec.createdAt?.toDate?.().toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }) ?? 'Saved'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(rec)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(rec.id)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-red-700 hover:text-red-900 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Situation</p>
                    <p className="text-slate-800 leading-relaxed">{rec.situation}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Automatic Thought</p>
                    <p className="text-slate-800 leading-relaxed">{rec.automaticThought}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-teal-800 mb-1">Balanced Alternative</p>
                    <p className="text-slate-900 font-medium leading-relaxed">
                      {rec.balancedThought}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
