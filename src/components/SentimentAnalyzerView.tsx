import { useState, type FormEvent } from 'react';
import {
  Activity,
  ArrowRight,
  BookmarkCheck,
  BookOpen,
  MessageSquare,
  PhoneCall,
  Search,
  Sparkles,
  Trash2,
  Wind,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  createMoodEntry,
  createSentimentAnalysis,
  deleteSentimentAnalysis,
} from '../services/firestoreService';
import {
  EMOTION_LABELS,
  type AppView,
  type EmotionLabel,
  type MoodEntry,
  type SentimentAnalysis,
  type SentimentApiResponse,
  type SentimentType,
} from '../types/mindful';

interface SentimentAnalyzerViewProps {
  analyses: SentimentAnalysis[];
  moods: MoodEntry[];
  onNavigate: (view: AppView) => void;
  onOpenBreathing: () => void;
}

const SAMPLE_TEXTS = [
  'I finally finished my project ahead of time and feel proud of how calmly I handled the pressure.',
  'I have three meetings back to back and feel like if one thing slips, the entire week will collapse.',
  'Today felt flat and exhausting, though getting outside for ten minutes helped a little.',
];

const SENTIMENT_STYLES: Record<
  SentimentType,
  { label: string; badge: string; bar: string }
> = {
  positive: {
    label: 'Positive',
    badge: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    bar: 'bg-emerald-600',
  },
  neutral: {
    label: 'Neutral',
    badge: 'text-slate-700 bg-slate-100 border-slate-200',
    bar: 'bg-slate-500',
  },
  negative: {
    label: 'Negative',
    badge: 'text-amber-800 bg-amber-50 border-amber-200',
    bar: 'bg-amber-600',
  },
  distressed: {
    label: 'Distressed',
    badge: 'text-orange-800 bg-orange-50 border-orange-200',
    bar: 'bg-orange-600',
  },
  crisis: {
    label: 'Crisis Alert',
    badge: 'text-red-800 bg-red-50 border-red-200',
    bar: 'bg-red-600',
  },
};

function mapEmotionToMoodLabel(emotion: string, sentiment: SentimentType): EmotionLabel {
  const lower = emotion.toLowerCase();
  const match = EMOTION_LABELS.find((l) => l.toLowerCase() === lower);
  if (match) return match;
  if (sentiment === 'positive') return 'Hopeful';
  if (sentiment === 'neutral') return 'Balanced';
  if (sentiment === 'distressed' || sentiment === 'crisis') return 'Overwhelmed';
  return 'Stressed';
}

