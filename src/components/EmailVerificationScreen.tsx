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
