import React, { useState } from 'react';
import { AppView } from './types';
import { Practice } from './views/Practice';
import { Home } from './views/Home';
import { IRAC } from './views/IRAC';
import { Login } from './components/Auth/Login';
import { Signup } from './components/Auth/Signup';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AdminUpload } from './views/AdminUpload';
import { AdminQuestionGenerator } from './views/AdminQuestionGenerator';
import {
  Home as HomeIcon,
  BookOpen,
  Scale,
  User as UserIcon,
  Loader,
  AlertCircle,
  Sun,
  Moon,
  Flame,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, profile, loading, isConfigured, signOut, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [isQuizActive, setIsQuizActive] = useState(false);

  const handleNavigate = (view: AppView) => {
    setIsQuizActive(false);
    setCurrentView(view);
  };

  // Show configuration error if Supabase is missing
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Configuration Error</h1>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            The application is missing required configuration. Please check your environment variables.
          </p>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg text-left text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto">
            <p>Missing: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-slate-900 dark:text-white mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screens if not logged in
  if (!user || !profile) {
    if (authView === 'login') {
      return <Login onSwitchToSignup={() => setAuthView('signup')} />;
    }
    return <Signup onSwitchToLogin={() => setAuthView('login')} />;
  }

  const handleLogout = async () => {
    await signOut();
    handleNavigate(AppView.HOME);
  };

  const isAdmin = profile.role === 'admin';

  // Helper to render the active view
  const renderView = () => {
    switch (currentView) {
      case AppView.HOME:
        return profile ? (
          <Home
            user={{
              id: profile.id,
              name: profile.name,
              university: profile.university,
              level: profile.level,
              courses: profile.courses,
            }}
            onNavigate={handleNavigate}
          />
        ) : null;

      case AppView.PRACTICE:
        return profile ? (
          <Practice
            user={{
              name: profile.name,
              university: profile.university,
              level: profile.level,
              courses: profile.courses,
              hasOnboarded: true,
            }}
            onQuizStateChange={setIsQuizActive}
          />
        ) : null;

      case AppView.IRAC:
        return profile ? (
          <IRAC
            user={{
              id: profile.id,
              name: profile.name,
              university: profile.university,
              level: profile.level,
              courses: profile.courses,
            }}
          />
        ) : null;

      case AppView.PROFILE:
        return <ProfileView profile={profile} onLogout={handleLogout} onNavigate={handleNavigate} onUpdateSemester={(s) => updateProfile({ semester: s })} />;

      case AppView.ADMIN:
        return isAdmin ? <AdminUpload /> : <div className="p-8 text-center text-slate-500 dark:text-slate-400">Access denied.</div>;

      case 'ADMIN_GENERATOR' as AppView:
        return isAdmin ? <AdminQuestionGenerator /> : <div className="p-8 text-center text-slate-500 dark:text-slate-400">Access denied.</div>;

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-stone-100 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-200">
      {/* Top Navbar — hidden during active quiz */}
      {!isQuizActive && (
        <header className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 px-6 py-4 flex items-center justify-between transition-colors duration-200">
          <div className="flex items-center gap-2">
            <img src="/logo_icon.png" alt="Learned" className="w-8 h-8 rounded-full" />
            <span className="text-xl font-serif font-bold text-slate-900 dark:text-white">Learned</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
            <button
              onClick={() => handleNavigate(AppView.HOME)}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors ${currentView === AppView.HOME ? 'text-slate-900 dark:text-white font-semibold' : ''}`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavigate(AppView.PRACTICE)}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors ${currentView === AppView.PRACTICE ? 'text-slate-900 dark:text-white font-semibold' : ''}`}
            >
              Practice
            </button>
            <button
              onClick={() => handleNavigate(AppView.IRAC)}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors ${currentView === AppView.IRAC ? 'text-slate-900 dark:text-white font-semibold' : ''}`}
            >
              IRAC
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={() => handleNavigate(AppView.PROFILE)}
              className="flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-700"
            >
              <span className="text-slate-900 dark:text-slate-200">{profile?.name.split(' ')[0]}</span>
              <div className="w-8 h-8 bg-slate-900 dark:bg-slate-700 rounded-full flex items-center justify-center text-white">
                <UserIcon size={14} />
              </div>
            </button>
          </div>

          {/* Mobile theme toggle */}
          <div className="md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto flex flex-col ${isQuizActive ? 'pb-0' : 'pb-20 md:pb-0'}`}>
        <div className="flex-1">
          {renderView()}
        </div>

        {/* Footer */}
        {!isQuizActive && (
          <footer className="py-8 px-4 text-center">
            <p className="text-[10px] text-slate-400 dark:text-slate-600 font-medium uppercase tracking-widest">
              Learned is a product of REFORMA DIGITAL SOLUTIONS LIMITED (RC Number: 8801487)
            </p>
          </footer>
        )}
      </main>

      {/* Mobile Bottom Navigation — hidden during active quiz */}
      {!isQuizActive && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-around py-3 px-2 pb-safe z-50 transition-colors duration-200">
          <NavButton
            active={currentView === AppView.HOME}
            onClick={() => handleNavigate(AppView.HOME)}
            icon={<HomeIcon size={22} />}
            label="Home"
          />
          <NavButton
            active={currentView === AppView.PRACTICE}
            onClick={() => handleNavigate(AppView.PRACTICE)}
            icon={<BookOpen size={22} />}
            label="Practice"
          />
          <NavButton
            active={currentView === AppView.IRAC}
            onClick={() => handleNavigate(AppView.IRAC)}
            icon={<Scale size={22} />}
            label="IRAC"
          />
          <NavButton
            active={currentView === AppView.PROFILE}
            onClick={() => handleNavigate(AppView.PROFILE)}
            icon={<UserIcon size={22} />}
            label="Profile"
          />
        </nav>
      )}
    </div>
  );
};

