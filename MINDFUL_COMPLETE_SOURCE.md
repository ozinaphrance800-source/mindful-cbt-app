# Mindful — Complete Source Code & Deployment Bundle

## Quick Deployment Guide (Netlify or Node)

### Netlify
1. Set `GEMINI_API_KEY` in Netlify → **Site configuration → Environment variables**.
2. Build settings (configured in `netlify.toml`): Build command `npm run build`, Publish directory `dist`, Functions directory `netlify/functions`.
3. Add your `*.netlify.app` domain under Firebase Console → **Authentication → Settings → Authorized domains** (`my-mindful-app-16f63`).

### Node Server
1. `npm install`
2. Set `GEMINI_API_KEY` environment variable.
3. `npm run build && npm start`

---

## File: `.env.example`

```bash
# GEMINI_API_KEY: Required for Gemini AI API calls.
# AI Studio automatically injects this at runtime from user secrets.
# Users configure this via the Secrets panel in the AI Studio UI.
GEMINI_API_KEY="MY_GEMINI_API_KEY"

# APP_URL: The URL where this applet is hosted.
# AI Studio automatically injects this at runtime with the Cloud Run service URL.
# Used for self-referential links, OAuth callbacks, and API endpoints.
APP_URL="MY_APP_URL"
```

## File: `metadata.json`

```json
{
  "name": "Mindful",
  "description": "AI-powered Cognitive Behavioral Therapy (CBT) companion with mood tracking, structured thought records, and secure cloud storage.",
  "requestFramePermissions": [],
  "majorCapabilities": [
    "MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API"
  ]
}
```

## File: `package.json`

```json
{
  "name": "react-example",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "start": "node server.ts",
    "build": "vite build",
    "preview": "vite preview",
    "clean": "rm -rf dist server.js",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "^3.6.1",
    "@tailwindcss/vite": "^4.3.3",
    "@vitejs/plugin-react": "^6.1.1",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "firebase": "^13.4.0",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^8.3.0"
  },
  "devDependencies": {
    "@firebase/eslint-plugin-security-rules": "^0.0.2",
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "autoprefixer": "^10.4.21",
    "esbuild": "^0.25.0",
    "eslint": "^10.15.0",
    "tailwindcss": "^4.3.3",
    "tsx": "^4.21.0",
    "typescript": "^7.0.2"
  }
}
```

## File: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "types": ["vite/client"],
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "allowImportingTsExtensions": true,
    "noEmit": true
  },
  "exclude": ["dist"]
}
```

## File: `vite.config.ts`

```typescript
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
```

## File: `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## File: `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mindful — CBT Wellness & Therapy Platform</title>
    <meta
      name="description"
      content="AI-powered Cognitive Behavioral Therapy (CBT) companion with mood tracking, structured thought records, and secure cloud storage."
    />
    <meta property="og:title" content="Mindful — CBT Wellness & Therapy Platform" />
    <meta
      property="og:description"
      content="AI-powered Cognitive Behavioral Therapy (CBT) companion with mood tracking, structured thought records, and secure cloud storage."
    />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400..700;1,9..40,400..700&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body class="bg-slate-50 text-slate-900 antialiased selection:bg-teal-100 selection:text-teal-900">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## File: `eslint.config.js`

```javascript
import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*']
  },
  firebaseRulesPlugin.configs['flat/recommended']
];
```

## File: `firebase-applet-config.json`

```json
{
  "projectId": "my-mindful-app-16f63",
  "appId": "1:1025572516609:web:ff261cb91f15055d2de100",
  "apiKey": "AIzaSyABXuRhK67BkwaukI9te6oaLn5M06CKPxQ",
  "authDomain": "my-mindful-app-16f63.firebaseapp.com",
  "firestoreDatabaseId": "ai-studio-e1396b0f-3508-4102-a8c6-74063de41076",
  "storageBucket": "my-mindful-app-16f63.firebasestorage.app",
  "messagingSenderId": "1025572516609",
  "measurementId": "",
  "oAuthClientId": "1025572516609-ura7crblur948p5l5e15neb6l04bhstf.apps.googleusercontent.com",
  "recaptchaSiteKey": ""
}
```

## File: `firebase-blueprint.json`

