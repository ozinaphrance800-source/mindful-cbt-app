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
