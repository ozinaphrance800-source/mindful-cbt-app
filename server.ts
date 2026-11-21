import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const FAST_MODEL = 'gemini-3.1-flash-lite';

const CRISIS_PATTERNS = [
  /\b(kill myself|end my life|suicide|suicidal|want to die|better off dead|hurt myself|self[- ]?harm|cut myself|overdose)\b/i,
];

function detectCrisisKeywords(text: string): boolean {
  return CRISIS_PATTERNS.some((pattern) => pattern.test(text));
}

const CHAT_REPLY_SYSTEM_INSTRUCTION = `You are Mindful, an empathetic, evidence-based Cognitive Behavioral Therapy (CBT) digital companion for adults managing stress, anxiety, and low mood.

Guidelines:
1. Validate the user's feeling warmly in 1-2 sentences without judgment.
2. Connect thoughts, feelings, and behaviors gently (Beck's CBT model).
3. Ask one focused, reflective Socratic question or offer one brief practical CBT skill (Thought Record, 4-7-8 breathing, or behavioral activation).
4. Keep replies concise, warm, and conversational (2 short paragraphs max). Never diagnose or claim to be a licensed clinician.
5. Do NOT output JSON or markdown headers—write directly to the user.
6. If the user expresses suicidal ideation, self-harm intent, or acute danger, calmly state that you are an AI companion unable to handle emergencies and urge immediate contact with 988 (US/Canada), text HOME to 741741, local emergency services, or findahelpline.com.`;

const CHAT_METADATA_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    sentiment: {
      type: Type.STRING,
      description: 'Must be exactly one of: positive, neutral, negative, distressed, crisis',
    },
    emotion: {
      type: Type.STRING,
      description: 'Primary emotion in 1-2 words (e.g., Anxious, Sad, Hopeful, Overwhelmed, Calm, Frustrated).',
    },
    cbtTechnique: {
      type: Type.STRING,
      description: 'Primary CBT technique fit (e.g., Socratic Questioning, Cognitive Restructuring, Behavioral Activation, Grounding & Relaxation, Thought Record, Problem-Solving).',
    },
    detectedDistortion: {
      type: Type.STRING,
      description: 'Detected cognitive distortion (All-or-Nothing Thinking, Overgeneralization, Catastrophizing, Personalization, Emotional Reasoning, Mental Filtering, Mind Reading, Should Statements) or "None Identified".',
    },
    cbtGoal: {
      type: Type.STRING,
      description: 'Short 1-sentence therapeutic focus under 120 chars.',
    },
    suggestedAction: {
      type: Type.STRING,
      description: 'Must be one of: thought_record, breathing, activity, none.',
    },
    crisisDetected: {
      type: Type.BOOLEAN,
      description: 'True if user expresses self-harm, suicide, or acute danger.',
    },
  },
  required: [
    'sentiment',
    'emotion',
    'cbtTechnique',
    'detectedDistortion',
    'cbtGoal',
    'suggestedAction',
    'crisisDetected',
  ],
};

const FULL_CHAT_JSON_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    reply: {
      type: Type.STRING,
      description: 'Concise, empathetic CBT therapeutic reply (2 short paragraphs max).',
    },
    ...CHAT_METADATA_SCHEMA.properties,
  },
  required: ['reply', ...CHAT_METADATA_SCHEMA.required],
};

const SENTIMENT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    sentiment: {
      type: Type.STRING,
      description: 'Must be exactly one of: positive, neutral, negative, distressed, crisis',
    },
    valenceScore: {
      type: Type.NUMBER,
      description: 'Integer 0 to 100 where 0 is deeply distressed, 50 is neutral, 100 is strongly positive.',
    },
    confidence: {
      type: Type.NUMBER,
      description: 'Confidence percentage 0 to 100.',
    },
    primaryEmotion: {
      type: Type.STRING,
      description: 'Single primary emotion label (e.g., Calm, Hopeful, Anxious, Stressed, Sad, Overwhelmed, Balanced, Frustrated).',
    },
    emotionBreakdown: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          score: { type: Type.NUMBER, description: 'Intensity 0 to 100' },
        },
        required: ['label', 'score'],
      },
      description: 'Exactly 5 dimensions: Calm/Hope, Stress, Anxiety, Sadness, Frustration.',
    },
    detectedDistortion: {
      type: Type.STRING,
      description: 'Detected cognitive distortion (All-or-Nothing Thinking, Overgeneralization, Catastrophizing, Personalization, Emotional Reasoning, Mental Filtering, Mind Reading, Should Statements) or "None Identified".',
    },
    keyPhrases: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Up to 4 short verbatim phrases from the text reflecting emotional state or triggers.',
    },
    cbtInsight: {
      type: Type.STRING,
      description: 'Brief 1-2 sentence supportive CBT reflection or cognitive reframe under 420 chars.',
    },
    suggestedAction: {
      type: Type.STRING,
      description: 'Must be one of: thought_record, breathing, activity, chat, none.',
    },
    crisisDetected: {
      type: Type.BOOLEAN,
      description: 'True if text indicates suicidal ideation, self-harm, or acute crisis.',
    },
  },
  required: [
    'sentiment',
    'valenceScore',
    'confidence',
    'primaryEmotion',
    'emotionBreakdown',
    'detectedDistortion',
    'keyPhrases',
    'cbtInsight',
    'suggestedAction',
    'crisisDetected',
  ],
};