```json
{
  "entities": {
    "UserProfile": {
      "title": "UserProfile",
      "description": "Public-safe user profile storing therapeutic preferences and consent state (PII isolated in private subcollection).",
      "type": "object",
      "properties": {
        "uid": {
          "type": "string",
          "maxLength": 128,
          "pattern": "^[a-zA-Z0-9_\\-]+$",
          "description": "Firebase Auth UID of the user."
        },
        "displayName": {
          "type": "string",
          "minLength": 1,
          "maxLength": 100,
          "description": "Display name chosen by the user."
        },
        "therapeuticGoal": {
          "type": "string",
          "maxLength": 300,
          "description": "User's personal wellness or CBT focus objective."
        },
        "consentAccepted": {
          "type": "boolean",
          "description": "Whether the user accepted the informed consent and ethical AI disclosure."
        },
        "consentAcceptedAt": {
          "type": "string",
          "format": "date-time",
          "description": "Server timestamp when informed consent was accepted."
        },
        "createdAt": {
          "type": "string",
          "format": "date-time",
          "description": "Server timestamp when the profile was created."
        },
        "updatedAt": {
          "type": "string",
          "format": "date-time",
          "description": "Server timestamp when the profile was last updated."
        }
      },
      "required": ["uid", "displayName", "consentAccepted", "createdAt", "updatedAt"]
    },
    "UserPrivateInfo": {
      "title": "UserPrivateInfo",
      "description": "Isolated PII record for the user containing their verified email address.",
      "type": "object",
      "properties": {
        "uid": {
          "type": "string",
          "maxLength": 128,
          "pattern": "^[a-zA-Z0-9_\\-]+$",
          "description": "Firebase Auth UID of the user."
        },
        "email": {
          "type": "string",
          "maxLength": 254,
          "description": "Verified email address of the user."
        },
        "createdAt": {
          "type": "string",
          "format": "date-time",
          "description": "Server timestamp when created."
        },
        "updatedAt": {
          "type": "string",
          "format": "date-time",
          "description": "Server timestamp when updated."
        }
      },
      "required": ["uid", "email", "createdAt", "updatedAt"]
    },
    "LoginSession": {
      "title": "LoginSession",
      "description": "Audit log of authenticated browser sessions for the user.",
      "type": "object",
      "properties": {
        "userId": {
          "type": "string",
          "maxLength": 128,
          "pattern": "^[a-zA-Z0-9_\\-]+$"
        },
        "deviceInfo": {
          "type": "string",
          "maxLength": 200
        },
        "status": {
          "type": "string",
          "enum": ["active", "signed_out"]
        },
        "lastActive": {
          "type": "string",
          "format": "date-time"
        },
        "createdAt": {
          "type": "string",
          "format": "date-time"
        }
      },
      "required": ["userId", "deviceInfo", "status", "lastActive", "createdAt"]
    },
    "MoodEntry": {
      "title": "MoodEntry",
      "description": "User mood log entry with 0-100 score, emotion label, triggers, and optional reflection note.",
      "type": "object",
      "properties": {
        "userId": {
          "type": "string",
          "maxLength": 128,
          "pattern": "^[a-zA-Z0-9_\\-]+$"
        },
        "score": {
          "type": "number",
          "description": "Mood score from 0 to 100."
        },
        "emotionLabel": {
          "type": "string",
          "enum": ["Calm", "Hopeful", "Balanced", "Tired", "Anxious", "Sad", "Overwhelmed", "Stressed", "Irritable"]
        },
        "note": {
          "type": "string",
          "maxLength": 1000
        },
        "triggers": {
          "type": "array",
          "description": "Bounded array of up to 5 brief trigger tags."
        },
        "timestamp": {
          "type": "string",
          "format": "date-time"
        },
        "createdAt": {
          "type": "string",
          "format": "date-time"
        },
        "updatedAt": {
          "type": "string",
          "format": "date-time"
        }
      },
      "required": ["userId", "score", "emotionLabel", "note", "triggers", "timestamp", "createdAt", "updatedAt"]
    },
    "ActivityEntry": {
      "title": "ActivityEntry",
      "description": "Behavioral activation, mindfulness, or CBT relaxation activity logged by the user.",
      "type": "object",
      "properties": {
        "userId": {
          "type": "string",
          "maxLength": 128,
          "pattern": "^[a-zA-Z0-9_\\-]+$"
        },
        "type": {
          "type": "string",
          "enum": ["meditation", "exercise", "thought_record", "behavioral_activation", "relaxation", "journaling", "problem_solving"]
        },
        "name": {
          "type": "string",
          "minLength": 1,
          "maxLength": 120
        },
        "description": {
          "type": "string",
          "maxLength": 1000
        },
        "duration": {
          "type": "number",
          "description": "Duration in minutes (0-480)."
        },
        "completed": {
          "type": "boolean"
        },
        "timestamp": {
          "type": "string",
          "format": "date-time"
        },
        "createdAt": {
          "type": "string",
          "format": "date-time"
        },
        "updatedAt": {
          "type": "string",
          "format": "date-time"
        }
      },
      "required": ["userId", "type", "name", "description", "duration", "completed", "timestamp", "createdAt", "updatedAt"]
    },
    "ThoughtRecord": {
      "title": "ThoughtRecord",
      "description": "Structured CBT cognitive restructuring worksheet.",
      "type": "object",
      "properties": {
        "userId": {
          "type": "string",
          "maxLength": 128,
          "pattern": "^[a-zA-Z0-9_\\-]+$"
        },
        "situation": {
          "type": "string",
          "minLength": 1,
          "maxLength": 500
        },
        "automaticThought": {
          "type": "string",
          "minLength": 1,
          "maxLength": 500
        },
        "distortion": {
          "type": "string",
          "enum": [
            "All-or-Nothing Thinking",
            "Overgeneralization",
            "Catastrophizing",
            "Personalization",
            "Emotional Reasoning",
            "Mental Filtering",
            "Mind Reading",
            "Should Statements",
            "None Identified"
          ]
        },
        "emotionIntensityBefore": {
          "type": "number"
        },
        "evidenceFor": {
          "type": "string",
          "maxLength": 500
        },
        "evidenceAgainst": {
          "type": "string",
          "maxLength": 500
        },
        "balancedThought": {
          "type": "string",
          "minLength": 1,
          "maxLength": 500
        },
        "emotionIntensityAfter": {
          "type": "number"
        },
        "createdAt": {
          "type": "string",
          "format": "date-time"
        },
        "updatedAt": {
          "type": "string",
          "format": "date-time"
        }
      },
      "required": [
        "userId",
        "situation",
        "automaticThought",
        "distortion",
        "emotionIntensityBefore",
        "evidenceFor",
        "evidenceAgainst",
        "balancedThought",
        "emotionIntensityAfter",
        "createdAt",
        "updatedAt"
      ]
    },
    "ChatSession": {
      "title": "ChatSession",
      "description": "CBT therapeutic dialogue session metadata.",
      "type": "object",
      "properties": {
        "userId": {
          "type": "string",
          "maxLength": 128,
          "pattern": "^[a-zA-Z0-9_\\-]+$"
        },
        "title": {
          "type": "string",
          "minLength": 1,
          "maxLength": 120
        },
        "status": {
          "type": "string",
          "enum": ["active", "completed", "archived"]
        },
        "primaryTechnique": {
          "type": "string",
          "maxLength": 80
        },
        "currentGoal": {
          "type": "string",
          "maxLength": 200
        },
        "messageCount": {
          "type": "number"
        },
        "lastSentiment": {
          "type": "string",
          "enum": ["positive", "neutral", "negative", "distressed", "crisis"]
        },
        "createdAt": {
          "type": "string",
          "format": "date-time"
        },
        "updatedAt": {
          "type": "string",
          "format": "date-time"
        }
      },
      "required": ["userId", "title", "status", "primaryTechnique", "currentGoal", "messageCount", "lastSentiment", "createdAt", "updatedAt"]
    },
    "ChatMessage": {
      "title": "ChatMessage",
      "description": "Individual message within a CBT chat session subcollection.",
      "type": "object",
      "properties": {
        "userId": {
          "type": "string",
          "maxLength": 128,
          "pattern": "^[a-zA-Z0-9_\\-]+$"
        },
        "sessionId": {
          "type": "string",
          "maxLength": 128,
          "pattern": "^[a-zA-Z0-9_\\-]+$"
        },
        "role": {
          "type": "string",
          "enum": ["user", "assistant"]
        },
        "content": {
          "type": "string",
          "minLength": 1,
          "maxLength": 6000
        },
        "sentiment": {
          "type": "string",
          "enum": ["positive", "neutral", "negative", "distressed", "crisis"]
        },
        "emotion": {
          "type": "string",
          "maxLength": 40
        },
        "cbtTechnique": {
          "type": "string",
          "maxLength": 80
        },
        "cbtGoal": {
          "type": "string",
          "maxLength": 200
        },
        "detectedDistortion": {
          "type": "string",
          "maxLength": 80
        },
        "crisisDetected": {
          "type": "boolean"
        },
        "responseTimeMs": {
          "type": "number"
        },
        "createdAt": {
          "type": "string",
          "format": "date-time"
        }
      },
      "required": ["userId", "sessionId", "role", "content", "sentiment", "emotion", "cbtTechnique", "cbtGoal", "detectedDistortion", "crisisDetected", "responseTimeMs", "createdAt"]
    },
    "SentimentAnalysis": {
      "title": "SentimentAnalysis",
      "description": "Structured NLP sentiment, valence, emotion, and cognitive distortion analysis saved by the user.",
      "type": "object",
      "properties": {
        "userId": {
          "type": "string",
          "maxLength": 128,
          "pattern": "^[a-zA-Z0-9_\\-]+$"
        },
        "inputText": {
          "type": "string",
          "minLength": 1,
          "maxLength": 2000
        },
        "sentiment": {
          "type": "string",
          "enum": ["positive", "neutral", "negative", "distressed", "crisis"]
        },
        "valenceScore": {
          "type": "number",
          "description": "Valence score from 0 (distressed) to 100 (positive)."
        },
        "confidence": {
          "type": "number",
          "description": "Model confidence percentage from 0 to 100."
        },
        "primaryEmotion": {
          "type": "string",
          "minLength": 1,
          "maxLength": 40
        },
        "detectedDistortion": {
          "type": "string",
          "maxLength": 80
        },
        "keyPhrases": {
          "type": "array",
          "description": "Up to 5 extracted emotional or cognitive phrases."
        },
        "cbtInsight": {
          "type": "string",
          "maxLength": 500
        },
        "suggestedAction": {
          "type": "string",
          "enum": ["thought_record", "breathing", "activity", "chat", "none"]
        },
        "crisisDetected": {
          "type": "boolean"
        },
        "responseTimeMs": {
          "type": "number"
        },
        "createdAt": {
          "type": "string",
          "format": "date-time"
        }
      },
      "required": [
        "userId",
        "inputText",
        "sentiment",
        "valenceScore",
        "confidence",
        "primaryEmotion",
        "detectedDistortion",
        "keyPhrases",
        "cbtInsight",
        "suggestedAction",
        "crisisDetected",
        "responseTimeMs",
        "createdAt"
      ]
    }
  },
  "firestore": {
    "/users/{userId}": {
      "schema": { "$ref": "#/entities/UserProfile" },
      "description": "User profile preferences and informed consent record."
    },
    "/users/{userId}/private/{docId}": {
      "schema": { "$ref": "#/entities/UserPrivateInfo" },
      "description": "Isolated PII subcollection storing user email."
    },
    "/userSessions/{sessionDocId}": {
      "schema": { "$ref": "#/entities/LoginSession" },
      "description": "User login session audit logs."
    },
    "/moods/{moodId}": {
      "schema": { "$ref": "#/entities/MoodEntry" },
      "description": "User mood logs (0-100 score, emotion, triggers, notes)."
    },
    "/activities/{activityId}": {
      "schema": { "$ref": "#/entities/ActivityEntry" },
      "description": "User behavioral activation and relaxation activities."
    },
    "/thoughtRecords/{recordId}": {
      "schema": { "$ref": "#/entities/ThoughtRecord" },
      "description": "User CBT thought restructuring worksheets."
    },
    "/chatSessions/{sessionId}": {
      "schema": { "$ref": "#/entities/ChatSession" },
      "description": "User CBT chat sessions."
    },
    "/chatSessions/{sessionId}/messages/{messageId}": {
      "schema": { "$ref": "#/entities/ChatMessage" },
      "description": "Messages belonging to a CBT chat session."
    },
    "/sentimentAnalyses/{analysisId}": {
      "schema": { "$ref": "#/entities/SentimentAnalysis" },
      "description": "Saved sentiment and cognitive distortion analyses for the user."
    }
  }
}
```