// ────────────────────────────────────────────
// Profile View
// ────────────────────────────────────────────

interface ProfileViewProps {
  profile: {
    name: string;
    university: string;
    level: string;
    semester?: string;
    courses: string[];
    role?: string;
  };
  onLogout: () => void;
  onNavigate: (view: AppView) => void;
  onUpdateSemester: (semester: string) => Promise<{ error: any }>;
}

function getStreakData() {
  try {
    const raw = localStorage.getItem('learned_streak');
    if (!raw) return { count: 0, days: Array(7).fill(false) };
    return JSON.parse(raw) as { count: number; days: boolean[] };
  } catch {
    return { count: 0, days: Array(7).fill(false) };
  }
}

function getTotalQuestions(): number {
  return parseInt(localStorage.getItem('learned_total_questions') || '0', 10);
}

function getCourseAvg(course: string): number | null {
  try {
    const key = `learned_course_scores_${course.replace(/\s+/g, '_')}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const scores: number[] = JSON.parse(raw);
    if (scores.length === 0) return null;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  } catch {
    return null;
  }
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const ProfileView: React.FC<ProfileViewProps> = ({ profile, onLogout, onNavigate, onUpdateSemester }) => {
  const { count: streakCount, days: streakDays } = getStreakData();
  const totalQuestions = getTotalQuestions();
  const isAdmin = profile.role === 'admin';

  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-5">
      {/* Avatar + Name */}
      <div className="text-center space-y-2">
        <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto flex items-center justify-center">
          <UserIcon size={36} className="text-slate-500 dark:text-slate-400" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">{profile.name}</h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {profile.university} · {profile.level} · {profile.semester ?? 'First Semester'}
        </p>
      </div>

      {/* Semester */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
          Current Semester
        </p>
        <select
          defaultValue={profile.semester ?? 'First Semester'}
          onChange={(e) => onUpdateSemester(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 outline-none"
        >
          <option value="First Semester">First Semester</option>
          <option value="Second Semester">Second Semester</option>
        </select>
      </div>

      {/* Streak */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
          Streak
        </p>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-bold text-slate-900 dark:text-white">{streakCount}</span>
          <span className="text-slate-500 dark:text-slate-400 text-sm">days</span>
        </div>
        <div className="flex gap-1.5">
          {DAY_LABELS.map((label, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <div
                className={`w-full aspect-square rounded-full flex items-center justify-center text-[10px] font-semibold ${
                  streakDays[i]
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                }`}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Courses */}
      {profile.courses && profile.courses.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
            Courses
          </p>
          <div className="space-y-3">
            {profile.courses.map((course) => {
              const avg = getCourseAvg(course);
              return (
                <div key={course} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{course}</span>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                    {avg !== null ? `${avg}% avg` : '— avg'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Total Questions */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
          Total Questions
        </p>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalQuestions.toLocaleString()}</p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          {totalQuestions === 0 ? 'Start your first drill.' : 'answered'}
        </p>
      </div>

      {/* Admin tools — only shown to admin users */}
      {isAdmin && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
            Admin
          </p>
          <button
            onClick={() => onNavigate(AppView.ADMIN)}
            className="w-full py-3 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-medium bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Manage Knowledge Base
          </button>
          <button
            onClick={() => onNavigate('ADMIN_GENERATOR' as AppView)}
            className="w-full py-3 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-medium bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Question Bank Generator
          </button>
        </div>
      )}

      {/* Log Out */}
      <button
        onClick={onLogout}
        className="w-full text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm font-medium border border-red-200 dark:border-red-900/50 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
};

// ────────────────────────────────────────────
// NavButton
// ────────────────────────────────────────────

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 w-16 transition-colors ${
      active ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
    }`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

// ────────────────────────────────────────────
// Root
// ────────────────────────────────────────────

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
