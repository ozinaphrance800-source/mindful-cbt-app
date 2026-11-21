import { useState, type FormEvent } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, MessageSquare, Plus, Wind } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createMoodEntry } from '../services/firestoreService';
import {
  ACTIVITY_TYPE_LABELS,
  EMOTION_LABELS,
  type ActivityEntry,
  type AppView,
  type ChatSession,
  type EmotionLabel,
  type MoodEntry,
  type ThoughtRecord,
} from '../types/mindful';

interface OverviewDashboardProps {
  moods: MoodEntry[];
  activities: ActivityEntry[];
  thoughtRecords: ThoughtRecord[];
  chatSessions: ChatSession[];
  loading: boolean;
  onNavigate: (view: AppView) => void;
  onOpenBreathing: () => void;
}

const SUGGESTED_TRIGGERS = ['Work', 'Sleep', 'Family', 'Finances', 'Health', 'Social', 'Overload'];

function formatDateShort(date: Date | undefined): string {
  if (!date) return 'Just now';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function OverviewDashboard({
  moods,
  activities,
  thoughtRecords,
  chatSessions,
  loading,
  onNavigate,
  onOpenBreathing,
}: OverviewDashboardProps) {
  const { user, profile } = useAuth();
  const [score, setScore] = useState(65);
  const [emotionLabel, setEmotionLabel] = useState<EmotionLabel>('Balanced');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [savingMood, setSavingMood] = useState(false);
  const [moodFeedback, setMoodFeedback] = useState<string | null>(null);

  const latestMood = moods[0];
  const recentSeven = moods.slice(0, 7);
  const avgMood =
    recentSeven.length > 0
      ? Math.round(recentSeven.reduce((acc, m) => acc + m.score, 0) / recentSeven.length)
      : null;
  const completedActivities = activities.filter((a) => a.completed).length;

  const chartPoints = [...moods]
    .slice(0, 12)
    .reverse()
    .map((m, idx) => ({
      id: m.id,
      score: m.score,
      emotion: m.emotionLabel,
      label: formatDateShort(m.timestamp?.toDate?.()),
      idx,
    }));

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers((prev) => {
      if (prev.includes(trigger)) return prev.filter((t) => t !== trigger);
      if (prev.length >= 5) return prev;
      return [...prev, trigger];
    });
  };

  const handleQuickMoodSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingMood(true);
    setMoodFeedback(null);
    try {
      await createMoodEntry(user.uid, {
        score,
        emotionLabel,
        note,
        triggers: selectedTriggers,
      });
      setNote('');
      setSelectedTriggers([]);
      setMoodFeedback('Mood check-in saved to your cloud vault.');
    } catch (err) {
      setMoodFeedback(err instanceof Error ? err.message : 'Unable to save mood check-in.');
    } finally {
      setSavingMood(false);
    }
  };

  // Build SVG path for mood chart
  const svgWidth = 640;
  const svgHeight = 180;
  const padX = 28;
  const padY = 20;
  const innerW = svgWidth - padX * 2;
  const innerH = svgHeight - padY * 2;

  const coords = chartPoints.map((pt, i) => {
    const x =
      chartPoints.length <= 1
        ? padX + innerW / 2
        : padX + (i / (chartPoints.length - 1)) * innerW;
    const y = padY + ((100 - pt.score) / 100) * innerH;
    return { ...pt, x, y };
  });

  const linePath = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ');

  return (
    <div className="space-y-8">
      {/* Greeting & Primary Goal */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            Welcome back, {profile?.displayName || 'Member'}
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Focus: {profile?.therapeuticGoal || 'Build steady emotional awareness and balanced thinking.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('sentiment')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <span>Sentiment Analyzer</span>
          </button>
          <button
            type="button"
            onClick={onOpenBreathing}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Wind className="w-4 h-4 text-teal-700" />
            <span>4-7-8 Breathing</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('chat')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Open CBT Therapist</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Latest Mood</p>
          <p className="text-2xl font-semibold font-mono tabular-nums text-slate-900 mt-1">
            {loading ? '—' : latestMood ? `${latestMood.score}/100` : 'No logs'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {latestMood ? `${latestMood.emotionLabel} · ${formatDateShort(latestMood.timestamp?.toDate?.())}` : 'Log your first check-in'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Recent Average</p>
          <p className="text-2xl font-semibold font-mono tabular-nums text-slate-900 mt-1">
            {loading ? '—' : avgMood !== null ? `${avgMood}/100` : '—'}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
            Last {recentSeven.length} check-in{recentSeven.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">CBT Activities</p>
          <p className="text-2xl font-semibold font-mono tabular-nums text-slate-900 mt-1">
            {loading ? '—' : completedActivities}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Completed exercises
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Thought Records</p>
          <p className="text-2xl font-semibold font-mono tabular-nums text-slate-900 mt-1">
            {loading ? '—' : thoughtRecords.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Reframed worksheets
          </p>
        </div>
      </div>

      {/* Main Split: Mood Trajectory + Quick Check-In */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Trajectory Chart */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Mood Trajectory</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Recent self-reported wellbeing scores (0-100)
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('wellness')}
              className="text-xs font-medium text-teal-800 hover:underline whitespace-nowrap cursor-pointer"
            >
              View all logs
            </button>
          </div>

          {chartPoints.length === 0 ? (
            <div className="h-48 border border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center text-center px-6">
              <p className="text-sm font-medium text-slate-700">No mood entries recorded yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Use the Quick Check-In form to record your baseline mood and begin tracking trends.
              </p>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-48 overflow-visible"
                role="img"
                aria-label="Mood score trend chart"
              >
                {[0, 25, 50, 75, 100].map((tick) => {
                  const y = padY + ((100 - tick) / 100) * innerH;
                  return (
                    <g key={tick}>
                      <line
                        x1={padX}
                        y1={y}
                        x2={svgWidth - padX}
                        y2={y}
                        stroke="#E2E8F0"
                        strokeDasharray={tick === 50 ? '4 4' : undefined}
                      />
                      <text
                        x={padX - 8}
                        y={y + 4}
                        textAnchor="end"
                        className="fill-slate-400 text-[10px] font-mono"
                      >
                        {tick}
                      </text>
                    </g>
                  );
                })}

                {coords.length > 1 && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="#0F766E"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {coords.map((pt) => (
                  <g key={pt.id}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4.5"
                      className="fill-white stroke-teal-700"
                      strokeWidth="2.5"
                    />
                    <title>{`${pt.label}: ${pt.score}/100 (${pt.emotion})`}</title>
                    <text
                      x={pt.x}
                      y={svgHeight - 2}
                      textAnchor="middle"
                      className="fill-slate-400 text-[10px]"
                    >
                      {pt.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          )}
        </div>

        {/* Quick Mood Check-In */}
        <form
          onSubmit={handleQuickMoodSubmit}
          className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900">Quick Mood Check-In</h2>
            <span className="font-mono tabular-nums text-sm font-semibold text-teal-800">
              {score} / 100
            </span>
          </div>

          <div>
            <label htmlFor="quick-mood-slider" className="sr-only">
              Mood score
            </label>
            <input
              id="quick-mood-slider"
              type="range"
              min={0}
              max={100}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="w-full accent-teal-700 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>0 · Very Low</span>
              <span>50 · Neutral</span>
              <span>100 · Thriving</span>
            </div>
          </div>

          <div>
            <label htmlFor="quick-emotion" className="block text-xs font-medium text-slate-700 mb-1.5">
              Primary Emotion
            </label>
            <select
              id="quick-emotion"
              value={emotionLabel}
              onChange={(e) => setEmotionLabel(e.target.value as EmotionLabel)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
            >
              {EMOTION_LABELS.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-700 mb-1.5">
              Triggers (up to 5)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_TRIGGERS.map((trigger) => {
                const active = selectedTriggers.includes(trigger);
                return (
                  <button
                    key={trigger}
                    type="button"
                    onClick={() => toggleTrigger(trigger)}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                      active
                        ? 'bg-teal-700 text-white border-teal-700'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {trigger}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="quick-note" className="block text-xs font-medium text-slate-700 mb-1.5">
              Brief Reflection (Optional)
            </label>
            <textarea
              id="quick-note"
              rows={2}
              maxLength={1000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What happened or what is on your mind?"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700 resize-none"
            />
          </div>

          {moodFeedback && (
            <p className="text-xs text-teal-800 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2">
              {moodFeedback}
            </p>
          )}

          <button
            type="submit"
            disabled={savingMood}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{savingMood ? 'Saving...' : 'Save Check-In'}</span>
          </button>
        </form>
      </div>

      {/* Bottom Two Columns: Recent Therapy Sessions + Recent CBT Activities & Thought Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Recent Therapy Sessions</h2>
            <button
              type="button"
              onClick={() => onNavigate('chat')}
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-800 hover:underline cursor-pointer"
            >
              <span>Open Chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {chatSessions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-600 mb-3">
                You have not started a CBT dialogue session yet.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('chat')}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg cursor-pointer"
              >
                Start First Session
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {chatSessions.slice(0, 4).map((session) => (
                <li key={session.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{session.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">
                      {session.primaryTechnique} · {session.messageCount} messages · {session.status}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('chat')}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md shrink-0 cursor-pointer"
                  >
                    Resume
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Recent CBT Activities</h2>
            <button
              type="button"
              onClick={() => onNavigate('thoughts')}
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-800 hover:underline cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Thought Records</span>
            </button>
          </div>

          {activities.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-600 mb-3">
                Log behavioral activation tasks, mindfulness, or breathing exercises.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('wellness')}
                className="px-4 py-2 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg cursor-pointer"
              >
                Log First Activity
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {activities.slice(0, 4).map((act) => (
                <li key={act.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{act.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {ACTIVITY_TYPE_LABELS[act.type]} · {act.duration} min
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium shrink-0 ${
                      act.completed ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{act.completed ? 'Completed' : 'Planned'}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