## File: `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Global Safety Net: Default-deny all unmatched paths
    match /{document=**} {
      allow read, write: if false;
    }

    // --- Primitive Helpers ---
    function isValidId(id) {
      return id is string && id.size() > 0 && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$');
    }

    function incoming() {
      return request.resource.data;
    }

    function existing() {
      return resource.data;
    }

    function isSignedIn() {
      return request.auth != null;
    }

    function isVerified() {
      return isSignedIn() && request.auth.token.email_verified == true;
    }

    function isOwner(userId) {
      return isVerified() && request.auth.uid == userId;
    }

    // --- Validation Blueprints ---
    function isValidUserProfile(data) {
      return data.keys().hasAll(['uid', 'displayName', 'therapeuticGoal', 'consentAccepted', 'createdAt', 'updatedAt'])
        && data.keys().hasOnly(['uid', 'displayName', 'therapeuticGoal', 'consentAccepted', 'consentAcceptedAt', 'createdAt', 'updatedAt'])
        && isValidId(data.uid)
        && data.uid == request.auth.uid
        && data.displayName is string && data.displayName.size() >= 1 && data.displayName.size() <= 100
        && data.therapeuticGoal is string && data.therapeuticGoal.size() <= 300
        && data.consentAccepted is bool
        && (!('consentAcceptedAt' in data) || data.consentAcceptedAt is timestamp)
        && data.createdAt is timestamp
        && data.updatedAt is timestamp;
    }

    function isValidUserPrivateInfo(data) {
      return data.keys().hasAll(['uid', 'email', 'createdAt', 'updatedAt'])
        && data.keys().hasOnly(['uid', 'email', 'createdAt', 'updatedAt'])
        && isValidId(data.uid)
        && data.uid == request.auth.uid
        && data.email is string && data.email.size() >= 3 && data.email.size() <= 254
        && data.createdAt is timestamp
        && data.updatedAt is timestamp;
    }

    function isValidLoginSession(data) {
      return data.keys().hasAll(['userId', 'deviceInfo', 'status', 'lastActive', 'createdAt'])
        && data.keys().hasOnly(['userId', 'deviceInfo', 'status', 'lastActive', 'createdAt'])
        && isValidId(data.userId)
        && data.userId == request.auth.uid
        && data.deviceInfo is string && data.deviceInfo.size() >= 1 && data.deviceInfo.size() <= 200
        && data.status in ['active', 'signed_out']
        && data.lastActive is timestamp
        && data.createdAt is timestamp;
    }

    function isValidMoodEntry(data) {
      return data.keys().hasAll(['userId', 'score', 'emotionLabel', 'note', 'triggers', 'timestamp', 'createdAt', 'updatedAt'])
        && data.keys().hasOnly(['userId', 'score', 'emotionLabel', 'note', 'triggers', 'timestamp', 'createdAt', 'updatedAt'])
        && isValidId(data.userId)
        && data.userId == request.auth.uid
        && data.score is number && data.score >= 0 && data.score <= 100
        && data.emotionLabel in ['Calm', 'Hopeful', 'Balanced', 'Tired', 'Anxious', 'Sad', 'Overwhelmed', 'Stressed', 'Irritable']
        && data.note is string && data.note.size() <= 1000
        && data.triggers is list && data.triggers.size() <= 5
        && (data.triggers.size() == 0 || (data.triggers[0] is string && data.triggers[0].size() >= 1 && data.triggers[0].size() <= 40))
        && data.timestamp is timestamp
        && data.createdAt is timestamp
        && data.updatedAt is timestamp;
    }

    function isValidActivityEntry(data) {
      return data.keys().hasAll(['userId', 'type', 'name', 'description', 'duration', 'completed', 'timestamp', 'createdAt', 'updatedAt'])
        && data.keys().hasOnly(['userId', 'type', 'name', 'description', 'duration', 'completed', 'timestamp', 'createdAt', 'updatedAt'])
        && isValidId(data.userId)
        && data.userId == request.auth.uid
        && data.type in ['meditation', 'exercise', 'thought_record', 'behavioral_activation', 'relaxation', 'journaling', 'problem_solving']
        && data.name is string && data.name.size() >= 1 && data.name.size() <= 120
        && data.description is string && data.description.size() <= 1000
        && data.duration is number && data.duration >= 0 && data.duration <= 480
        && data.completed is bool
        && data.timestamp is timestamp
        && data.createdAt is timestamp
        && data.updatedAt is timestamp;
    }

    function isValidThoughtRecord(data) {
      return data.keys().hasAll(['userId', 'situation', 'automaticThought', 'distortion', 'emotionIntensityBefore', 'evidenceFor', 'evidenceAgainst', 'balancedThought', 'emotionIntensityAfter', 'createdAt', 'updatedAt'])
        && data.keys().hasOnly(['userId', 'situation', 'automaticThought', 'distortion', 'emotionIntensityBefore', 'evidenceFor', 'evidenceAgainst', 'balancedThought', 'emotionIntensityAfter', 'createdAt', 'updatedAt'])
        && isValidId(data.userId)
        && data.userId == request.auth.uid
        && data.situation is string && data.situation.size() >= 1 && data.situation.size() <= 500
        && data.automaticThought is string && data.automaticThought.size() >= 1 && data.automaticThought.size() <= 500
        && data.distortion in [
          'All-or-Nothing Thinking',
          'Overgeneralization',
          'Catastrophizing',
          'Personalization',
          'Emotional Reasoning',
          'Mental Filtering',
          'Mind Reading',
          'Should Statements',
          'None Identified'
        ]
        && data.emotionIntensityBefore is number && data.emotionIntensityBefore >= 0 && data.emotionIntensityBefore <= 100
        && data.evidenceFor is string && data.evidenceFor.size() <= 500
        && data.evidenceAgainst is string && data.evidenceAgainst.size() <= 500
        && data.balancedThought is string && data.balancedThought.size() >= 1 && data.balancedThought.size() <= 500
        && data.emotionIntensityAfter is number && data.emotionIntensityAfter >= 0 && data.emotionIntensityAfter <= 100
        && data.createdAt is timestamp
        && data.updatedAt is timestamp;
    }

    function isValidChatSession(data) {
      return data.keys().hasAll(['userId', 'title', 'status', 'primaryTechnique', 'currentGoal', 'messageCount', 'lastSentiment', 'createdAt', 'updatedAt'])
        && data.keys().hasOnly(['userId', 'title', 'status', 'primaryTechnique', 'currentGoal', 'messageCount', 'lastSentiment', 'createdAt', 'updatedAt'])
        && isValidId(data.userId)
        && data.userId == request.auth.uid
        && data.title is string && data.title.size() >= 1 && data.title.size() <= 120
        && data.status in ['active', 'completed', 'archived']
        && data.primaryTechnique is string && data.primaryTechnique.size() <= 80
        && data.currentGoal is string && data.currentGoal.size() <= 200
        && data.messageCount is number && data.messageCount >= 0 && data.messageCount <= 1000
        && data.lastSentiment in ['positive', 'neutral', 'negative', 'distressed', 'crisis']
        && data.createdAt is timestamp
        && data.updatedAt is timestamp;
    }

    function isValidChatMessage(data, sessionId) {
      return data.keys().hasAll(['userId', 'sessionId', 'role', 'content', 'sentiment', 'emotion', 'cbtTechnique', 'cbtGoal', 'detectedDistortion', 'crisisDetected', 'responseTimeMs', 'createdAt'])
        && data.keys().hasOnly(['userId', 'sessionId', 'role', 'content', 'sentiment', 'emotion', 'cbtTechnique', 'cbtGoal', 'detectedDistortion', 'crisisDetected', 'responseTimeMs', 'createdAt'])
        && isValidId(data.userId)
        && data.userId == request.auth.uid
        && isValidId(data.sessionId)
        && data.sessionId == sessionId
        && data.role in ['user', 'assistant']
        && data.content is string && data.content.size() >= 1 && data.content.size() <= 6000
        && data.sentiment in ['positive', 'neutral', 'negative', 'distressed', 'crisis']
        && data.emotion is string && data.emotion.size() <= 40
        && data.cbtTechnique is string && data.cbtTechnique.size() <= 80
        && data.cbtGoal is string && data.cbtGoal.size() <= 200
        && data.detectedDistortion is string && data.detectedDistortion.size() <= 80
        && data.crisisDetected is bool
        && data.responseTimeMs is number && data.responseTimeMs >= 0 && data.responseTimeMs <= 120000
        && data.createdAt is timestamp;
    }

    function isValidSentimentAnalysis(data) {
      return data.keys().hasAll([
          'userId',
          'inputText',
          'sentiment',
          'valenceScore',
          'confidence',
          'primaryEmotion',
          'detectedDistortion',
          'keyPhrases',
          'cbtInsight',
          'suggestedAction',
          'crisisDetected',
          'responseTimeMs',
          'createdAt'
        ])
        && data.keys().hasOnly([
          'userId',
          'inputText',
          'sentiment',
          'valenceScore',
          'confidence',
          'primaryEmotion',
          'detectedDistortion',
          'keyPhrases',
          'cbtInsight',
          'suggestedAction',
          'crisisDetected',
          'responseTimeMs',
          'createdAt'
        ])
        && isValidId(data.userId)
        && data.userId == request.auth.uid
        && data.inputText is string && data.inputText.size() >= 1 && data.inputText.size() <= 2000
        && data.sentiment in ['positive', 'neutral', 'negative', 'distressed', 'crisis']
        && data.valenceScore is number && data.valenceScore >= 0 && data.valenceScore <= 100
        && data.confidence is number && data.confidence >= 0 && data.confidence <= 100
        && data.primaryEmotion is string && data.primaryEmotion.size() >= 1 && data.primaryEmotion.size() <= 40
        && data.detectedDistortion is string && data.detectedDistortion.size() <= 80
        && data.keyPhrases is list && data.keyPhrases.size() <= 5
        && (data.keyPhrases.size() == 0 || (data.keyPhrases[0] is string && data.keyPhrases[0].size() >= 1 && data.keyPhrases[0].size() <= 60))
        && data.cbtInsight is string && data.cbtInsight.size() <= 500
        && data.suggestedAction in ['thought_record', 'breathing', 'activity', 'chat', 'none']
        && data.crisisDetected is bool
        && data.responseTimeMs is number && data.responseTimeMs >= 0 && data.responseTimeMs <= 60000
        && data.createdAt is timestamp;
    }

    // --- Collection Rules ---

    match /users/{userId} {
      allow get: if isOwner(userId) && isValidId(userId);
      allow list: if false;
      allow create: if isOwner(userId)
        && isValidId(userId)
        && isValidUserProfile(incoming())
        && incoming().createdAt == request.time
        && incoming().updatedAt == request.time
        && (!('consentAcceptedAt' in incoming()) || incoming().consentAcceptedAt == request.time);
      allow update: if isOwner(userId)
        && isValidId(userId)
        && isValidUserProfile(incoming())
        && incoming().uid == existing().uid
        && incoming().createdAt == existing().createdAt
        && incoming().updatedAt == request.time
        && (
          (incoming().diff(existing()).affectedKeys().hasOnly(['displayName', 'therapeuticGoal', 'updatedAt'])) ||
          (incoming().diff(existing()).affectedKeys().hasOnly(['consentAccepted', 'consentAcceptedAt', 'updatedAt'])
            && incoming().consentAccepted == true
            && incoming().consentAcceptedAt == request.time)
        );
      allow delete: if isOwner(userId) && isValidId(userId);

      match /private/{docId} {
        allow get: if isOwner(userId) && docId == 'info';
        allow list: if false;
        allow create: if isOwner(userId)
          && docId == 'info'
          && isValidUserPrivateInfo(incoming())
          && incoming().createdAt == request.time
          && incoming().updatedAt == request.time;
        allow update: if isOwner(userId)
          && docId == 'info'
          && isValidUserPrivateInfo(incoming())
          && incoming().uid == existing().uid
          && incoming().createdAt == existing().createdAt
          && incoming().updatedAt == request.time
          && incoming().diff(existing()).affectedKeys().hasOnly(['email', 'updatedAt']);
        allow delete: if isOwner(userId) && docId == 'info';
      }
    }

    match /userSessions/{sessionDocId} {
      allow get: if isVerified() && isValidId(sessionDocId) && existing().userId == request.auth.uid;
      allow list: if isVerified() && existing().userId == request.auth.uid;
      allow create: if isVerified()
        && isValidId(sessionDocId)
        && isValidLoginSession(incoming())
        && incoming().createdAt == request.time
        && incoming().lastActive == request.time;
      allow update: if isVerified()
        && isValidId(sessionDocId)
        && existing().userId == request.auth.uid
        && isValidLoginSession(incoming())
        && incoming().userId == existing().userId
        && incoming().createdAt == existing().createdAt
        && incoming().lastActive == request.time
        && incoming().diff(existing()).affectedKeys().hasOnly(['status', 'lastActive']);
      allow delete: if isVerified() && isValidId(sessionDocId) && existing().userId == request.auth.uid;
    }

    match /moods/{moodId} {
      allow get: if isVerified() && isValidId(moodId) && existing().userId == request.auth.uid;
      allow list: if isVerified() && existing().userId == request.auth.uid;
      allow create: if isVerified()
        && isValidId(moodId)
        && isValidMoodEntry(incoming())
        && incoming().createdAt == request.time
        && incoming().updatedAt == request.time;
      allow update: if isVerified()
        && isValidId(moodId)
        && existing().userId == request.auth.uid
        && isValidMoodEntry(incoming())
        && incoming().userId == existing().userId
        && incoming().createdAt == existing().createdAt
        && incoming().updatedAt == request.time
        && incoming().diff(existing()).affectedKeys().hasOnly(['score', 'emotionLabel', 'note', 'triggers', 'timestamp', 'updatedAt']);
      allow delete: if isVerified() && isValidId(moodId) && existing().userId == request.auth.uid;
    }

    match /activities/{activityId} {
      allow get: if isVerified() && isValidId(activityId) && existing().userId == request.auth.uid;
      allow list: if isVerified() && existing().userId == request.auth.uid;
      allow create: if isVerified()
        && isValidId(activityId)
        && isValidActivityEntry(incoming())
        && incoming().createdAt == request.time
        && incoming().updatedAt == request.time;
      allow update: if isVerified()
        && isValidId(activityId)
        && existing().userId == request.auth.uid
        && isValidActivityEntry(incoming())
        && incoming().userId == existing().userId
        && incoming().createdAt == existing().createdAt
        && incoming().updatedAt == request.time
        && (
          (incoming().diff(existing()).affectedKeys().hasOnly(['completed', 'updatedAt'])) ||
          (incoming().diff(existing()).affectedKeys().hasOnly(['type', 'name', 'description', 'duration', 'completed', 'timestamp', 'updatedAt']))
        );
      allow delete: if isVerified() && isValidId(activityId) && existing().userId == request.auth.uid;
    }

    match /thoughtRecords/{recordId} {
      allow get: if isVerified() && isValidId(recordId) && existing().userId == request.auth.uid;
      allow list: if isVerified() && existing().userId == request.auth.uid;
      allow create: if isVerified()
        && isValidId(recordId)
        && isValidThoughtRecord(incoming())
        && incoming().createdAt == request.time
        && incoming().updatedAt == request.time;
      allow update: if isVerified()
        && isValidId(recordId)
        && existing().userId == request.auth.uid
        && isValidThoughtRecord(incoming())
        && incoming().userId == existing().userId
        && incoming().createdAt == existing().createdAt
        && incoming().updatedAt == request.time
        && incoming().diff(existing()).affectedKeys().hasOnly([
          'situation',
          'automaticThought',
          'distortion',
          'emotionIntensityBefore',
          'evidenceFor',
          'evidenceAgainst',
          'balancedThought',
          'emotionIntensityAfter',
          'updatedAt'
        ]);
      allow delete: if isVerified() && isValidId(recordId) && existing().userId == request.auth.uid;
    }

    match /chatSessions/{sessionId} {
      allow get: if isVerified() && isValidId(sessionId) && existing().userId == request.auth.uid;
      allow list: if isVerified() && existing().userId == request.auth.uid;
      allow create: if isVerified()
        && isValidId(sessionId)
        && isValidChatSession(incoming())
        && incoming().status == 'active'
        && incoming().messageCount == 0
        && incoming().createdAt == request.time
        && incoming().updatedAt == request.time;
      allow update: if isVerified()
        && isValidId(sessionId)
        && existing().userId == request.auth.uid
        && existing().status != 'archived'
        && isValidChatSession(incoming())
        && incoming().userId == existing().userId
        && incoming().createdAt == existing().createdAt
        && incoming().updatedAt == request.time
        && (
          (incoming().diff(existing()).affectedKeys().hasOnly(['title', 'updatedAt'])) ||
          (incoming().diff(existing()).affectedKeys().hasOnly(['primaryTechnique', 'currentGoal', 'messageCount', 'lastSentiment', 'updatedAt'])
            && incoming().messageCount >= existing().messageCount) ||
          (incoming().diff(existing()).affectedKeys().hasOnly(['status', 'updatedAt'])
            && incoming().status in ['completed', 'archived'])
        );
      allow delete: if isVerified() && isValidId(sessionId) && existing().userId == request.auth.uid;

      match /messages/{messageId} {
        allow get: if isVerified()
          && isValidId(sessionId)
          && isValidId(messageId)
          && existing().userId == request.auth.uid
          && exists(/databases/$(database)/documents/chatSessions/$(sessionId))
          && get(/databases/$(database)/documents/chatSessions/$(sessionId)).data.userId == request.auth.uid;
        allow list: if isVerified()
          && isValidId(sessionId)
          && existing().userId == request.auth.uid;
        allow create: if isVerified()
          && isValidId(sessionId)
          && isValidId(messageId)
          && isValidChatMessage(incoming(), sessionId)
          && incoming().createdAt == request.time
          && exists(/databases/$(database)/documents/chatSessions/$(sessionId))
          && get(/databases/$(database)/documents/chatSessions/$(sessionId)).data.userId == request.auth.uid
          && get(/databases/$(database)/documents/chatSessions/$(sessionId)).data.status == 'active';
        allow update: if false;
        allow delete: if isVerified()
          && isValidId(sessionId)
          && isValidId(messageId)
          && existing().userId == request.auth.uid;
      }
    }

    match /sentimentAnalyses/{analysisId} {
      allow get: if isVerified() && isValidId(analysisId) && existing().userId == request.auth.uid;
      allow list: if isVerified() && existing().userId == request.auth.uid;
      allow create: if isVerified()
        && isValidId(analysisId)
        && isValidSentimentAnalysis(incoming())
        && incoming().createdAt == request.time;
      allow update: if false;
      allow delete: if isVerified() && isValidId(analysisId) && existing().userId == request.auth.uid;
    }
  }
}
```

## File: `server.ts`

```typescript
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
```

## File: `netlify/functions/api.ts`

```typescript
import { GoogleGenAI, Type } from '@google/genai';

