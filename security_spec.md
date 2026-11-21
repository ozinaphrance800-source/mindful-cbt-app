# Mindful Security Specification & Red-Team Threat Model

## 1. Data Invariants
1. **Strict Ownership Isolation**: Every document in `/users/{userId}`, `/users/{userId}/private/{docId}`, `/userSessions/{sessionDocId}`, `/moods/{moodId}`, `/activities/{activityId}`, `/thoughtRecords/{recordId}`, `/chatSessions/{sessionId}`, and `/chatSessions/{sessionId}/messages/{messageId}` belongs strictly to a single authenticated, email-verified user (`request.auth.uid`). No cross-user reads or writes are permitted.
2. **PII Isolation**: User email addresses are isolated in `/users/{userId}/private/info` and strictly gated to `request.auth.uid == userId && isVerified()`.
3. **Master Gate on Subcollections**: Creating, reading, or deleting a message in `/chatSessions/{sessionId}/messages/{messageId}` requires the parent `/chatSessions/{sessionId}` document to exist and belong to `request.auth.uid`. Messages cannot be written into an `archived` session.
4. **Immutable Ownership & Creation Timestamps**: `userId`, `uid`, `sessionId`, and `createdAt` cannot be modified after creation. `createdAt` and `updatedAt` must equal `request.time`.
5. **Strict Bounds & Type Safety**:
   - Mood `score` must be a number in `[0, 100]`; `triggers` array size `<= 5`.
   - Activity `duration` must be a number in `[0, 480]`.
   - Thought record `emotionIntensityBefore` and `emotionIntensityAfter` must be in `[0, 100]`.
   - All document IDs must pass `^[a-zA-Z0-9_\-]+$` and length `<= 128`.
   - All string fields have explicit `.size()` limits to prevent 1MB document stuffing.
6. **Terminal State Locking**: Once a `ChatSession` transitions to `archived`, no further updates are permitted on that session (only deletion by the owner is allowed).
7. **Query Enforcer (`allow list`)**: Every `allow list` rule explicitly evaluates `resource.data.userId == request.auth.uid` (no blanket `isSignedIn()` reads).

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Cross-User Mood Injection**: Authenticated as `userA`, attempt to `create` `/moods/m1` with `userId: "userB"`. Expected: `PERMISSION_DENIED`.
2. **Mood Score Out-of-Bounds**: Attempt to `create` `/moods/m2` with `score: 120` or `score: -5`. Expected: `PERMISSION_DENIED`.
3. **Shadow Field Injection (Ghost Field)**: Attempt to `create` or `update` `/users/userA` with an unexpected field `isAdmin: true`. Expected: `PERMISSION_DENIED`.
4. **Unverified Email Spoof**: Request where `request.auth.token.email_verified == false`. Expected: `PERMISSION_DENIED`.
5. **ID Poisoning**: Attempt to `create` `/moods/../../evil$id` or a 300-char document ID. Expected: `PERMISSION_DENIED`.
6. **Client-Forged Timestamp**: Attempt to `create` `/moods/m3` with `createdAt` set to a past client date instead of `request.time`. Expected: `PERMISSION_DENIED`.
7. **Orphaned Message Write**: Attempt to `create` `/chatSessions/nonExistentSession/messages/msg1` where parent session does not exist or belongs to another user. Expected: `PERMISSION_DENIED`.
8. **Archived Session Mutation**: Attempt to `update` a `ChatSession` whose existing `status == "archived"`. Expected: `PERMISSION_DENIED`.
9. **Immutable Ownership Hijack**: Attempt to `update` `/thoughtRecords/tr1` changing `userId` from `userA` to `userB`. Expected: `PERMISSION_DENIED`.
10. **PII Cross-Read**: Authenticated as `userB`, attempt to `get` `/users/userA/private/info`. Expected: `PERMISSION_DENIED`.
11. **Unbounded Array Stuffing**: Attempt to `create` `/moods/m4` with `triggers` containing 20 strings. Expected: `PERMISSION_DENIED`.
12. **Blanket List Scraping**: Authenticated as `userA`, attempt `list` on `/moods` without `where("userId", "==", "userA")`. Expected: `PERMISSION_DENIED`.
