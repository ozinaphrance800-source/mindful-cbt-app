import {
  ACTIVITY_TYPES,
  BLUEPRINT_LIMITS,
  COGNITIVE_DISTORTIONS,
  EMOTION_LABELS,
  ID_PATTERN,
  SENTIMENTS,
  type ActivityType,
  type CognitiveDistortion,
  type EmotionLabel,
  type SentimentType,
} from '../types/mindful';

export function isValidDocumentId(id: string): boolean {
  return (
    typeof id === 'string' &&
    id.length > 0 &&
    id.length <= BLUEPRINT_LIMITS.idMax &&
    ID_PATTERN.test(id)
  );
}

export function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function sanitizeString(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

export function sanitizeTriggers(triggers: string[]): string[] {
  return triggers
    .map((t) => sanitizeString(t, BLUEPRINT_LIMITS.moodTriggerMaxLen))
    .filter((t) => t.length > 0)
    .slice(0, BLUEPRINT_LIMITS.moodTriggersMaxCount);
}

export function validateMoodInput(input: {
  score: number;
  emotionLabel: EmotionLabel;
  note: string;
  triggers: string[];
}) {
  if (!Number.isFinite(input.score) || input.score < 0 || input.score > 100) {
    throw new Error('Invalid mood score: please choose a value between 0 and 100.');
  }
  if (!EMOTION_LABELS.includes(input.emotionLabel)) {
    throw new Error('Please select a valid emotion label.');
  }
  return {
    score: clampNumber(input.score, 0, 100),
    emotionLabel: input.emotionLabel,
    note: sanitizeString(input.note, BLUEPRINT_LIMITS.moodNoteMax),
    triggers: sanitizeTriggers(input.triggers),
  };
}

export function validateActivityInput(input: {
  type: ActivityType;
  name: string;
  description: string;
  duration: number;
  completed: boolean;
}) {
  const name = sanitizeString(input.name, BLUEPRINT_LIMITS.activityNameMax);
  if (name.length < BLUEPRINT_LIMITS.activityNameMin) {
    throw new Error('Required fields missing: activity name is required.');
  }
  if (!ACTIVITY_TYPES.includes(input.type)) {
    throw new Error('Please choose a valid CBT activity type.');
  }
  if (!Number.isFinite(input.duration) || input.duration < 0 || input.duration > BLUEPRINT_LIMITS.activityDurationMax) {
    throw new Error('Duration must be between 0 and 480 minutes.');
  }
  return {
    type: input.type,
    name,
    description: sanitizeString(input.description, BLUEPRINT_LIMITS.activityDescriptionMax),
    duration: clampNumber(input.duration, 0, BLUEPRINT_LIMITS.activityDurationMax),
    completed: Boolean(input.completed),
  };
}

export function validateThoughtRecordInput(input: {
  situation: string;
  automaticThought: string;
  distortion: CognitiveDistortion;
  emotionIntensityBefore: number;
  evidenceFor: string;
  evidenceAgainst: string;
  balancedThought: string;
  emotionIntensityAfter: number;
}) {
  const situation = sanitizeString(input.situation, BLUEPRINT_LIMITS.thoughtFieldMax);
  const automaticThought = sanitizeString(input.automaticThought, BLUEPRINT_LIMITS.thoughtFieldMax);
  const balancedThought = sanitizeString(input.balancedThought, BLUEPRINT_LIMITS.thoughtFieldMax);

  if (!situation || !automaticThought || !balancedThought) {
    throw new Error('Situation, automatic thought, and balanced alternative thought are required.');
  }
  if (!COGNITIVE_DISTORTIONS.includes(input.distortion)) {
    throw new Error('Invalid cognitive distortion selection.');
  }
  return {
    situation,
    automaticThought,
    distortion: input.distortion,
    emotionIntensityBefore: clampNumber(input.emotionIntensityBefore, 0, 100),
    evidenceFor: sanitizeString(input.evidenceFor, BLUEPRINT_LIMITS.thoughtFieldMax),
    evidenceAgainst: sanitizeString(input.evidenceAgainst, BLUEPRINT_LIMITS.thoughtFieldMax),
    balancedThought,
    emotionIntensityAfter: clampNumber(input.emotionIntensityAfter, 0, 100),
  };
}

export function normalizeSentiment(value: string): SentimentType {
  return SENTIMENTS.includes(value as SentimentType) ? (value as SentimentType) : 'neutral';
}

export function sanitizeKeyPhrases(phrases: string[]): string[] {
  return phrases
    .map((p) => sanitizeString(p, BLUEPRINT_LIMITS.sentimentPhraseMax))
    .filter((p) => p.length > 0)
    .slice(0, BLUEPRINT_LIMITS.sentimentPhrasesMaxCount);
}

export function validateSentimentAnalysisInput(input: {
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
}) {
  const inputText = sanitizeString(input.inputText, BLUEPRINT_LIMITS.sentimentInputMax);
  if (!inputText) {
    throw new Error('Analysis text cannot be empty.');
  }
  const primaryEmotion =
    sanitizeString(input.primaryEmotion, BLUEPRINT_LIMITS.emotionMax) || 'Balanced';
  const validActions = ['thought_record', 'breathing', 'activity', 'chat', 'none'] as const;
  const suggestedAction = validActions.includes(input.suggestedAction)
    ? input.suggestedAction
    : 'none';

  return {
    inputText,
    sentiment: normalizeSentiment(input.sentiment),
    valenceScore: clampNumber(input.valenceScore, 0, 100),
    confidence: clampNumber(input.confidence, 0, 100),
    primaryEmotion,
    detectedDistortion:
      sanitizeString(input.detectedDistortion, BLUEPRINT_LIMITS.chatTechniqueMax) ||
      'None Identified',
    keyPhrases: sanitizeKeyPhrases(input.keyPhrases),
    cbtInsight: sanitizeString(input.cbtInsight, BLUEPRINT_LIMITS.sentimentInsightMax),
    suggestedAction,
    crisisDetected: Boolean(input.crisisDetected),
    responseTimeMs: clampNumber(input.responseTimeMs, 0, 60000),
  };
}
