import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  Activity,
  Archive,
  BookOpen,
  Check,
  Edit3,
  MessageSquarePlus,
  PhoneCall,
  Send,
  Trash2,
  Wind,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  appendChatExchange,
  createChatSession,
  deleteChatSessionWithMessages,
  renameChatSession,
  subscribeChatMessages,
  updateChatSessionStatus,
} from '../services/firestoreService';
import type {
  AppView,
  ChatApiResponse,
  ChatMessage,
  ChatSession,
  MoodEntry,
  SentimentType,
} from '../types/mindful';

interface TherapistChatProps {
  sessions: ChatSession[];
  moods: MoodEntry[];
  onNavigate: (view: AppView) => void;
  onOpenBreathing: () => void;
}

const STARTER_PROMPTS = [
  'I feel overwhelmed by upcoming deadlines and keep expecting the worst.',
  'I had a tense conversation today and I keep replaying it in my head.',
  'I have been feeling low energy and avoiding tasks I usually care about.',
];

interface StreamMetadata {
  sentiment: SentimentType;
  emotion: string;
  cbtTechnique: string;
  detectedDistortion: string;
  cbtGoal: string;
  suggestedAction: ChatApiResponse['suggestedAction'];
  crisisDetected: boolean;
}

export function TherapistChat({
  sessions,
  moods,
  onNavigate,
  onOpenBreathing,
}: TherapistChatProps) {
  const { user, profile } = useAuth();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('all');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [pendingUserText, setPendingUserText] = useState<string | null>(null);
  const [streamingReply, setStreamingReply] = useState('');
  const [streamingMeta, setStreamingMeta] = useState<StreamMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestedAction, setSuggestedAction] = useState<ChatApiResponse['suggestedAction']>('none');
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const filteredSessions = sessions.filter((s) =>
    statusFilter === 'all' ? true : s.status === statusFilter
  );

  useEffect(() => {
    if (!selectedSessionId && sessions.length > 0) {
      setSelectedSessionId(sessions[0].id);
    } else if (selectedSessionId && !sessions.some((s) => s.id === selectedSessionId)) {
      setSelectedSessionId(sessions[0]?.id ?? null);
    }
  }, [sessions, selectedSessionId]);

  const activeSession = sessions.find((s) => s.id === selectedSessionId) ?? null;

  useEffect(() => {
    if (!user || !selectedSessionId) {
      setMessages([]);
      return;
    }
    const unsub = subscribeChatMessages(user.uid, selectedSessionId, (msgs) => {
      setMessages(msgs);
    });
    return () => unsub();
  }, [user, selectedSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, pendingUserText, streamingReply]);

  const handleNewSession = async () => {
    if (!user) return;
    setError(null);
    setSuggestedAction('none');
    try {
      const newId = await createChatSession(user.uid);
      setSelectedSessionId(newId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create session.');
    }
  };

  const handleSaveRename = async (sessionId: string) => {
    if (!titleDraft.trim()) {
      setEditingTitleId(null);
      return;
    }
    try {
      await renameChatSession(sessionId, titleDraft);
      setEditingTitleId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not rename session.');
    }
  };

  const handleStatusChange = async (sessionId: string, status: 'completed' | 'archived') => {
    setError(null);
    try {
      await updateChatSessionStatus(sessionId, status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update session status.');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!user) return;
    setError(null);
    try {
      await deleteChatSessionWithMessages(user.uid, sessionId);
      if (selectedSessionId === sessionId) {
        setSelectedSessionId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete session.');
    }
  };

  const sendMessage = async (textToSend: string) => {
    if (!user) return;
    const trimmed = textToSend.trim();
    if (!trimmed || sending) return;

    setError(null);
    setSending(true);
    setInput('');
    setPendingUserText(trimmed);
    setStreamingReply('');
    setStreamingMeta(null);

    try {
      let targetSession = activeSession;
      let targetSessionId = selectedSessionId;

      const sessionPromise =
        !targetSessionId || !targetSession || targetSession.status !== 'active'
          ? createChatSession(
              user.uid,
              trimmed.slice(0, 48) + (trimmed.length > 48 ? '...' : '')
            ).then((newId) => {
              targetSessionId = newId;
              setSelectedSessionId(newId);
              return newId;
            })
          : Promise.resolve(targetSessionId);

      const recentMoodSummary =
        moods.length > 0
          ? moods
              .slice(0, 3)
              .map((m) => `${m.score}/100 (${m.emotionLabel})`)
              .join(', ')
          : '';

      const historyPayload =
        targetSession && targetSession.id === targetSessionId
          ? messages.slice(-10).map((m) => ({ role: m.role, content: m.content }))
          : [];

      const response = await fetch('/api/cbt/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload,
          recentMoodSummary,
          therapeuticGoal: profile?.therapeuticGoal ?? '',
        }),
      });

      if (!response.ok || !response.body) {
        const fallbackErr = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(fallbackErr.error || 'CBT Therapist service failed to respond.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let donePayload: ChatApiResponse | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const frames = buffer.split('\n\n');
        buffer = frames.pop() ?? '';

        for (const frame of frames) {
          const lines = frame.split('\n');
          let eventType = 'message';
          let dataStr = '';

          for (const line of lines) {
            if (line.startsWith('event:')) eventType = line.slice(6).trim();
            else if (line.startsWith('data:')) dataStr += line.slice(5).trim();
          }

          if (!dataStr) continue;
          const payload = JSON.parse(dataStr);

          if (eventType === 'delta' && typeof payload.text === 'string') {
            setStreamingReply((prev) => prev + payload.text);
          } else if (eventType === 'metadata') {
            setStreamingMeta(payload as StreamMetadata);
          } else if (eventType === 'done') {
            donePayload = payload as ChatApiResponse;
          } else if (eventType === 'error') {
            throw new Error(payload.error || 'Streaming error from CBT service.');
          }
        }
      }

      if (!donePayload) {
        throw new Error('Incomplete response received from CBT service.');
      }

      const resolvedSessionId = await sessionPromise;
      await appendChatExchange({
        uid: user.uid,
        sessionId: resolvedSessionId,
        currentMessageCount:
          targetSession && targetSession.id === resolvedSessionId ? targetSession.messageCount : 0,
        userContent: trimmed,
        assistantReply: donePayload.reply,
        sentiment: donePayload.sentiment,
        emotion: donePayload.emotion,
        cbtTechnique: donePayload.cbtTechnique,
        cbtGoal: donePayload.cbtGoal,
        detectedDistortion: donePayload.detectedDistortion,
        crisisDetected: donePayload.crisisDetected,
        responseTimeMs: donePayload.responseTimeMs,
      });

      setSuggestedAction(donePayload.suggestedAction);
      setPendingUserText(null);
      setStreamingReply('');
      setStreamingMeta(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send message.');
      setPendingUserText(null);
      setStreamingReply('');
      setStreamingMeta(null);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const hasCrisisAlert =
    activeSession?.lastSentiment === 'crisis' ||
    streamingMeta?.crisisDetected ||
    messages.some((m) => m.crisisDetected);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-9.5rem)] min-h-[560px]">
      {/* Left Session List */}
      <aside className="lg:col-span-4 xl:col-span-3 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">Therapy Sessions</h2>
            <button
              type="button"
              onClick={handleNewSession}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg">
            {(['all', 'active', 'completed', 'archived'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`py-1 text-[11px] font-medium rounded-md capitalize transition-colors cursor-pointer ${
                  statusFilter === status
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredSessions.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              No {statusFilter === 'all' ? '' : statusFilter} sessions yet. Click New to begin a
              CBT conversation.
            </div>
          ) : (
            filteredSessions.map((session) => {
              const isSelected = session.id === selectedSessionId;
              return (
                <div
                  key={session.id}
                  className={`p-3.5 transition-colors ${
                    isSelected ? 'bg-teal-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  {editingTitleId === session.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={titleDraft}
                        maxLength={120}
                        onChange={(e) => setTitleDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') void handleSaveRename(session.id);
                          if (e.key === 'Escape') setEditingTitleId(null);
                        }}
                        className="flex-1 px-2 py-1 text-xs border border-slate-300 rounded bg-white"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => void handleSaveRename(session.id)}
                        className="p-1 text-teal-700 hover:text-teal-900 cursor-pointer"
                        aria-label="Save title"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedSessionId(session.id)}
                      className="w-full text-left cursor-pointer"
                    >
                      <p className="text-sm font-medium text-slate-900 truncate">{session.title}</p>
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        {session.primaryTechnique} ·{' '}
                        <span className="font-mono tabular-nums">{session.messageCount}</span> msgs ·{' '}
                        <span className="capitalize">{session.lastSentiment}</span>
                      </p>
                    </button>
                  )}

                  {isSelected && editingTitleId !== session.id && (
                    <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-slate-200/70">
                      {session.status !== 'archived' && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTitleId(session.id);
                            setTitleDraft(session.title);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Rename</span>
                        </button>
                      )}
                      {session.status === 'active' && (
                        <button
                          type="button"
                          onClick={() => void handleStatusChange(session.id, 'completed')}
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>Complete</span>
                        </button>
                      )}
                      {session.status !== 'archived' && (
                        <button
                          type="button"
                          onClick={() => void handleStatusChange(session.id, 'archived')}
                          className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 cursor-pointer"
                        >
                          <Archive className="w-3 h-3" />
                          <span>Archive</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => void handleDeleteSession(session.id)}
                        className="inline-flex items-center gap-1 text-[11px] text-red-700 hover:text-red-900 ml-auto cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Dialogue Canvas */}
      <section className="lg:col-span-8 xl:col-span-9 bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden">
        {/* Session Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-slate-900 truncate">
              {activeSession ? activeSession.title : 'Mindful CBT Companion'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {activeSession
                ? `${activeSession.primaryTechnique} · Sentiment: ${activeSession.lastSentiment} · ${activeSession.currentGoal}`
                : 'Fast CBT dialogue with live sentiment & distortion detection'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('sentiment')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-teal-700" />
              <span>Sentiment</span>
            </button>
            <button
              type="button"
              onClick={onOpenBreathing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
            >
              <Wind className="w-3.5 h-3.5 text-teal-700" />
              <span>Breathing</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('thoughts')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-teal-700" />
              <span>Thought Record</span>
            </button>
          </div>
        </div>

        {/* Crisis Escalation Banner */}
        {hasCrisisAlert && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <PhoneCall className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
            <div className="text-xs text-red-900 leading-relaxed">
              <p className="font-semibold text-sm text-red-950 mb-1">
                Immediate Human Crisis Support Available
              </p>
              <p>
                Mindful is an AI companion and cannot provide crisis intervention. If you feel
                unsafe or are thinking about self-harm, please call or text{' '}
                <strong>988</strong> (US & Canada), text <strong>HOME to 741741</strong>, call local
                emergency services, or visit <strong>findahelpline.com</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {messages.length === 0 && !pendingUserText ? (
            <div className="max-w-xl mx-auto py-8 text-center">
              <h2 className="text-base font-semibold text-slate-900 mb-2">
                Share what is on your mind today
              </h2>
              <p className="text-sm text-slate-600 mb-6">
                Mindful responds in real time with empathetic CBT reflection and automatic
                sentiment analysis.
              </p>
              <div className="space-y-2 text-left">
                {STARTER_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => void sendMessage(prompt)}
                    disabled={sending}
                    className="w-full px-4 py-3 text-sm text-slate-700 bg-slate-50 hover:bg-teal-50/60 border border-slate-200 hover:border-teal-300 rounded-lg transition-colors text-left cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-2xl rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-50 border border-slate-200 text-slate-800'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {msg.role === 'assistant' && (
                    <div className="mt-1.5 px-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                      <span className="capitalize">Sentiment: {msg.sentiment}</span>
                      <span aria-hidden="true">·</span>
                      <span>Emotion: {msg.emotion}</span>
                      <span aria-hidden="true">·</span>
                      <span>{msg.cbtTechnique}</span>
                      {msg.detectedDistortion && msg.detectedDistortion !== 'None Identified' && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>Pattern: {msg.detectedDistortion}</span>
                        </>
                      )}
                      {msg.responseTimeMs > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            {(msg.responseTimeMs / 1000).toFixed(2)}s
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Instant Optimistic User Message */}
              {pendingUserText && (
                <div className="flex flex-col items-end">
                  <div className="max-w-2xl rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap bg-teal-700 text-white">
                    {pendingUserText}
                  </div>
                </div>
              )}

              {/* Live Streaming Assistant Bubble */}
              {sending && (
                <div className="flex flex-col items-start">
                  <div className="max-w-2xl rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap bg-slate-50 border border-slate-200 text-slate-800">
                    {streamingReply || 'Thinking...'}
                  </div>
                  {streamingMeta && (
                    <div className="mt-1.5 px-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500">
                      <span className="capitalize">Sentiment: {streamingMeta.sentiment}</span>
                      <span aria-hidden="true">·</span>
                      <span>Emotion: {streamingMeta.emotion}</span>
                      <span aria-hidden="true">·</span>
                      <span>{streamingMeta.cbtTechnique}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {suggestedAction !== 'none' && !sending && (
            <div className="flex items-center justify-between gap-4 bg-teal-50/70 border border-teal-200 rounded-lg px-4 py-2.5">
              <span className="text-xs font-medium text-teal-900">
                {suggestedAction === 'thought_record'
                  ? 'Suggested exercise: Capture this thought in a structured 7-step Thought Record.'
                  : suggestedAction === 'breathing'
                    ? 'Suggested exercise: Take two minutes for paced 4-7-8 breathing.'
                    : 'Suggested exercise: Schedule a small behavioral activation step.'}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (suggestedAction === 'breathing') onOpenBreathing();
                  else if (suggestedAction === 'thought_record') onNavigate('thoughts');
                  else onNavigate('wellness');
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md shrink-0 cursor-pointer"
              >
                Open Tool
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error notice */}
        {error && (
          <div className="mx-6 mb-2 px-3 py-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Message Composer */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-200 bg-white">
          {activeSession && activeSession.status !== 'active' ? (
            <div className="flex items-center justify-between gap-4 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
              <span>
                This session is marked as <strong>{activeSession.status}</strong>. Start a new
                session to continue conversing.
              </span>
              <button
                type="button"
                onClick={handleNewSession}
                className="px-3 py-1.5 font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md shrink-0 cursor-pointer"
              >
                New Session
              </button>
            </div>
          ) : (
            <div className="flex items-end gap-3">
              <textarea
                rows={2}
                maxLength={6000}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage(input);
                  }
                }}
                placeholder="Describe what you're experiencing or a thought you want to examine..."
                className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-700 resize-none"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 rounded-lg transition-colors shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          )}
        </form>
      </section>
    </div>
  );
}