interface HistoryTurn {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequestBody {
  message?: unknown;
  history?: unknown;
  recentMoodSummary?: unknown;
  therapeuticGoal?: unknown;
}

function getGenAIClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function sanitizeHistory(raw: unknown): HistoryTurn[] {
  const rawHistory = Array.isArray(raw) ? raw : [];
  return rawHistory
    .slice(-10)
    .filter(
      (item): item is HistoryTurn =>
        Boolean(item) &&
        typeof item === 'object' &&
        (item.role === 'user' || item.role === 'assistant') &&
        typeof item.content === 'string' &&
        item.content.trim().length > 0
    )
    .map((item) => ({
      role: item.role,
      content: item.content.slice(0, 2000),
    }));
}

function buildChatContext(body: ChatRequestBody, rawMessage: string): string {
  const history = sanitizeHistory(body.history);
  const recentMoodSummary =
    typeof body.recentMoodSummary === 'string' ? body.recentMoodSummary.slice(0, 240) : '';
  const therapeuticGoal =
    typeof body.therapeuticGoal === 'string' ? body.therapeuticGoal.slice(0, 240) : '';

  const contextLines: string[] = [];
  if (therapeuticGoal) contextLines.push(`Goal: ${therapeuticGoal}`);
  if (recentMoodSummary) contextLines.push(`Recent moods: ${recentMoodSummary}`);
  if (history.length > 0) {
    const transcript = history
      .map((turn) => `${turn.role === 'user' ? 'User' : 'Mindful'}: ${turn.content}`)
      .join('\n');
    contextLines.push(`Conversation:\n${transcript}`);
  }
  contextLines.push(`User: ${rawMessage}`);
  return contextLines.join('\n\n');
}

function normalizeChatMetadata(
  parsed: Partial<{
    sentiment: string;
    emotion: string;
    cbtTechnique: string;
    detectedDistortion: string;
    cbtGoal: string;
    suggestedAction: string;
    crisisDetected: boolean;
  }>,
  keywordCrisis: boolean
) {
  const validSentiments = ['positive', 'neutral', 'negative', 'distressed', 'crisis'];
  const isCrisis = Boolean(parsed.crisisDetected) || keywordCrisis;
  const sentiment = isCrisis
    ? 'crisis'
    : validSentiments.includes(parsed.sentiment ?? '')
      ? (parsed.sentiment as string)
      : 'neutral';

  const validActions = ['thought_record', 'breathing', 'activity', 'none'];
  const suggestedAction = validActions.includes(parsed.suggestedAction ?? '')
    ? (parsed.suggestedAction as string)
    : 'none';

  return {
    sentiment,
    emotion: (parsed.emotion || 'Reflective').slice(0, 40),
    cbtTechnique: (parsed.cbtTechnique || 'Socratic Questioning').slice(0, 80),
    detectedDistortion: (parsed.detectedDistortion || 'None Identified').slice(0, 80),
    cbtGoal: (parsed.cbtGoal || 'Explore thoughts and emotional triggers safely').slice(0, 200),
    suggestedAction,
    crisisDetected: isCrisis,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, service: 'mindful-cbt-api' });
  });

  // Fast streaming CBT Therapist endpoint (SSE) + parallel sentiment & CBT tagging
  app.post('/api/cbt/chat/stream', async (req: Request, res: Response) => {
    const startedAt = Date.now();
    const body = (req.body || {}) as ChatRequestBody;
    const rawMessage = typeof body.message === 'string' ? body.message.trim() : '';

    if (!rawMessage) {
      return res.status(400).json({ error: 'Message cannot be empty.' });
    }
    if (rawMessage.length > 6000) {
      return res.status(400).json({ error: 'Message exceeds maximum length of 6000 characters.' });
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendEvent = (event: string, payload: unknown) => {
      if (!res.writableEnded) {
        res.write(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`);
      }
    };

    try {
      const ai = getGenAIClient();
      const keywordCrisis = detectCrisisKeywords(rawMessage);
      const contextText = buildChatContext(body, rawMessage);

      const metadataPromise = ai.models
        .generateContent({
          model: FAST_MODEL,
          contents: `Analyze this user message for CBT sentiment, emotion, cognitive distortion, and crisis indicators:\n"${rawMessage}"`,
          config: {
            systemInstruction:
              'Classify CBT emotional state and cognitive distortion accurately and concisely.',
            responseMimeType: 'application/json',
            responseSchema: CHAT_METADATA_SCHEMA,
          },
        })
        .then((metaRes) => {
          const txt = (metaRes.text ?? '{}').trim();
          const parsed = JSON.parse(txt);
          const meta = normalizeChatMetadata(parsed, keywordCrisis);
          sendEvent('metadata', meta);
          return meta;
        });

      const streamPromise = (async () => {
        const stream = await ai.models.generateContentStream({
          model: FAST_MODEL,
          contents: contextText,
          config: {
            systemInstruction: CHAT_REPLY_SYSTEM_INSTRUCTION,
          },
        });

        let fullReply = '';
        for await (const chunk of stream) {
          const piece = chunk.text ?? '';
          if (piece) {
            fullReply += piece;
            sendEvent('delta', { text: piece });
          }
        }
        return fullReply.trim();
      })();

      const [metadata, streamedReply] = await Promise.all([metadataPromise, streamPromise]);
      let finalReply = streamedReply;

      if (!finalReply) {
        sendEvent('error', { error: 'The CBT language model returned an empty response.' });
        return res.end();
      }

      if (keywordCrisis && !/988|helpline|emergency/i.test(finalReply)) {
        const crisisSuffix =
          '\n\nBecause you mentioned thoughts of hurting yourself, please know immediate human support is available right now: call or text 988 (US & Canada), text HOME to 741741, call local emergency services, or visit findahelpline.com.';
        finalReply += crisisSuffix;
        sendEvent('delta', { text: crisisSuffix });
      }

      const responseTimeMs = Math.max(1, Date.now() - startedAt);
      sendEvent('done', {
        reply: finalReply.slice(0, 6000),
        ...metadata,
        responseTimeMs,
      });
      return res.end();
    } catch (error) {
      console.error('CBT Stream API error:', error);
      const message = error instanceof Error ? error.message : 'Unexpected server error.';
      sendEvent('error', { error: message });
      return res.end();
    }
  });

  // Fast JSON CBT Chat endpoint
  app.post('/api/cbt/chat', async (req: Request, res: Response) => {
    const startedAt = Date.now();
    try {
      const body = (req.body || {}) as ChatRequestBody;
      const rawMessage = typeof body.message === 'string' ? body.message.trim() : '';

      if (!rawMessage) {
        return res.status(400).json({ error: 'Message cannot be empty.' });
      }
      if (rawMessage.length > 6000) {
        return res.status(400).json({ error: 'Message exceeds maximum length of 6000 characters.' });
      }

      const keywordCrisis = detectCrisisKeywords(rawMessage);
      const ai = getGenAIClient();

      const response = await ai.models.generateContent({
        model: FAST_MODEL,
        contents: buildChatContext(body, rawMessage),
        config: {
          systemInstruction: CHAT_REPLY_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: FULL_CHAT_JSON_SCHEMA,
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        return res.status(502).json({ error: 'The CBT language model returned an empty response.' });
      }

      const parsed = JSON.parse(rawText) as {
        reply?: string;
        sentiment?: string;
        emotion?: string;
        cbtTechnique?: string;
        detectedDistortion?: string;
        cbtGoal?: string;
        suggestedAction?: string;
        crisisDetected?: boolean;
      };

      const metadata = normalizeChatMetadata(parsed, keywordCrisis);
      let replyText = (parsed.reply ?? '').trim();
      if (!replyText) {
        return res.status(502).json({ error: 'Unable to parse therapeutic reply from model output.' });
      }

      if (keywordCrisis && !/988|helpline|emergency/i.test(replyText)) {
        replyText +=
          '\n\nBecause you mentioned thoughts of hurting yourself, please know immediate human support is available right now: call or text 988 (US & Canada), text HOME to 741741, call local emergency services, or visit findahelpline.com.';
      }

      const responseTimeMs = Math.max(1, Date.now() - startedAt);
      return res.json({
        reply: replyText.slice(0, 6000),
        ...metadata,
        responseTimeMs,
      });
    } catch (error) {
      console.error('CBT Chat API error:', error);
      const message = error instanceof Error ? error.message : 'Unexpected server error.';
      const status =
        message.includes('API_KEY') || message.includes('PERMISSION_DENIED') ? 403 : 500;
      return res.status(status).json({ error: message });
    }
  });

  // Fast Structured Sentiment Analyzer endpoint
  app.post('/api/cbt/sentiment', async (req: Request, res: Response) => {
    const startedAt = Date.now();
    try {
      const body = (req.body || {}) as { text?: unknown };
      const rawText = typeof body.text === 'string' ? body.text.trim() : '';

      if (!rawText) {
        return res.status(400).json({ error: 'Please enter text to analyze.' });
      }
      if (rawText.length > 2000) {
        return res.status(400).json({ error: 'Text exceeds maximum length of 2000 characters.' });
      }

      const keywordCrisis = detectCrisisKeywords(rawText);
      const ai = getGenAIClient();

      const response = await ai.models.generateContent({
        model: FAST_MODEL,
        contents: `Perform clinical-grade CBT sentiment and cognitive analysis on the following user text:\n\n"${rawText}"`,
        config: {
          systemInstruction:
            'You are a fast, precise CBT sentiment analyzer. Return accurate valence score (0-100), confidence (0-100), primary emotion, 5 emotion spectrum scores (Calm/Hope, Stress, Anxiety, Sadness, Frustration), any cognitive distortion, up to 4 short verbatim key phrases from the text, and a brief supportive CBT insight.',
          responseMimeType: 'application/json',
          responseSchema: SENTIMENT_SCHEMA,
        },
      });

      const modelText = (response.text ?? '').trim();
      if (!modelText) {
        return res.status(502).json({ error: 'Sentiment analyzer returned an empty response.' });
      }

      const parsed = JSON.parse(modelText) as {
        sentiment?: string;
        valenceScore?: number;
        confidence?: number;
        primaryEmotion?: string;
        emotionBreakdown?: { label?: string; score?: number }[];
        detectedDistortion?: string;
        keyPhrases?: string[];
        cbtInsight?: string;
        suggestedAction?: string;
        crisisDetected?: boolean;
      };

      const validSentiments = ['positive', 'neutral', 'negative', 'distressed', 'crisis'];
      const isCrisis = Boolean(parsed.crisisDetected) || keywordCrisis;
      const sentiment = isCrisis
        ? 'crisis'
        : validSentiments.includes(parsed.sentiment ?? '')
          ? (parsed.sentiment as string)
          : 'neutral';

      const validActions = ['thought_record', 'breathing', 'activity', 'chat', 'none'];
      const suggestedAction = isCrisis
        ? 'chat'
        : validActions.includes(parsed.suggestedAction ?? '')
          ? (parsed.suggestedAction as string)
          : 'none';

      const clamp = (n: unknown, fallback: number) =>
        typeof n === 'number' && Number.isFinite(n)
          ? Math.min(100, Math.max(0, Math.round(n)))
          : fallback;

      const breakdown = Array.isArray(parsed.emotionBreakdown)
        ? parsed.emotionBreakdown
            .slice(0, 5)
            .filter((item) => item && typeof item.label === 'string')
            .map((item) => ({
              label: String(item.label).slice(0, 30),
              score: clamp(item.score, 0),
            }))
        : [];

      const keyPhrases = Array.isArray(parsed.keyPhrases)
        ? parsed.keyPhrases
            .map((p) => String(p).trim().slice(0, 60))
            .filter((p) => p.length > 0)
            .slice(0, 5)
        : [];

      const responseTimeMs = Math.max(1, Date.now() - startedAt);

      return res.json({
        sentiment,
        valenceScore: isCrisis ? Math.min(clamp(parsed.valenceScore, 15), 25) : clamp(parsed.valenceScore, 50),
        confidence: clamp(parsed.confidence, 85),
        primaryEmotion: (parsed.primaryEmotion || (isCrisis ? 'Distressed' : 'Balanced')).slice(0, 40),
        emotionBreakdown: breakdown,
        detectedDistortion: (parsed.detectedDistortion || 'None Identified').slice(0, 80),
        keyPhrases,
        cbtInsight: (
          parsed.cbtInsight ||
          'Notice the thoughts behind this feeling and approach them with balanced curiosity.'
        ).slice(0, 500),
        suggestedAction,
        crisisDetected: isCrisis,
        responseTimeMs,
      });
    } catch (error) {
      console.error('Sentiment Analyzer API error:', error);
      const message = error instanceof Error ? error.message : 'Unexpected server error.';
      const status =
        message.includes('API_KEY') || message.includes('PERMISSION_DENIED') ? 403 : 500;
      return res.status(status).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mindful server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Mindful server:', err);
  process.exit(1);
});
