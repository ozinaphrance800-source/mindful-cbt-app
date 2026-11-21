import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  normalizeSentiment,
  sanitizeString,
  validateActivityInput,
  validateMoodInput,
  validateSentimentAnalysisInput,
  validateThoughtRecordInput,
} from '../lib/validation';
import {
  BLUEPRINT_LIMITS,
  type ActivityEntry,
  type ActivityType,
  type ChatMessage,
  type ChatSession,
  type ChatSessionStatus,
  type CognitiveDistortion,
  type EmotionLabel,
  type LoginSession,
  type MoodEntry,
  type SentimentAnalysis,
  type SentimentType,
  type ThoughtRecord,
  type UserPrivateInfo,
  type UserProfile,
} from '../types/mindful';

function generateSafeId(prefix: string): string {
  const raw =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().replace(/-/g, '')
      : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}_${raw}`.slice(0, BLUEPRINT_LIMITS.idMax);
}

// --- User Profile & Isolated PII ---

export async function ensureUserDocuments(firebaseUser: User): Promise<{
  profile: UserProfile;
  privateInfo: UserPrivateInfo;
}> {
  const uid = firebaseUser.uid;
  const profileRef = doc(db, 'users', uid);
  const privateRef = doc(db, 'users', uid, 'private', 'info');

  try {
    const [profileSnap, privateSnap] = await Promise.all([
      getDoc(profileRef),
      getDoc(privateRef),
    ]);

    if (!profileSnap.exists()) {
      const displayName = sanitizeString(
        firebaseUser.displayName || 'Mindful Member',
        BLUEPRINT_LIMITS.displayNameMax
      );
      await setDoc(profileRef, {
        uid,
        displayName,
        therapeuticGoal: 'Build steady emotional awareness and balanced thinking patterns.',
        consentAccepted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    const userEmail = sanitizeString(
      firebaseUser.email || 'private@user.local',
      BLUEPRINT_LIMITS.emailMax
    );
    if (!privateSnap.exists()) {
      await setDoc(privateRef, {
        uid,
        email: userEmail,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else if (privateSnap.data().email !== userEmail) {
      await updateDoc(privateRef, {
        email: userEmail,
        updatedAt: serverTimestamp(),
      });
    }

    const [freshProfile, freshPrivate] = await Promise.all([
      getDoc(profileRef),
      getDoc(privateRef),
    ]);

    return {
      profile: freshProfile.data() as UserProfile,
      privateInfo: freshPrivate.data() as UserPrivateInfo,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
  }
}

export async function acceptInformedConsent(uid: string): Promise<void> {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      consentAccepted: true,
      consentAcceptedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateUserProfile(
  uid: string,
  updates: { displayName: string; therapeuticGoal: string }
): Promise<void> {
  const path = `users/${uid}`;
  const displayName = sanitizeString(updates.displayName, BLUEPRINT_LIMITS.displayNameMax);
  const therapeuticGoal = sanitizeString(
    updates.therapeuticGoal,
    BLUEPRINT_LIMITS.therapeuticGoalMax
  );
  if (!displayName) {
    throw new Error('Display name cannot be empty.');
  }
  try {
    await updateDoc(doc(db, 'users', uid), {
      displayName,
      therapeuticGoal,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// --- Login Sessions (Table 3.2) ---

export async function createLoginSession(uid: string): Promise<string> {
  const sessionId = generateSafeId('ls');
  const path = `userSessions/${sessionId}`;
  const deviceInfo = sanitizeString(
    typeof navigator !== 'undefined'
      ? `${navigator.platform || 'Web'} · ${navigator.userAgent.split(')')[0]})`
      : 'Web Browser',
    BLUEPRINT_LIMITS.deviceInfoMax
  );
  try {
    await setDoc(doc(db, 'userSessions', sessionId), {
      userId: uid,
      deviceInfo: deviceInfo || 'Web Browser',
      status: 'active',
      lastActive: serverTimestamp(),
      createdAt: serverTimestamp(),
    });
    return sessionId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function markLoginSessionSignedOut(sessionId: string): Promise<void> {
  const path = `userSessions/${sessionId}`;
  try {
    await updateDoc(doc(db, 'userSessions', sessionId), {
      status: 'signed_out',
      lastActive: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteLoginSession(sessionId: string): Promise<void> {
  const path = `userSessions/${sessionId}`;
  try {
    await deleteDoc(doc(db, 'userSessions', sessionId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeLoginSessions(
  uid: string,
  onData: (sessions: LoginSession[]) => void
): Unsubscribe {
  const path = 'userSessions';
  const q = query(
    collection(db, 'userSessions'),
    where('userId', '==', uid),
    limit(20)
  );
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => ({
          id: d.id,
          ...(d.data() as Omit<LoginSession, 'id'>),
        }))
        .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      onData(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

// --- Mood Logs (Table 3.3) ---

export function subscribeMoods(uid: string, onData: (moods: MoodEntry[]) => void): Unsubscribe {
  const path = 'moods';
  const q = query(
    collection(db, 'moods'),
    where('userId', '==', uid),
    limit(100)
  );
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => ({
          id: d.id,
          ...(d.data() as Omit<MoodEntry, 'id'>),
        }))
        .sort((a, b) => (b.timestamp?.toMillis?.() ?? 0) - (a.timestamp?.toMillis?.() ?? 0));
      onData(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export async function createMoodEntry(
  uid: string,
  input: {
    score: number;
    emotionLabel: EmotionLabel;
    note: string;
    triggers: string[];
    occurredAt?: Date;
  }
): Promise<string> {
  const validated = validateMoodInput(input);
  const id = generateSafeId('mood');
  const path = `moods/${id}`;
  try {
    await setDoc(doc(db, 'moods', id), {
      userId: uid,
      ...validated,
      timestamp: input.occurredAt ? Timestamp.fromDate(input.occurredAt) : serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateMoodEntry(
  id: string,
  input: {
    score: number;
    emotionLabel: EmotionLabel;
    note: string;
    triggers: string[];
    occurredAt?: Date;
  }
): Promise<void> {
  const validated = validateMoodInput(input);
  const path = `moods/${id}`;
  try {
    await updateDoc(doc(db, 'moods', id), {
      ...validated,
      timestamp: input.occurredAt ? Timestamp.fromDate(input.occurredAt) : serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteMoodEntry(id: string): Promise<void> {
  const path = `moods/${id}`;
  try {
    await deleteDoc(doc(db, 'moods', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Activities (Table 3.4) ---

export function subscribeActivities(
  uid: string,
  onData: (activities: ActivityEntry[]) => void
): Unsubscribe {
  const path = 'activities';
  const q = query(
    collection(db, 'activities'),
    where('userId', '==', uid),
    limit(100)
  );
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ActivityEntry, 'id'>),
        }))
        .sort((a, b) => (b.timestamp?.toMillis?.() ?? 0) - (a.timestamp?.toMillis?.() ?? 0));
      onData(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export async function createActivityEntry(
  uid: string,
  input: {
    type: ActivityType;
    name: string;
    description: string;
    duration: number;
    completed: boolean;
  }
): Promise<string> {
  const validated = validateActivityInput(input);
  const id = generateSafeId('act');
  const path = `activities/${id}`;
  try {
    await setDoc(doc(db, 'activities', id), {
      userId: uid,
      ...validated,
      timestamp: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateActivityEntry(
  id: string,
  input: {
    type: ActivityType;
    name: string;
    description: string;
    duration: number;
    completed: boolean;
  }
): Promise<void> {
  const validated = validateActivityInput(input);
  const path = `activities/${id}`;
  try {
    await updateDoc(doc(db, 'activities', id), {
      ...validated,
      timestamp: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function toggleActivityComplete(id: string, completed: boolean): Promise<void> {
  const path = `activities/${id}`;
  try {
    await updateDoc(doc(db, 'activities', id), {
      completed,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteActivityEntry(id: string): Promise<void> {
  const path = `activities/${id}`;
  try {
    await deleteDoc(doc(db, 'activities', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Thought Records (CBT Cognitive Restructuring) ---

export function subscribeThoughtRecords(
  uid: string,
  onData: (records: ThoughtRecord[]) => void
): Unsubscribe {
  const path = 'thoughtRecords';
  const q = query(
    collection(db, 'thoughtRecords'),
    where('userId', '==', uid),
    limit(100)
  );
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ThoughtRecord, 'id'>),
        }))
        .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      onData(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export async function createThoughtRecord(
  uid: string,
  input: {
    situation: string;
    automaticThought: string;
    distortion: CognitiveDistortion;
    emotionIntensityBefore: number;
    evidenceFor: string;
    evidenceAgainst: string;
    balancedThought: string;
    emotionIntensityAfter: number;
  }
): Promise<string> {
  const validated = validateThoughtRecordInput(input);
  const id = generateSafeId('tr');
  const path = `thoughtRecords/${id}`;
  try {
    await setDoc(doc(db, 'thoughtRecords', id), {
      userId: uid,
      ...validated,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateThoughtRecord(
  id: string,
  input: {
    situation: string;
    automaticThought: string;
    distortion: CognitiveDistortion;
    emotionIntensityBefore: number;
    evidenceFor: string;
    evidenceAgainst: string;
    balancedThought: string;
    emotionIntensityAfter: number;
  }
): Promise<void> {
  const validated = validateThoughtRecordInput(input);
  const path = `thoughtRecords/${id}`;
  try {
    await updateDoc(doc(db, 'thoughtRecords', id), {
      ...validated,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteThoughtRecord(id: string): Promise<void> {
  const path = `thoughtRecords/${id}`;
  try {
    await deleteDoc(doc(db, 'thoughtRecords', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Chat Sessions & Messages (Tables 3.5 & 3.6) ---

export function subscribeChatSessions(
  uid: string,
  onData: (sessions: ChatSession[]) => void
): Unsubscribe {
  const path = 'chatSessions';
  const q = query(
    collection(db, 'chatSessions'),
    where('userId', '==', uid),
    limit(50)
  );
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ChatSession, 'id'>),
        }))
        .sort((a, b) => (b.updatedAt?.toMillis?.() ?? 0) - (a.updatedAt?.toMillis?.() ?? 0));
      onData(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export function subscribeChatMessages(
  uid: string,
  sessionId: string,
  onData: (messages: ChatMessage[]) => void
): Unsubscribe {
  const path = `chatSessions/${sessionId}/messages`;
  const q = query(
    collection(db, 'chatSessions', sessionId, 'messages'),
    where('userId', '==', uid),
    limit(200)
  );
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ChatMessage, 'id'>),
        }))
        .sort((a, b) => (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0));
      onData(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export async function createChatSession(uid: string, title?: string): Promise<string> {
  const id = generateSafeId('cs');
  const path = `chatSessions/${id}`;
  const cleanTitle = sanitizeString(
    title || `CBT Session · ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    BLUEPRINT_LIMITS.chatTitleMax
  );
  try {
    await setDoc(doc(db, 'chatSessions', id), {
      userId: uid,
      title: cleanTitle || 'CBT Therapy Session',
      status: 'active',
      primaryTechnique: 'Collaborative Check-In',
      currentGoal: 'Identify current thoughts, feelings, and helpful coping steps',
      messageCount: 0,
      lastSentiment: 'neutral',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function renameChatSession(sessionId: string, title: string): Promise<void> {
  const path = `chatSessions/${sessionId}`;
  const cleanTitle = sanitizeString(title, BLUEPRINT_LIMITS.chatTitleMax);
  if (!cleanTitle) {
    throw new Error('Session title cannot be empty.');
  }
  try {
    await updateDoc(doc(db, 'chatSessions', sessionId), {
      title: cleanTitle,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function updateChatSessionStatus(
  sessionId: string,
  status: Exclude<ChatSessionStatus, 'active'>
): Promise<void> {
  const path = `chatSessions/${sessionId}`;
  try {
    await updateDoc(doc(db, 'chatSessions', sessionId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteChatSessionWithMessages(uid: string, sessionId: string): Promise<void> {
  const path = `chatSessions/${sessionId}`;
  try {
    const msgsQuery = query(
      collection(db, 'chatSessions', sessionId, 'messages'),
      where('userId', '==', uid)
    );
    const msgSnap = await getDocs(msgsQuery);
    const batch = writeBatch(db);
    msgSnap.docs.forEach((m) => batch.delete(m.ref));
    batch.delete(doc(db, 'chatSessions', sessionId));
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function appendChatExchange(params: {
  uid: string;
  sessionId: string;
  currentMessageCount: number;
  userContent: string;
  assistantReply: string;
  sentiment: SentimentType;
  emotion: string;
  cbtTechnique: string;
  cbtGoal: string;
  detectedDistortion: string;
  crisisDetected: boolean;
  responseTimeMs: number;
}): Promise<void> {
  const { uid, sessionId } = params;
  const path = `chatSessions/${sessionId}/messages`;
  const userMsgId = generateSafeId('msg');
  const assistantMsgId = generateSafeId('msg');
  const safeSentiment = normalizeSentiment(params.sentiment);
  const cleanEmotion = sanitizeString(params.emotion, BLUEPRINT_LIMITS.emotionMax) || 'Reflective';
  const cleanTechnique =
    sanitizeString(params.cbtTechnique, BLUEPRINT_LIMITS.chatTechniqueMax) || 'CBT Support';
  const cleanGoal =
    sanitizeString(params.cbtGoal, BLUEPRINT_LIMITS.chatGoalMax) || 'Explore thoughts safely';
  const cleanDistortion =
    sanitizeString(params.detectedDistortion, BLUEPRINT_LIMITS.chatTechniqueMax) ||
    'None Identified';

  try {
    const batch = writeBatch(db);

    const userMsgRef = doc(db, 'chatSessions', sessionId, 'messages', userMsgId);
    batch.set(userMsgRef, {
      userId: uid,
      sessionId,
      role: 'user',
      content: sanitizeString(params.userContent, BLUEPRINT_LIMITS.chatContentMax),
      sentiment: safeSentiment,
      emotion: cleanEmotion,
      cbtTechnique: '',
      cbtGoal: '',
      detectedDistortion: cleanDistortion,
      crisisDetected: Boolean(params.crisisDetected),
      responseTimeMs: 0,
      createdAt: serverTimestamp(),
    });

    const assistantMsgRef = doc(db, 'chatSessions', sessionId, 'messages', assistantMsgId);
    batch.set(assistantMsgRef, {
      userId: uid,
      sessionId,
      role: 'assistant',
      content: sanitizeString(params.assistantReply, BLUEPRINT_LIMITS.chatContentMax),
      sentiment: safeSentiment,
      emotion: cleanEmotion,
      cbtTechnique: cleanTechnique,
      cbtGoal: cleanGoal,
      detectedDistortion: cleanDistortion,
      crisisDetected: Boolean(params.crisisDetected),
      responseTimeMs: Math.min(120000, Math.max(0, Math.round(params.responseTimeMs))),
      createdAt: serverTimestamp(),
    });

    const sessionRef = doc(db, 'chatSessions', sessionId);
    batch.update(sessionRef, {
      primaryTechnique: cleanTechnique,
      currentGoal: cleanGoal,
      messageCount: params.currentMessageCount + 2,
      lastSentiment: safeSentiment,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- Sentiment Analyses ---

export function subscribeSentimentAnalyses(
  uid: string,
  onData: (items: SentimentAnalysis[]) => void
): Unsubscribe {
  const path = 'sentimentAnalyses';
  const q = query(
    collection(db, 'sentimentAnalyses'),
    where('userId', '==', uid),
    limit(100)
  );
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs
        .map((d) => ({
          id: d.id,
          ...(d.data() as Omit<SentimentAnalysis, 'id'>),
        }))
        .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
      onData(items);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, path)
  );
}

export async function createSentimentAnalysis(
  uid: string,
  input: {
    inputText: string;
    sentiment: SentimentType;
    valenceScore: number;
    confidence: number;
    primaryEmotion: string;
    detectedDistortion: string;
    keyPhrases: string[];
    cbtInsight: string;
    suggestedAction: 'thought_record' | 'breathing' | 'activity' | 'chat' | 'none';
    crisisDetected: boolean;
    responseTimeMs: number;
  }
): Promise<string> {
  const validated = validateSentimentAnalysisInput(input);
  const id = generateSafeId('sa');
  const path = `sentimentAnalyses/${id}`;
  try {
    await setDoc(doc(db, 'sentimentAnalyses', id), {
      userId: uid,
      ...validated,
      createdAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteSentimentAnalysis(id: string): Promise<void> {
  const path = `sentimentAnalyses/${id}`;
  try {
    await deleteDoc(doc(db, 'sentimentAnalyses', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Cloud Data Vault Export & Privacy Wipe ---

export function serializeVaultExport(data: {
  profile: UserProfile | null;
  moods: MoodEntry[];
  activities: ActivityEntry[];
  thoughtRecords: ThoughtRecord[];
  chatSessions: ChatSession[];
  sentimentAnalyses?: SentimentAnalysis[];
}): string {
  const formatTs = (ts: Timestamp | undefined | null) =>
    ts && typeof ts.toDate === 'function' ? ts.toDate().toISOString() : null;

  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      application: 'Mindful CBT Platform',
      profile: data.profile
        ? {
            displayName: data.profile.displayName,
            therapeuticGoal: data.profile.therapeuticGoal,
            consentAccepted: data.profile.consentAccepted,
            consentAcceptedAt: formatTs(data.profile.consentAcceptedAt),
          }
        : null,
      moods: data.moods.map((m) => ({
        id: m.id,
        score: m.score,
        emotionLabel: m.emotionLabel,
        note: m.note,
        triggers: m.triggers,
        timestamp: formatTs(m.timestamp),
      })),
      activities: data.activities.map((a) => ({
        id: a.id,
        type: a.type,
        name: a.name,
        description: a.description,
        duration: a.duration,
        completed: a.completed,
        timestamp: formatTs(a.timestamp),
      })),
      thoughtRecords: data.thoughtRecords.map((t) => ({
        id: t.id,
        situation: t.situation,
        automaticThought: t.automaticThought,
        distortion: t.distortion,
        emotionIntensityBefore: t.emotionIntensityBefore,
        evidenceFor: t.evidenceFor,
        evidenceAgainst: t.evidenceAgainst,
        balancedThought: t.balancedThought,
        emotionIntensityAfter: t.emotionIntensityAfter,
        createdAt: formatTs(t.createdAt),
      })),
      chatSessions: data.chatSessions.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        primaryTechnique: c.primaryTechnique,
        currentGoal: c.currentGoal,
        messageCount: c.messageCount,
        lastSentiment: c.lastSentiment,
        createdAt: formatTs(c.createdAt),
      })),
      sentimentAnalyses: (data.sentimentAnalyses ?? []).map((s) => ({
        id: s.id,
        inputText: s.inputText,
        sentiment: s.sentiment,
        valenceScore: s.valenceScore,
        confidence: s.confidence,
        primaryEmotion: s.primaryEmotion,
        detectedDistortion: s.detectedDistortion,
        keyPhrases: s.keyPhrases,
        cbtInsight: s.cbtInsight,
        suggestedAction: s.suggestedAction,
        crisisDetected: s.crisisDetected,
        responseTimeMs: s.responseTimeMs,
        createdAt: formatTs(s.createdAt),
      })),
    },
    null,
    2
  );
}

export function serializeMoodsCsv(moods: MoodEntry[]): string {
  const escapeCsv = (val: string | number) => {
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };
  const header = ['ID', 'Timestamp', 'Score (0-100)', 'Emotion', 'Triggers', 'Note'];
  const rows = moods.map((m) => [
    escapeCsv(m.id),
    escapeCsv(m.timestamp?.toDate?.().toISOString() ?? ''),
    escapeCsv(m.score),
    escapeCsv(m.emotionLabel),
    escapeCsv((m.triggers || []).join('; ')),
    escapeCsv(m.note || ''),
  ]);
  return [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
