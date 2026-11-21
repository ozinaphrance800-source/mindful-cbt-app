import { useEffect, useState, type FormEvent } from 'react';
import { Database, Download, Eye, Lock, Save, Search, ShieldCheck, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  deleteActivityEntry,
  deleteChatSessionWithMessages,
  deleteLoginSession,
  deleteMoodEntry,
  deleteSentimentAnalysis,
  deleteThoughtRecord,
  serializeMoodsCsv,
  serializeVaultExport,
} from '../services/firestoreService';
import type {
  ActivityEntry,
  ChatSession,
  LoginSession,
  MoodEntry,
  SentimentAnalysis,
  ThoughtRecord,
} from '../types/mindful';

interface DataVaultViewProps {
  moods: MoodEntry[];
  activities: ActivityEntry[];
  thoughtRecords: ThoughtRecord[];
  chatSessions: ChatSession[];
  sentimentAnalyses: SentimentAnalysis[];
  loginSessions: LoginSession[];
}

type CollectionKey =
  | 'moods'
  | 'activities'
  | 'thoughtRecords'
  | 'chatSessions'
  | 'sentimentAnalyses'
  | 'userSessions';

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function DataVaultView({
  moods,
  activities,
  thoughtRecords,
  chatSessions,
  sentimentAnalyses,
  loginSessions,
}: DataVaultViewProps) {
  const { user, profile, privateInfo, saveProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [therapeuticGoal, setTherapeuticGoal] = useState(profile?.therapeuticGoal ?? '');

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setTherapeuticGoal(profile.therapeuticGoal);
    }
  }, [profile]);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileNotice, setProfileNotice] = useState<string | null>(null);

  const [activeCollection, setActiveCollection] = useState<CollectionKey>('moods');
  const [search, setSearch] = useState('');
  const [inspectedRecord, setInspectedRecord] = useState<{ title: string; payload: unknown } | null>(
    null
  );
  const [vaultError, setVaultError] = useState<string | null>(null);

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileNotice(null);
    try {
      await saveProfile({ displayName, therapeuticGoal });
      setProfileNotice('Profile and therapeutic focus updated in Firestore.');
    } catch (err) {
      setProfileNotice(err instanceof Error ? err.message : 'Unable to save profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleExportJson = () => {
    const json = serializeVaultExport({
      profile,
      moods,
      activities,
      thoughtRecords,
      chatSessions,
      sentimentAnalyses,
    });
    downloadFile(
      json,
      `mindful-cloud-vault-${new Date().toISOString().slice(0, 10)}.json`,
      'application/json'
    );
  };

  const handleExportCsv = () => {
    const csv = serializeMoodsCsv(moods);
    downloadFile(
      csv,
      `mindful-mood-logs-${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8'
    );
  };

  const handleDeleteRecord = async (collectionKey: CollectionKey, id: string) => {
    if (!user) return;
    setVaultError(null);
    try {
      if (collectionKey === 'moods') await deleteMoodEntry(id);
      else if (collectionKey === 'activities') await deleteActivityEntry(id);
      else if (collectionKey === 'thoughtRecords') await deleteThoughtRecord(id);
      else if (collectionKey === 'chatSessions') await deleteChatSessionWithMessages(user.uid, id);
      else if (collectionKey === 'sentimentAnalyses') await deleteSentimentAnalysis(id);
      else if (collectionKey === 'userSessions') await deleteLoginSession(id);
    } catch (err) {
      setVaultError(err instanceof Error ? err.message : 'Failed to delete cloud record.');
    }
  };

  const q = search.trim().toLowerCase();

  const rows: { id: string; primary: string; secondary: string; timestamp: string; raw: unknown }[] =
    (() => {
      if (activeCollection === 'moods') {
        return moods
          .filter(
            (m) =>
              !q ||
              m.id.toLowerCase().includes(q) ||
              m.emotionLabel.toLowerCase().includes(q) ||
              m.note.toLowerCase().includes(q)
          )
          .map((m) => ({
            id: m.id,
            primary: `${m.score}/100 · ${m.emotionLabel}`,
            secondary: m.note || (m.triggers.length ? m.triggers.join(', ') : 'No note'),
            timestamp: m.timestamp?.toDate?.().toLocaleString() ?? '—',
            raw: m,
          }));
      }
      if (activeCollection === 'activities') {
        return activities
          .filter(
            (a) =>
              !q ||
              a.id.toLowerCase().includes(q) ||
              a.name.toLowerCase().includes(q) ||
              a.type.toLowerCase().includes(q)
          )
          .map((a) => ({
            id: a.id,
            primary: a.name,
            secondary: `${a.type} · ${a.duration} min · ${a.completed ? 'completed' : 'planned'}`,
            timestamp: a.timestamp?.toDate?.().toLocaleString() ?? '—',
            raw: a,
          }));
      }
      if (activeCollection === 'thoughtRecords') {
        return thoughtRecords
          .filter(
            (t) =>
              !q ||
              t.id.toLowerCase().includes(q) ||
              t.situation.toLowerCase().includes(q) ||
              t.distortion.toLowerCase().includes(q)
          )
          .map((t) => ({
            id: t.id,
            primary: t.distortion,
            secondary: t.situation,
            timestamp: t.createdAt?.toDate?.().toLocaleString() ?? '—',
            raw: t,
          }));
      }
      if (activeCollection === 'chatSessions') {
        return chatSessions
          .filter(
            (c) =>
              !q ||
              c.id.toLowerCase().includes(q) ||
              c.title.toLowerCase().includes(q) ||
              c.primaryTechnique.toLowerCase().includes(q)
          )
          .map((c) => ({
            id: c.id,
            primary: c.title,
            secondary: `${c.status} · ${c.messageCount} messages · ${c.primaryTechnique}`,
            timestamp: c.updatedAt?.toDate?.().toLocaleString() ?? '—',
            raw: c,
          }));
      }
      if (activeCollection === 'sentimentAnalyses') {
        return sentimentAnalyses
          .filter(
            (s) =>
              !q ||
              s.id.toLowerCase().includes(q) ||
              s.inputText.toLowerCase().includes(q) ||
              s.primaryEmotion.toLowerCase().includes(q) ||
              s.sentiment.toLowerCase().includes(q)
          )
          .map((s) => ({
            id: s.id,
            primary: `${s.sentiment} (${s.valenceScore}/100) · ${s.primaryEmotion}`,
            secondary: s.inputText,
            timestamp: s.createdAt?.toDate?.().toLocaleString() ?? '—',
            raw: s,
          }));
      }
      return loginSessions
        .filter(
          (ls) =>
            !q ||
            ls.id.toLowerCase().includes(q) ||
            ls.deviceInfo.toLowerCase().includes(q) ||
            ls.status.toLowerCase().includes(q)
        )
        .map((ls) => ({
          id: ls.id,
          primary: ls.status === 'active' ? 'Active Browser Session' : 'Signed Out Session',
          secondary: ls.deviceInfo,
          timestamp: ls.lastActive?.toDate?.().toLocaleString() ?? '—',
          raw: ls,
        }));
    })();

  const totalDocuments =
    moods.length +
    activities.length +
    thoughtRecords.length +
    chatSessions.length +
    sentimentAnalyses.length +
    loginSessions.length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Cloud Data Vault & Database Management
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Inspect, manage, export, or remove any record stored in your private Firestore vault.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Moods CSV</span>
          </button>
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Full Vault (JSON)</span>
          </button>
        </div>
      </div>

      {/* Account Profile + Security Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleProfileSubmit}
          className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4"
        >
          <h2 className="text-base font-semibold text-slate-900">
            Account Profile & Therapeutic Focus
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Display Name
              </label>
              <input
                required
                type="text"
                maxLength={100}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Verified Email (Isolated PII)
              </label>
              <input
                type="text"
                readOnly
                value={privateInfo?.email || user?.email || 'Verified Account'}
                className="w-full px-3 py-2 text-sm bg-slate-50 text-slate-500 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Personal Therapeutic Goal
            </label>
            <textarea
              rows={2}
              maxLength={300}
              value={therapeuticGoal}
              onChange={(e) => setTherapeuticGoal(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          {profileNotice && (
            <p className="text-xs text-teal-800 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2">
              {profileNotice}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={profileSaving}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-60 rounded-lg cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{profileSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>

        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-teal-800">
            <ShieldCheck className="w-5 h-5" />
            <h2 className="text-base font-semibold text-slate-900">
              Cloud Security & Isolation Status
            </h2>
          </div>

          <dl className="space-y-3 text-xs border-t border-slate-100 pt-4">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Owner UID</dt>
              <dd className="font-mono text-slate-800 truncate max-w-[200px]">{user?.uid}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Informed Consent</dt>
              <dd className="font-medium text-emerald-700">
                {profile?.consentAccepted
                  ? `Accepted (${profile.consentAcceptedAt?.toDate?.().toLocaleDateString() ?? 'Verified'})`
                  : 'Pending'}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">PII Isolation</dt>
              <dd className="font-medium text-slate-800 inline-flex items-center gap-1">
                <Lock className="w-3 h-3 text-teal-700" />
                <span>Private Subcollection</span>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Stored Cloud Records</dt>
              <dd className="font-mono tabular-nums font-semibold text-slate-900">
                {totalDocuments} documents
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Collection Explorer */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
            {(
              [
                { key: 'moods', label: `Moods (${moods.length})` },
                { key: 'activities', label: `Activities (${activities.length})` },
                { key: 'thoughtRecords', label: `Thoughts (${thoughtRecords.length})` },
                { key: 'chatSessions', label: `Chats (${chatSessions.length})` },
                { key: 'sentimentAnalyses', label: `Sentiments (${sentimentAnalyses.length})` },
                { key: 'userSessions', label: `Logins (${loginSessions.length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveCollection(tab.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  activeCollection === tab.key
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search collection records..."
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-700"
            />
          </div>
        </div>

        {vaultError && (
          <div className="m-4 px-3 py-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg">
            {vaultError}
          </div>
        )}

        {rows.length === 0 ? (
          <div className="p-10 text-center">
            <Database className="w-7 h-7 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-800">No records in this collection</p>
            <p className="text-xs text-slate-500 mt-1">
              Records you create in Mindful appear here in real time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4">Document ID</th>
                  <th className="py-3 px-4">Summary</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono text-slate-500 max-w-[140px] truncate">
                      {row.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">{row.primary}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{row.secondary}</td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono tabular-nums">
                      {row.timestamp}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() =>
                          setInspectedRecord({
                            title: `${activeCollection}/${row.id}`,
                            payload: row.raw,
                          })
                        }
                        className="inline-flex items-center gap-1 px-2 py-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteRecord(activeCollection, row.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-red-600 hover:text-red-800 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record JSON Inspector Modal */}
      {inspectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold font-mono text-slate-900 truncate">
                {inspectedRecord.title}
              </h3>
              <button
                type="button"
                onClick={() => setInspectedRecord(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-auto max-h-96">
              {JSON.stringify(inspectedRecord.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