export const config = {
  path: '/api/*',
};

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
      description:
        'Primary emotion in 1-2 words (e.g., Anxious, Sad, Hopeful, Overwhelmed, Calm, Frustrated).',
    },
    cbtTechnique: {
      type: Type.STRING,
      description:
        'Primary CBT technique fit (e.g., Socratic Questioning, Cognitive Restructuring, Behavioral Activation, Grounding & Relaxation, Thought Record, Problem-Solving).',
    },
    detectedDistortion: {
      type: Type.STRING,
      description:
        'Detected cognitive distortion (All-or-Nothing Thinking, Overgeneralization, Catastrophizing, Personalization, Emotional Reasoning, Mental Filtering, Mind Reading, Should Statements) or "None Identified".',
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
      description:
        'Single primary emotion label (e.g., Calm, Hopeful, Anxious, Stressed, Sad, Overwhelmed, Balanced, Frustrated).',
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
      description:
        'Detected cognitive distortion (All-or-Nothing Thinking, Overgeneralization, Catastrophizing, Personalization, Emotional Reasoning, Mental Filtering, Mind Reading, Should Statements) or "None Identified".',
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
    throw new Error('GEMINI_API_KEY is not configured on Netlify Environment Variables.');
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

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export default async function handler(req: Request): Promise<Response> {
  const pathname = new URL(req.url).pathname;

  if (req.method === 'GET' && pathname === '/api/health') {
    return jsonResponse({ ok: true, service: 'mindful-cbt-api' });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  if (pathname === '/api/cbt/chat/stream') {
    const startedAt = Date.now();
    const body = (await req.json().catch(() => ({}))) as ChatRequestBody;
    const rawMessage = typeof body.message === 'string' ? body.message.trim() : '';

    if (!rawMessage) {
      return jsonResponse({ error: 'Message cannot be empty.' }, 400);
    }
    if (rawMessage.length > 6000) {
      return jsonResponse({ error: 'Message exceeds maximum length of 6000 characters.' }, 400);
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, payload: unknown) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`));
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

          const replyPromise = (async () => {
            const genStream = await ai.models.generateContentStream({
              model: FAST_MODEL,
              contents: contextText,
              config: {
                systemInstruction: CHAT_REPLY_SYSTEM_INSTRUCTION,
              },
            });

            let fullReply = '';
            for await (const chunk of genStream) {
              const piece = chunk.text ?? '';
              if (piece) {
                fullReply += piece;
                sendEvent('delta', { text: piece });
              }
            }
            return fullReply.trim();
          })();

          const [metadata, streamedReply] = await Promise.all([metadataPromise, replyPromise]);
          let finalReply = streamedReply;

          if (!finalReply) {
            sendEvent('error', { error: 'The CBT language model returned an empty response.' });
            controller.close();
            return;
          }

          if (keywordCrisis && !/988|helpline|emergency/i.test(finalReply)) {
            const crisisSuffix =
              '\n\nBecause you mentioned thoughts of hurting yourself, please know immediate human support is available right now: call or text 988 (US & Canada), text HOME to 741741, call local emergency services, or visit findahelpline.com.';
            finalReply += crisisSuffix;
            sendEvent('delta', { text: crisisSuffix });
          }

          sendEvent('done', {
            reply: finalReply.slice(0, 6000),
            ...metadata,
            responseTimeMs: Math.max(1, Date.now() - startedAt),
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unexpected server error.';
          sendEvent('error', { error: message });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  }

  if (pathname === '/api/cbt/chat') {
    const startedAt = Date.now();
    try {
      const body = (await req.json().catch(() => ({}))) as ChatRequestBody;
      const rawMessage = typeof body.message === 'string' ? body.message.trim() : '';

      if (!rawMessage) {
        return jsonResponse({ error: 'Message cannot be empty.' }, 400);
      }
      if (rawMessage.length > 6000) {
        return jsonResponse({ error: 'Message exceeds maximum length of 6000 characters.' }, 400);
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
        return jsonResponse({ error: 'The CBT language model returned an empty response.' }, 502);
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
        return jsonResponse({ error: 'Unable to parse therapeutic reply from model output.' }, 502);
      }

      if (keywordCrisis && !/988|helpline|emergency/i.test(replyText)) {
        replyText +=
          '\n\nBecause you mentioned thoughts of hurting yourself, please know immediate human support is available right now: call or text 988 (US & Canada), text HOME to 741741, call local emergency services, or visit findahelpline.com.';
      }

      return jsonResponse({
        reply: replyText.slice(0, 6000),
        ...metadata,
        responseTimeMs: Math.max(1, Date.now() - startedAt),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected server error.';
      const status =
        message.includes('API_KEY') || message.includes('PERMISSION_DENIED') ? 403 : 500;
      return jsonResponse({ error: message }, status);
    }
  }

  if (pathname === '/api/cbt/sentiment') {
    const startedAt = Date.now();
    try {
      const body = (await req.json().catch(() => ({}))) as { text?: unknown };
      const rawText = typeof body.text === 'string' ? body.text.trim() : '';

      if (!rawText) {
        return jsonResponse({ error: 'Please enter text to analyze.' }, 400);
      }
      if (rawText.length > 2000) {
        return jsonResponse({ error: 'Text exceeds maximum length of 2000 characters.' }, 400);
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
        return jsonResponse({ error: 'Sentiment analyzer returned an empty response.' }, 502);
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

      return jsonResponse({
        sentiment,
        valenceScore: isCrisis
          ? Math.min(clamp(parsed.valenceScore, 15), 25)
          : clamp(parsed.valenceScore, 50),
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
        responseTimeMs: Math.max(1, Date.now() - startedAt),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected server error.';
      const status =
        message.includes('API_KEY') || message.includes('PERMISSION_DENIED') ? 403 : 500;
      return jsonResponse({ error: message }, status);
    }
  }

  return jsonResponse({ error: 'Not found.' }, 404);
}
```

## File: `src/index.css`

```css
@import "tailwindcss";

@theme {
  --font-display: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
  --font-sans: "DM Sans", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
}

@layer base {
  body {
    font-family: var(--font-sans);
    background-color: #f8fafc;
    color: #0f172a;
  }

  h1, h2, h3, h4 {
    font-family: var(--font-display);
  }
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## File: `src/main.tsx`

```tsx
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
```

## File: `src/App.tsx`

```tsx
import { useEffect, useState } from 'react';
import {
  Activity,
  BarChart3,
  BookOpen,
  Database,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  X,
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingPage } from './components/LandingPage';
import { EmailVerificationScreen } from './components/EmailVerificationScreen';
import { ConsentModal } from './components/ConsentModal';
import { BreathingModal } from './components/BreathingModal';
import { OverviewDashboard } from './components/OverviewDashboard';
import { TherapistChat } from './components/TherapistChat';
import { SentimentAnalyzerView } from './components/SentimentAnalyzerView';
import { ThoughtRecordsView } from './components/ThoughtRecordsView';
import { WellnessTrackerView } from './components/WellnessTrackerView';
import { DataVaultView } from './components/DataVaultView';
import {
  subscribeActivities,
  subscribeChatSessions,
  subscribeLoginSessions,
  subscribeMoods,
  subscribeSentimentAnalyses,
  subscribeThoughtRecords,
} from './services/firestoreService';
import type {
  ActivityEntry,
  AppView,
  ChatSession,
  LoginSession,
  MoodEntry,
  SentimentAnalysis,
  ThoughtRecord,
} from './types/mindful';

const NAV_ITEMS: { id: AppView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'chat', label: 'CBT Therapist', icon: MessageSquare },
  { id: 'sentiment', label: 'Sentiment Analyzer', icon: BarChart3 },
  { id: 'thoughts', label: 'Thought Records', icon: BookOpen },
  { id: 'wellness', label: 'Mood & Activities', icon: Activity },
  { id: 'vault', label: 'Cloud Data Vault', icon: Database },
];

function MindfulWorkspace() {
  const { user, emailVerified, profile, authReady, signOutUser } = useAuth();
  const [activeView, setActiveView] = useState<AppView>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [breathingOpen, setBreathingOpen] = useState(false);

  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [thoughtRecords, setThoughtRecords] = useState<ThoughtRecord[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [sentimentAnalyses, setSentimentAnalyses] = useState<SentimentAnalysis[]>([]);
  const [loginSessions, setLoginSessions] = useState<LoginSession[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!user || !emailVerified || !profile?.consentAccepted) {
      setMoods([]);
      setActivities([]);
      setThoughtRecords([]);
      setChatSessions([]);
      setSentimentAnalyses([]);
      setLoginSessions([]);
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    let settled = 0;
    const markSettled = () => {
      settled += 1;
      if (settled >= 3) setDataLoading(false);
    };

    const unsubMoods = subscribeMoods(user.uid, (data) => {
      setMoods(data);
      markSettled();
    });
    const unsubActivities = subscribeActivities(user.uid, (data) => {
      setActivities(data);
      markSettled();
    });
    const unsubThoughts = subscribeThoughtRecords(user.uid, (data) => {
      setThoughtRecords(data);
      markSettled();
    });
    const unsubChats = subscribeChatSessions(user.uid, (data) => {
      setChatSessions(data);
    });
    const unsubSentiments = subscribeSentimentAnalyses(user.uid, (data) => {
      setSentimentAnalyses(data);
    });
    const unsubLogins = subscribeLoginSessions(user.uid, (data) => {
      setLoginSessions(data);
    });

    return () => {
      unsubMoods();
      unsubActivities();
      unsubThoughts();
      unsubChats();
      unsubSentiments();
      unsubLogins();
    };
  }, [user, emailVerified, profile?.consentAccepted]);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm text-slate-500">Connecting to Mindful...</div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  if (!emailVerified) {
    return <EmailVerificationScreen />;
  }

  if (profile && !profile.consentAccepted) {
    return <ConsentModal />;
  }

  const currentNav = NAV_ITEMS.find((n) => n.id === activeView) ?? NAV_ITEMS[0];

  const handleSelectView = (view: AppView) => {
    setActiveView(view);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-slate-200">
        <div className="h-16 px-6 flex items-center border-b border-slate-200">
          <span
            className="text-lg font-bold tracking-tight text-slate-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Mindful
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectView(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-teal-50 text-teal-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-teal-700' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-3">
          <div className="px-2">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {profile?.displayName || 'Mindful Member'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Need urgent help? Call 988
            </p>
          </div>
          <button
            type="button"
            onClick={signOutUser}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-full bg-white h-full border-r border-slate-200 flex flex-col">
            <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200">
              <span
                className="text-lg font-bold tracking-tight text-slate-900"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Mindful
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-900 cursor-pointer"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectView(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                      active
                        ? 'bg-teal-50 text-teal-900'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${active ? 'text-teal-700' : 'text-slate-400'}`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-200">
              <button
                type="button"
                onClick={signOutUser}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-md cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm text-slate-500 flex items-center gap-2 truncate">
              <span className="hidden sm:inline">Mindful</span>
              <span className="hidden sm:inline" aria-hidden="true">
                /
              </span>
              <span className="font-semibold text-slate-900 truncate">{currentNav.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleSelectView('chat')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              CBT Session
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
          {activeView === 'overview' && (
            <OverviewDashboard
              moods={moods}
              activities={activities}
              thoughtRecords={thoughtRecords}
              chatSessions={chatSessions}
              loading={dataLoading}
              onNavigate={handleSelectView}
              onOpenBreathing={() => setBreathingOpen(true)}
            />
          )}

          {activeView === 'chat' && (
            <TherapistChat
              sessions={chatSessions}
              moods={moods}
              onNavigate={handleSelectView}
              onOpenBreathing={() => setBreathingOpen(true)}
            />
          )}

          {activeView === 'sentiment' && (
            <SentimentAnalyzerView
              analyses={sentimentAnalyses}
              moods={moods}
              onNavigate={handleSelectView}
              onOpenBreathing={() => setBreathingOpen(true)}
            />
          )}

          {activeView === 'thoughts' && <ThoughtRecordsView records={thoughtRecords} />}

          {activeView === 'wellness' && (
            <WellnessTrackerView
              moods={moods}
              activities={activities}
              onOpenBreathing={() => setBreathingOpen(true)}
            />
          )}

          {activeView === 'vault' && (
            <DataVaultView
              moods={moods}
              activities={activities}
              thoughtRecords={thoughtRecords}
              chatSessions={chatSessions}
              sentimentAnalyses={sentimentAnalyses}
              loginSessions={loginSessions}
            />
          )}
        </main>
      </div>

      <BreathingModal open={breathingOpen} onClose={() => setBreathingOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MindfulWorkspace />
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

## File: `src/types/mindful.ts`

```typescript
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
```

## File: `src/lib/firebase.ts`

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testConnection();
```

## File: `src/lib/validation.ts`

```typescript
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
```

## File: `src/services/firestoreService.ts`

```typescript
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
```

## File: `src/context/AuthContext.tsx`

```tsx
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  acceptInformedConsent,
  createLoginSession,
  ensureUserDocuments,
  markLoginSessionSignedOut,
  updateUserProfile,
} from '../services/firestoreService';
import type { UserPrivateInfo, UserProfile } from '../types/mindful';

interface AuthContextValue {
  user: User | null;
  emailVerified: boolean;
  profile: UserProfile | null;
  privateInfo: UserPrivateInfo | null;
  authReady: boolean;
  authBusy: boolean;
  authError: string | null;
  authNotice: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (params: { email: string; password: string }) => Promise<void>;
  signUpWithEmail: (params: { name: string; email: string; password: string }) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;
  refreshEmailVerification: () => Promise<boolean>;
  signOutUser: () => Promise<void>;
  acceptConsent: () => Promise<void>;
  saveProfile: (updates: { displayName: string; therapeuticGoal: string }) => Promise<void>;
  clearAuthMessages: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function formatAuthError(err: unknown, fallback: string): string {
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code?: unknown }).code)
      : '';
  const msg = err instanceof Error ? err.message : '';

  if (code === 'auth/email-already-in-use') {
    return 'An account with this email already exists. Try logging in instead.';
  }
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'Incorrect email or password. Please check your credentials and try again.';
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }
  if (code === 'auth/weak-password') {
    return 'Password should be at least 6 characters long.';
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many attempts. Please wait a moment before trying again.';
  }
  if (code === 'auth/operation-not-allowed' || msg.includes('PASSWORD_LOGIN_DISABLED')) {
    return 'Email/Password sign-in is not enabled yet in Firebase Console (Authentication → Sign-in method).';
  }
  return msg || fallback;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [privateInfo, setPrivateInfo] = useState<UserPrivateInfo | null>(null);
  const [loginSessionId, setLoginSessionId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [verificationTick, setVerificationTick] = useState(0);

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;
    let unsubPrivate: (() => void) | undefined;

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubProfile) unsubProfile();
      if (unsubPrivate) unsubPrivate();

      if (!firebaseUser) {
        setUser(null);
        setEmailVerified(false);
        setProfile(null);
        setPrivateInfo(null);
        setLoginSessionId(null);
        setAuthReady(true);
        return;
      }

      setUser(firebaseUser);
      setEmailVerified(firebaseUser.emailVerified);

      if (!firebaseUser.emailVerified) {
        setProfile(null);
        setPrivateInfo(null);
        setAuthReady(true);
        return;
      }

      try {
        // Ensure ID token reflects email_verified before Firestore writes
        await firebaseUser.getIdToken(true);
        const docs = await ensureUserDocuments(firebaseUser);
        setProfile(docs.profile);
        setPrivateInfo(docs.privateInfo);

        const existingSessionId = sessionStorage.getItem(`mindful_ls_${firebaseUser.uid}`);
        if (existingSessionId) {
          setLoginSessionId(existingSessionId);
        } else {
          const newSessionId = await createLoginSession(firebaseUser.uid);
          sessionStorage.setItem(`mindful_ls_${firebaseUser.uid}`, newSessionId);
          setLoginSessionId(newSessionId);
        }

        unsubProfile = onSnapshot(
          doc(db, 'users', firebaseUser.uid),
          (snap) => {
            if (snap.exists()) {
              setProfile(snap.data() as UserProfile);
            }
          },
          (err) => handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`)
        );

        unsubPrivate = onSnapshot(
          doc(db, 'users', firebaseUser.uid, 'private', 'info'),
          (snap) => {
            if (snap.exists()) {
              setPrivateInfo(snap.data() as UserPrivateInfo);
            }
          },
          (err) =>
            handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}/private/info`)
        );
      } catch (err) {
        setAuthError(err instanceof Error ? err.message : 'Unable to initialize your cloud account.');
      } finally {
        setAuthReady(true);
      }
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
      if (unsubPrivate) unsubPrivate();
    };
  }, [verificationTick]);

  const clearAuthMessages = useCallback(() => {
    setAuthError(null);
    setAuthNotice(null);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthBusy(true);
    setAuthError(null);
    setAuthNotice(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const message = formatAuthError(err, 'Google sign-in could not be completed.');
      if (!message.includes('popup-closed-by-user')) {
        setAuthError(message);
      }
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const signInWithEmail = useCallback(async ({ email, password }: { email: string; password: string }) => {
    setAuthBusy(true);
    setAuthError(null);
    setAuthNotice(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setAuthError(formatAuthError(err, 'Unable to log in with email and password.'));
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const signUpWithEmail = useCallback(
    async ({ name, email, password }: { name: string; email: string; password: string }) => {
      setAuthBusy(true);
      setAuthError(null);
      setAuthNotice(null);
      try {
        const cleanName = name.trim();
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (cleanName) {
          await updateProfile(cred.user, { displayName: cleanName.slice(0, 100) });
        }
        await sendEmailVerification(cred.user);
        setAuthNotice('Account created. A verification link has been sent to your email.');
      } catch (err) {
        setAuthError(formatAuthError(err, 'Unable to create your account.'));
      } finally {
        setAuthBusy(false);
      }
    },
    []
  );

  const sendPasswordReset = useCallback(async (email: string) => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setAuthError('Enter your email address first to receive a password reset link.');
      return;
    }
    setAuthBusy(true);
    setAuthError(null);
    setAuthNotice(null);
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setAuthNotice(`Password reset email sent to ${cleanEmail}.`);
    } catch (err) {
      setAuthError(formatAuthError(err, 'Unable to send password reset email.'));
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const resendVerificationEmail = useCallback(async () => {
    if (!auth.currentUser) return;
    setAuthBusy(true);
    setAuthError(null);
    setAuthNotice(null);
    try {
      await sendEmailVerification(auth.currentUser);
      setAuthNotice(`Verification email resent to ${auth.currentUser.email}.`);
    } catch (err) {
      setAuthError(formatAuthError(err, 'Unable to resend verification email.'));
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const refreshEmailVerification = useCallback(async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    setAuthBusy(true);
    setAuthError(null);
    setAuthNotice(null);
    try {
      await auth.currentUser.reload();
      await auth.currentUser.getIdToken(true);
      const verified = Boolean(auth.currentUser.emailVerified);
      setEmailVerified(verified);
      if (verified) {
        setVerificationTick((n) => n + 1);
      } else {
        setAuthError('Email is not verified yet. Please click the link in your inbox, then try again.');
      }
      return verified;
    } catch (err) {
      setAuthError(formatAuthError(err, 'Unable to check verification status.'));
      return false;
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setAuthBusy(true);
    setAuthError(null);
    setAuthNotice(null);
    try {
      if (user && loginSessionId) {
        await markLoginSessionSignedOut(loginSessionId).catch(() => {});
        sessionStorage.removeItem(`mindful_ls_${user.uid}`);
      }
      await signOut(auth);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Sign-out failed.');
    } finally {
      setAuthBusy(false);
    }
  }, [user, loginSessionId]);

  const acceptConsent = useCallback(async () => {
    if (!user) return;
    await acceptInformedConsent(user.uid);
  }, [user]);

  const saveProfile = useCallback(
    async (updates: { displayName: string; therapeuticGoal: string }) => {
      if (!user) return;
      await updateUserProfile(user.uid, updates);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        emailVerified,
        profile,
        privateInfo,
        authReady,
        authBusy,
        authError,
        authNotice,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        resendVerificationEmail,
        refreshEmailVerification,
        signOutUser,
        acceptConsent,
        saveProfile,
        clearAuthMessages,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return ctx;
}
```

## File: `src/components/ErrorBoundary.tsx`

```tsx
import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error?.message || 'An unexpected error occurred in Mindful.',
    };
  }

  componentDidCatch(error: Error) {
    console.error('Mindful ErrorBoundary caught:', error);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      let parsedMessage = this.state.message;
      try {
        const parsed = JSON.parse(this.state.message) as { error?: string; path?: string };
        if (parsed.error) {
          parsedMessage = `${parsed.error}${parsed.path ? ` (${parsed.path})` : ''}`;
        }
      } catch {
        // Keep original string message
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-xl p-8">
            <div className="flex items-center gap-3 text-red-700 mb-4">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h1 className="text-lg font-semibold text-slate-900">
                Something interrupted your session
              </h1>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-6 break-words">
              {parsedMessage}
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reload Mindful
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## File: `src/components/LandingPage.tsx`

```tsx
import { useState, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LandingPage() {
  const {
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
    authBusy,
    authError,
    authNotice,
    clearAuthMessages,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const switchMode = (next: 'login' | 'signup') => {
    setMode(next);
    clearAuthMessages();
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      await signInWithEmail({ email, password });
    } else {
      await signUpWithEmail({ name, email, password });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between px-4 py-8">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8 space-y-6">
          <div className="text-center space-y-1.5">
            <h1
              className="text-2xl font-bold tracking-tight text-slate-900"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Mindful
            </h1>
            <p className="text-sm text-slate-600">
              {mode === 'login'
                ? 'Log in to your private CBT companion and cloud vault.'
                : 'Create your account to start CBT sessions and sentiment tracking.'}
            </p>
          </div>

          {/* Log In / Sign Up Switch */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {authError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs text-red-800">
              <span>{authError}</span>
              <button
                type="button"
                onClick={clearAuthMessages}
                className="font-semibold underline shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {authNotice && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg px-3.5 py-2.5 text-xs text-teal-900">
              {authNotice}
            </div>
          )}

          {/* Email & Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label htmlFor="auth-name" className="block text-xs font-medium text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  id="auth-name"
                  type="text"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-medium text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="auth-password" className="block text-xs font-medium text-slate-700">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    disabled={authBusy}
                    onClick={() => void sendPasswordReset(email)}
                    className="text-xs font-medium text-teal-800 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 6 characters' : 'Enter password'}
                  className="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authBusy}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
            >
              <span>
                {authBusy
                  ? 'Please wait...'
                  : mode === 'login'
                    ? 'Log In with Email'
                    : 'Create Account'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-xs text-slate-400 shrink-0">or</span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          <button
            type="button"
            onClick={signInWithGoogle}
            disabled={authBusy}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-800 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
          >
            <span>{mode === 'login' ? 'Log in with Google' : 'Sign up with Google'}</span>
          </button>
        </div>
      </div>

      <footer className="text-center text-xs text-slate-500 pt-6">
        If you are in immediate crisis, call or text 988 (US/Canada) or local emergency services.
      </footer>
    </div>
  );
}
```

## File: `src/components/EmailVerificationScreen.tsx`

```tsx
import { MailCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function EmailVerificationScreen() {
  const {
    user,
    authBusy,
    authError,
    authNotice,
    resendVerificationEmail,
    refreshEmailVerification,
    signOutUser,
  } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
            <MailCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Verify your email</h1>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          To protect your private reflections and cloud vault, Mindful requires a verified email
          address. Open the verification link sent to your inbox, then continue below.
        </p>

        {authError && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 text-xs text-red-800">
            {authError}
          </div>
        )}

        {authNotice && (
          <div className="bg-teal-50 border border-teal-200 rounded-lg px-3.5 py-2.5 text-xs text-teal-900">
            {authNotice}
          </div>
        )}

        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            disabled={authBusy}
            onClick={() => void refreshEmailVerification()}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-60 rounded-lg cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{authBusy ? 'Checking...' : "I've Verified — Continue"}</span>
          </button>

          <button
            type="button"
            disabled={authBusy}
            onClick={() => void resendVerificationEmail()}
            className="w-full px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 disabled:opacity-60 rounded-lg cursor-pointer"
          >
            Resend Verification Email
          </button>

          <button
            type="button"
            disabled={authBusy}
            onClick={signOutUser}
            className="w-full px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Sign out or use a different account
          </button>
        </div>
      </div>
    </div>
  );
}
```

## File: `src/components/ConsentModal.tsx`

```tsx
import { useState } from 'react';
import { PhoneCall, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function ConsentModal() {
  const { acceptConsent, signOutUser, profile } = useAuth();
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!checked) return;
    setSubmitting(true);
    setError(null);
    try {
      await acceptConsent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your consent.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white border border-slate-200 rounded-xl p-8">
        <div className="flex items-center gap-2.5 text-teal-800 text-xs font-semibold mb-3">
          <ShieldCheck className="w-4 h-4" />
          <span>Informed Consent & Ethical AI Disclosure</span>
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">
          Welcome to Mindful{profile?.displayName ? `, ${profile.displayName}` : ''}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          Before starting your sessions or logging personal reflections, please review how Mindful
          operates and how your cloud data is protected.
        </p>

        <div className="space-y-4 border-t border-b border-slate-200 py-5 text-sm text-slate-700 leading-relaxed">
          <div>
            <h2 className="font-semibold text-slate-900 mb-1">
              1. Scope of Support (Non-Diagnostic)
            </h2>
            <p className="text-slate-600">
              Mindful uses Cognitive Behavioral Therapy (CBT) principles to support reflection,
              mood awareness, and coping skills for mild to moderate stress. It is not a
              substitute for a licensed therapist, physician, or clinical diagnosis.
            </p>
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 mb-1">
              2. Private Cloud Storage & User Control
            </h2>
            <p className="text-slate-600">
              Your mood logs, thought records, activities, and chat transcripts are stored in
              Google Cloud Firestore under strict owner-only security rules. You can inspect,
              export, or permanently delete any record at any time from the Cloud Data Vault.
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 flex items-start gap-3">
            <PhoneCall className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-relaxed">
              <strong>Emergency Protocol:</strong> Mindful cannot respond to acute medical or
              psychiatric emergencies. If you feel unsafe or have thoughts of self-harm, call or
              text <strong>988</strong> (US/Canada), contact local emergency services, or visit{' '}
              <strong>findahelpline.com</strong>.
            </p>
          </div>
        </div>

        <label className="mt-5 flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
          />
          <span className="text-sm text-slate-700">
            I understand that Mindful provides AI-guided CBT self-support rather than clinical
            diagnosis, and I consent to storing my personal wellness entries in my private cloud
            vault.
          </span>
        </label>

        {error && (
          <p className="mt-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="mt-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={signOutUser}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Sign Out
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!checked || submitting}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
          >
            {submitting ? 'Saving Consent...' : 'Accept & Enter Workspace'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

## File: `src/components/BreathingModal.tsx`

```tsx
import { useEffect, useState } from 'react';
import { Check, Pause, Play, RotateCcw, Wind, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createActivityEntry } from '../services/firestoreService';

interface BreathingModalProps {
  open: boolean;
  onClose: () => void;
}

type Phase = 'inhale' | 'hold' | 'exhale';

const PHASE_DURATION: Record<Phase, number> = {
  inhale: 4,
  hold: 7,
  exhale: 8,
};

const PHASE_LABEL: Record<Phase, string> = {
  inhale: 'Inhale gently through your nose',
  hold: 'Hold your breath softly',
  exhale: 'Exhale slowly through your mouth',
};

export function BreathingModal({ open, onClose }: BreathingModalProps) {
  const { user } = useAuth();
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [secondsLeft, setSecondsLeft] = useState(4);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (!open) {
      setRunning(false);
      return;
    }
    if (!running) return;

    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;
        setPhase((currentPhase) => {
          if (currentPhase === 'inhale') {
            setSecondsLeft(PHASE_DURATION.hold);
            return 'hold';
          }
          if (currentPhase === 'hold') {
            setSecondsLeft(PHASE_DURATION.exhale);
            return 'exhale';
          }
          setCyclesCompleted((c) => c + 1);
          setSecondsLeft(PHASE_DURATION.inhale);
          return 'inhale';
        });
        return 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [open, running]);

  if (!open) return null;

  const handleReset = () => {
    setRunning(false);
    setPhase('inhale');
    setSecondsLeft(PHASE_DURATION.inhale);
    setCyclesCompleted(0);
    setElapsedSeconds(0);
    setSavedNotice(false);
  };

  const handleLogSession = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const minutes = Math.max(1, Math.round(elapsedSeconds / 60));
      await createActivityEntry(user.uid, {
        type: 'relaxation',
        name: '4-7-8 Grounding Breathing',
        description: `Completed ${cyclesCompleted} breathing cycles to calm physiological arousal.`,
        duration: minutes,
        completed: true,
      });
      setSavedNotice(true);
    } finally {
      setSaving(false);
    }
  };

  const scaleClass =
    phase === 'inhale'
      ? 'scale-110 bg-teal-50 border-teal-300'
      : phase === 'hold'
        ? 'scale-110 bg-teal-100/70 border-teal-500'
        : 'scale-95 bg-slate-50 border-slate-300';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-teal-700" />
            <h2 className="text-base font-semibold text-slate-900">
              4-7-8 Paced Breathing
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close breathing exercise"
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-8 flex flex-col items-center text-center">
          <div
            className={`w-40 h-40 rounded-full border-2 flex flex-col items-center justify-center transition-transform duration-1000 ease-out ${scaleClass}`}
          >
            <span className="text-3xl font-semibold font-mono tabular-nums text-slate-900">
              {secondsLeft}s
            </span>
            <span className="text-xs font-medium text-teal-800 capitalize mt-1">{phase}</span>
          </div>

          <p className="text-sm font-medium text-slate-800 mt-6">{PHASE_LABEL[phase]}</p>
          <p className="text-xs text-slate-500 mt-1 font-mono tabular-nums">
            Cycles: {cyclesCompleted} · Elapsed: {Math.floor(elapsedSeconds / 60)}:
            {String(elapsedSeconds % 60).padStart(2, '0')}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pb-4">
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors cursor-pointer"
          >
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{running ? 'Pause' : 'Start'}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500">
            {savedNotice ? 'Saved to your Wellness Tracker.' : 'Log this relaxation session'}
          </span>
          <button
            type="button"
            onClick={handleLogSession}
            disabled={saving || savedNotice}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 disabled:opacity-60 border border-teal-200 rounded-lg transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{savedNotice ? 'Logged' : saving ? 'Saving...' : 'Save Activity'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
```

## File: `src/components/OverviewDashboard.tsx`

```tsx
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
```

## File: `src/components/TherapistChat.tsx`

```tsx
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
```

## File: `src/components/SentimentAnalyzerView.tsx`

```tsx
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
```

## File: `src/components/ThoughtRecordsView.tsx`

```tsx
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
```

## File: `src/components/WellnessTrackerView.tsx`

```tsx
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
```

## File: `src/components/DataVaultView.tsx`

```tsx
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
```

