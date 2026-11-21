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
