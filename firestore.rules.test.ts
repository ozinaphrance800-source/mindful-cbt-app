/**
 * Mindful Firestore Security Rules Verification Spec
 * Maps each of the "Dirty Dozen" adversarial payloads from security_spec.md
 * to the security rule invariants enforced in firestore.rules.
 */

export interface DirtyDozenCase {
  id: string;
  name: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  expectedOutcome: 'PERMISSION_DENIED';
  enforcedBy: string;
}

export const DIRTY_DOZEN_CASES: DirtyDozenCase[] = [
  {
    id: 'DD-01',
    name: 'Cross-User Mood Injection',
    collectionPath: '/moods/m1',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedBy: 'isValidMoodEntry: data.userId == request.auth.uid',
  },
  {
    id: 'DD-02',
    name: 'Mood Score Out-of-Bounds (-5 or 120)',
    collectionPath: '/moods/m2',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedBy: 'isValidMoodEntry: data.score >= 0 && data.score <= 100',
  },
  {
    id: 'DD-03',
    name: 'Shadow Field Injection (isAdmin: true)',
    collectionPath: '/users/userA',
    operation: 'update',
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedBy: 'isValidUserProfile: keys().hasOnly([...]) + affectedKeys().hasOnly([...])',
  },
  {
    id: 'DD-04',
    name: 'Unverified Email Spoof',
    collectionPath: '/moods/m3',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedBy: 'isVerified: request.auth.token.email_verified == true',
  },
  {
    id: 'DD-05',
    name: 'Document ID Poisoning',
    collectionPath: '/moods/evil$id_with_invalid_chars',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedBy: 'isValidId(moodId): matches ^[a-zA-Z0-9_\\-]+$ and size <= 128',
  },
  {
    id: 'DD-06',
    name: 'Client-Forged Timestamp',
    collectionPath: '/moods/m4',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedBy: 'incoming().createdAt == request.time && incoming().updatedAt == request.time',
  },
  {
    id: 'DD-07',
    name: 'Orphaned Message Write to Foreign or Missing Session',
    collectionPath: '/chatSessions/missing/messages/msg1',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedBy: 'Master Gate exists() && get().data.userId == request.auth.uid',
  },
  {
    id: 'DD-08',
    name: 'Archived Session Terminal State Mutation',
    collectionPath: '/chatSessions/s1',
    operation: 'update',
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedBy: "existing().status != 'archived'",
  },
  {
    id: 'DD-09',
    name: 'Immutable Ownership Hijack on ThoughtRecord',
    collectionPath: '/thoughtRecords/tr1',
    operation: 'update',
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedBy: 'incoming().userId == existing().userId && affectedKeys().hasOnly([...])',
  },
  {
    id: 'DD-10',
    name: 'PII Cross-Read on Private Info',
    collectionPath: '/users/userA/private/info',
    operation: 'get',
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedBy: 'isOwner(userId) && docId == info',
  },
  {
    id: 'DD-11',
    name: 'Unbounded Array Stuffing on Triggers',
    collectionPath: '/moods/m5',
    operation: 'create',
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedBy: 'isValidMoodEntry: data.triggers.size() <= 5',
  },
  {
    id: 'DD-12',
    name: 'Blanket List Scraping Without Owner Filter',
    collectionPath: '/moods',
    operation: 'list',
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedBy: 'allow list: if isVerified() && existing().userId == request.auth.uid',
  },
];
