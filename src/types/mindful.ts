import type { Timestamp } from 'firebase/firestore';

export const BLUEPRINT_LIMITS = {
  idMax: 128,
  displayNameMin: 1,
  displayNameMax: 100,
  therapeuticGoalMax: 300,
  emailMax: 254,
  deviceInfoMax: 200,
  moodNoteMax: 1000,
  moodTriggersMaxCount: 5,
  moodTriggerMaxLen: 40,
  activityNameMin: 1,
  activityNameMax: 120,
  activityDescriptionMax: 1000,
  activityDurationMax: 480,
  thoughtFieldMin: 1,
  thoughtFieldMax: 500,
  chatTitleMin: 1,
  chatTitleMax: 120,
  chatTechniqueMax: 80,
  chatGoalMax: 200,
  chatContentMin: 1,
  chatContentMax: 6000,
  emotionMax: 40,
  sentimentInputMin: 1,
  sentimentInputMax: 2000,
  sentimentPhraseMax: 60,
  sentimentPhrasesMaxCount: 5,
  sentimentInsightMax: 500,
} as const;

export const ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

export const EMOTION_LABELS = [
  'Calm',
  'Hopeful',
  'Balanced',
  'Tired',
  'Anxious',
  'Sad',
  'Overwhelmed',
  'Stressed',
  'Irritable',
] as const;
export type EmotionLabel = (typeof EMOTION_LABELS)[number];

export const ACTIVITY_TYPES = [
  'meditation',
  'exercise',
  'thought_record',
  'behavioral_activation',
  'relaxation',
  'journaling',
  'problem_solving',
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  meditation: 'Mindfulness Meditation',
  exercise: 'Physical Movement',
  thought_record: 'Thought Record',
  behavioral_activation: 'Behavioral Activation',
  relaxation: 'Breathing & Relaxation',
  journaling: 'Reflective Journaling',
  problem_solving: 'Structured Problem-Solving',
};

export const COGNITIVE_DISTORTIONS = [
  'All-or-Nothing Thinking',
  'Overgeneralization',
  'Catastrophizing',
  'Personalization',
  'Emotional Reasoning',
  'Mental Filtering',
  'Mind Reading',
  'Should Statements',
  'None Identified',
] as const;
export type CognitiveDistortion = (typeof COGNITIVE_DISTORTIONS)[number];

export const SESSION_STATUSES = ['active', 'completed', 'archived'] as const;
export type ChatSessionStatus = (typeof SESSION_STATUSES)[number];

export const SENTIMENTS = ['positive', 'neutral', 'negative', 'distressed', 'crisis'] as const;
export type SentimentType = (typeof SENTIMENTS)[number];

export interface UserProfile {
  uid: string;
  displayName: string;
  therapeuticGoal: string;
  consentAccepted: boolean;
  consentAcceptedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserPrivateInfo {
  uid: string;
  email: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface LoginSession {
  id: string;
  userId: string;
  deviceInfo: string;
  status: 'active' | 'signed_out';
  lastActive: Timestamp;
  createdAt: Timestamp;
}

export interface MoodEntry {
  id: string;
  userId: string;
  score: number;
  emotionLabel: EmotionLabel;
  note: string;
  triggers: string[];
  timestamp: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ActivityEntry {
  id: string;
  userId: string;
  type: ActivityType;
  name: string;
  description: string;
  duration: number;
  completed: boolean;
  timestamp: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ThoughtRecord {
  id: string;
  userId: string;
  situation: string;
  automaticThought: string;
  distortion: CognitiveDistortion;
  emotionIntensityBefore: number;
  evidenceFor: string;
  evidenceAgainst: string;
  balancedThought: string;
  emotionIntensityAfter: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  status: ChatSessionStatus;
  primaryTechnique: string;
  currentGoal: string;
  messageCount: number;
  lastSentiment: SentimentType;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ChatMessage {
  id: string;
  userId: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  sentiment: SentimentType;
  emotion: string;
  cbtTechnique: string;
  cbtGoal: string;
  detectedDistortion: string;
  crisisDetected: boolean;
  responseTimeMs: number;
  createdAt: Timestamp;
}

export interface ChatApiResponse {
  reply: string;
  sentiment: SentimentType;
  emotion: string;
  cbtTechnique: string;
  detectedDistortion: string;
  cbtGoal: string;
  suggestedAction: 'thought_record' | 'breathing' | 'activity' | 'none';
  crisisDetected: boolean;
  responseTimeMs: number;
}

export interface SentimentEmotionSlice {
  label: string;
  score: number;
}

export interface SentimentApiResponse {
  sentiment: SentimentType;
  valenceScore: number;
  confidence: number;
  primaryEmotion: string;
  emotionBreakdown: SentimentEmotionSlice[];
  detectedDistortion: string;
  keyPhrases: string[];
  cbtInsight: string;
  suggestedAction: 'thought_record' | 'breathing' | 'activity' | 'chat' | 'none';
  crisisDetected: boolean;
  responseTimeMs: number;
}

export interface SentimentAnalysis {
  id: string;
  userId: string;
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
  createdAt: Timestamp;
}

export type AppView = 'overview' | 'chat' | 'sentiment' | 'thoughts' | 'wellness' | 'vault';