export function SentimentAnalyzerView({
  analyses,
  moods,
  onNavigate,
  onOpenBreathing,
}: SentimentAnalyzerViewProps) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SentimentApiResponse | null>(null);
  const [analyzedText, setAnalyzedText] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | SentimentType>('all');
  const [search, setSearch] = useState('');

  const runAnalysis = async (inputToAnalyze: string) => {
    const trimmed = inputToAnalyze.trim();
    if (!trimmed || analyzing) return;

    setAnalyzing(true);
    setError(null);
    setSavedNotice(null);

    try {
      const response = await fetch('/api/cbt/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: trimmed }),
      });
      const data = (await response.json()) as SentimentApiResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || 'Sentiment analysis failed.');
      }
      setResult(data);
      setAnalyzedText(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to analyze text.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void runAnalysis(text);
  };

  const handleSaveAnalysis = async (alsoLogMood: boolean) => {
    if (!user || !result || !analyzedText) return;
    setSaving(true);
    setError(null);
    setSavedNotice(null);
    try {
      await createSentimentAnalysis(user.uid, {
        inputText: analyzedText,
        sentiment: result.sentiment,
        valenceScore: result.valenceScore,
        confidence: result.confidence,
        primaryEmotion: result.primaryEmotion,
        detectedDistortion: result.detectedDistortion,
        keyPhrases: result.keyPhrases,
        cbtInsight: result.cbtInsight,
        suggestedAction: result.suggestedAction,
        crisisDetected: result.crisisDetected,
        responseTimeMs: result.responseTimeMs,
      });

      if (alsoLogMood) {
        await createMoodEntry(user.uid, {
          score: result.valenceScore,
          emotionLabel: mapEmotionToMoodLabel(result.primaryEmotion, result.sentiment),
          note: analyzedText.slice(0, 500),
          triggers: result.keyPhrases.slice(0, 3),
        });
        setSavedNotice('Saved to Sentiment History and logged as a Mood Check-In.');
      } else {
        setSavedNotice('Saved to your Sentiment History in Firestore.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save sentiment analysis.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await deleteSentimentAnalysis(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete entry.');
    }
  };

  const filteredHistory = analyses.filter((item) => {
    if (historyFilter !== 'all' && item.sentiment !== historyFilter) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      item.inputText.toLowerCase().includes(q) ||
      item.primaryEmotion.toLowerCase().includes(q) ||
      item.detectedDistortion.toLowerCase().includes(q)
    );
  });

  const avgValence =
    analyses.length > 0
      ? Math.round(analyses.reduce((sum, a) => sum + a.valenceScore, 0) / analyses.length)
      : null;

  const style = result ? SENTIMENT_STYLES[result.sentiment] : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Sentiment Analyzer</h1>
          <p className="text-sm text-slate-600 mt-1">
            Fast clinical NLP analysis of emotional valence, primary feelings, and CBT cognitive
            patterns.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>
            Saved Analyses:{' '}
            <strong className="font-mono tabular-nums text-slate-900">{analyses.length}</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Avg Valence:{' '}
            <strong className="font-mono tabular-nums text-slate-900">
              {avgValence !== null ? `${avgValence}/100` : '—'}
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            Mood Logs:{' '}
            <strong className="font-mono tabular-nums text-slate-900">{moods.length}</strong>
          </span>
        </div>
      </div>

      {/* Main Split: Analyzer Input + Structured Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-slate-900">Analyze Reflection or Note</h2>
            <span className="text-xs font-mono tabular-nums text-slate-400">
              {text.length}/2000
            </span>
          </div>

          <textarea
            rows={5}
            maxLength={2000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                void runAnalysis(text);
              }
            }}
            placeholder="Paste a journal note, thought, or message to analyze its emotional tone, valence score, and cognitive distortions..."
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-700 resize-none"
          />

          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-500">Quick Examples</p>
            <div className="space-y-1.5">
              {SAMPLE_TEXTS.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setText(sample);
                    void runAnalysis(sample);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-600 bg-slate-50 hover:bg-teal-50/70 border border-slate-200 hover:border-teal-200 rounded-lg transition-colors cursor-pointer"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="px-3 py-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-xs text-slate-400">Ctrl/Cmd + Enter to analyze</span>
            <button
              type="submit"
              disabled={analyzing || !text.trim()}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{analyzing ? 'Analyzing...' : 'Analyze Sentiment'}</span>
            </button>
          </div>
        </form>

        {/* Live Analysis Result */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6">
          {!result && !analyzing ? (
            <div className="py-16 text-center space-y-2">
              <Activity className="w-8 h-8 text-slate-300 mx-auto" />
              <h2 className="text-base font-semibold text-slate-900">Ready to Analyze</h2>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Enter any thought or select a sample on the left to inspect sentiment polarity,
                valence (0–100), emotion spectrum, and cognitive patterns.
              </p>
            </div>
          ) : analyzing && !result ? (
            <div className="py-16 text-center space-y-2">
              <p className="text-sm font-medium text-slate-700">Running sentiment analysis...</p>
              <p className="text-xs text-slate-500">Measuring valence, emotion spectrum, and CBT cues</p>
            </div>
          ) : (
            result &&
            style && (
              <div className="space-y-5">
                {result.crisisDetected && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <PhoneCall className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                    <div className="text-xs text-red-900 leading-relaxed">
                      <p className="font-semibold text-red-950">Crisis Support Resources</p>
                      <p className="mt-0.5">
                        If you feel unsafe, please call or text <strong>988</strong> (US/Canada),
                        text <strong>HOME to 741741</strong>, or visit{' '}
                        <strong>findahelpline.com</strong>.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold border rounded-md ${style.badge}`}
                    >
                      {style.label}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {result.primaryEmotion}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-mono tabular-nums">
                    <span>Confidence {result.confidence}%</span>
                    <span aria-hidden="true">·</span>
                    <span>{result.responseTimeMs} ms</span>
                  </div>
                </div>

                {/* Valence Meter */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">Emotional Valence</span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900">
                      {result.valenceScore} / 100
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${style.bar}`}
                      style={{ width: `${result.valenceScore}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>0 · Distressed</span>
                    <span>50 · Neutral</span>
                    <span>100 · Positive</span>
                  </div>
                </div>

                {/* Emotion Spectrum */}
                {result.emotionBreakdown.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-700">Emotion Spectrum</p>
                    <div className="space-y-2">
                      {result.emotionBreakdown.map((slice) => (
                        <div key={slice.label} className="grid grid-cols-12 items-center gap-3 text-xs">
                          <span className="col-span-4 text-slate-600 truncate">{slice.label}</span>
                          <div className="col-span-6 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-teal-700 rounded-full"
                              style={{ width: `${slice.score}%` }}
                            />
                          </div>
                          <span className="col-span-2 text-right font-mono tabular-nums text-slate-700">
                            {slice.score}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Distortion + Key Phrases */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
                  <div>
                    <p className="font-medium text-slate-500 mb-1">Cognitive Distortion Check</p>
                    <p className="font-semibold text-slate-900">{result.detectedDistortion}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-500 mb-1">Key Emotional Cues</p>
                    <p className="text-slate-700">
                      {result.keyPhrases.length > 0 ? result.keyPhrases.join(' · ') : 'None extracted'}
                    </p>
                  </div>
                </div>

                {/* CBT Insight */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-700 leading-relaxed">
                  <p className="font-semibold text-slate-900 mb-1">CBT Reframing Insight</p>
                  <p>{result.cbtInsight}</p>
                </div>

                {savedNotice && (
                  <p className="text-xs text-teal-800 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2">
                    {savedNotice}
                  </p>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void handleSaveAnalysis(false)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 rounded-lg cursor-pointer"
                  >
                    <BookmarkCheck className="w-3.5 h-3.5" />
                    <span>{saving ? 'Saving...' : 'Save to Cloud'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void handleSaveAnalysis(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 disabled:opacity-50 rounded-lg cursor-pointer"
                  >
                    <span>Save & Log Mood</span>
                  </button>

                  {result.suggestedAction === 'breathing' && (
                    <button
                      type="button"
                      onClick={onOpenBreathing}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-teal-800 bg-teal-50 border border-teal-200 rounded-lg ml-auto cursor-pointer"
                    >
                      <Wind className="w-3.5 h-3.5" />
                      <span>4-7-8 Breathing</span>
                    </button>
                  )}

                  {result.suggestedAction === 'thought_record' && (
                    <button
                      type="button"
                      onClick={() => onNavigate('thoughts')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-teal-800 bg-teal-50 border border-teal-200 rounded-lg ml-auto cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Thought Record</span>
                    </button>
                  )}

                  {(result.suggestedAction === 'chat' || result.suggestedAction === 'none') && (
                    <button
                      type="button"
                      onClick={() => onNavigate('chat')}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-teal-800 bg-teal-50 border border-teal-200 rounded-lg ml-auto cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Discuss in CBT Chat</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Saved Sentiment Analyses History */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(['all', 'positive', 'neutral', 'negative', 'distressed', 'crisis'] as const).map(
              (filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setHistoryFilter(filter)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer ${
                    historyFilter === filter
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {filter}
                </button>
              )
            )}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search saved analyses..."
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-700"
            />
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-800">No saved sentiment analyses yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Analyze a reflection above and click Save to Cloud to track emotional shifts over time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredHistory.map((item) => {
              const itemStyle = SENTIMENT_STYLES[item.sentiment];
              return (
                <div
                  key={item.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:bg-slate-50/70"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`px-2 py-0.5 font-semibold border rounded ${itemStyle.badge}`}>
                        {itemStyle.label}
                      </span>
                      <span className="font-medium text-slate-900">{item.primaryEmotion}</span>
                      <span className="text-slate-400" aria-hidden="true">
                        ·
                      </span>
                      <span className="font-mono tabular-nums text-slate-600">
                        Valence {item.valenceScore}/100
                      </span>
                      {item.detectedDistortion && item.detectedDistortion !== 'None Identified' && (
                        <>
                          <span className="text-slate-400" aria-hidden="true">
                            ·
                          </span>
                          <span className="text-slate-600">{item.detectedDistortion}</span>
                        </>
                      )}
                      <span className="text-slate-400" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-slate-400 font-mono tabular-nums">
                        {item.createdAt?.toDate?.().toLocaleString() ?? 'Just now'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-800">{item.inputText}</p>
                    {item.cbtInsight && (
                      <p className="text-xs text-slate-500">{item.cbtInsight}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleDelete(item.id)}
                    className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
