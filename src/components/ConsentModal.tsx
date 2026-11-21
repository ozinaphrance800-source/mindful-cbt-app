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
