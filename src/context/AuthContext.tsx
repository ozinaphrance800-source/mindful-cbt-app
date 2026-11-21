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
