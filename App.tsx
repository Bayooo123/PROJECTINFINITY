import React, { useState } from 'react';
import { AppView } from './types';
import { Practice } from './views/Practice';
import { Study } from './views/Study';
import { Blog } from './views/Blog';
import { Login } from './components/Auth/Login';
import { Signup } from './components/Auth/Signup';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BookOpen, MessageSquare, User as UserIcon, BookText, Loader, AlertCircle } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, profile, loading, isConfigured, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>(AppView.PRACTICE);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  // Show configuration error if Supabase is missing
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Configuration Error</h1>
          <p className="text-slate-600 mb-6">
            The application is missing required configuration. Please check your environment variables.
          </p>
          <div className="bg-slate-100 p-4 rounded-lg text-left text-xs font-mono text-slate-700 overflow-x-auto">
            <p>Missing: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-amber-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
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
    setCurrentView(AppView.PRACTICE);
  };

  // Helper to render the active view
  const renderView = () => {
    switch (currentView) {
      case AppView.PRACTICE:
        return profile ? <Practice user={{
          name: profile.name,
          university: profile.university,
          level: profile.level,
          courses: profile.courses,
          hasOnboarded: true
        }} /> : null;
      case AppView.STUDY:
        return profile ? <Study user={{
          name: profile.name,
          university: profile.university,
          level: profile.level,
          courses: profile.courses,
          hasOnboarded: true
        }} /> : null;
      case AppView.BLOG:
        return <Blog />;
      case AppView.PROFILE:
        return (
          <div className="p-6 max-w-md mx-auto text-center space-y-6 pt-20">
            <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto flex items-center justify-center text-slate-500">
              <UserIcon size={48} />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-slate-900">{profile?.name}</h2>
              <p className="text-slate-500">{profile?.university}</p>
              <p className="text-amber-600 font-medium mt-2">{profile?.level}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700 text-sm font-medium border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50"
            >
              Sign Out
            </button>
          </div>
        );
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navbar (Desktop Only mostly, mobile has bottom nav) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-amber-600 flex items-center justify-center">
              <span className="text-amber-600 font-bold text-sm">L</span>
            </div>
            <span className="text-xl font-serif font-bold text-slate-900">Learned</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
          <button
            onClick={() => setCurrentView(AppView.PRACTICE)}
            className={`hover:text-amber-600 transition-colors ${currentView === AppView.PRACTICE ? 'text-amber-600' : ''}`}
          >
            Practice Area
          </button>
          <button
            onClick={() => setCurrentView(AppView.STUDY)}
            className={`hover:text-amber-600 transition-colors ${currentView === AppView.STUDY ? 'text-amber-600' : ''}`}
          >
            Study Room
          </button>
          <button
            onClick={() => setCurrentView(AppView.BLOG)}
            className={`hover:text-amber-600 transition-colors ${currentView === AppView.BLOG ? 'text-amber-600' : ''}`}
          >
            Blog
          </button>
          <button
            onClick={() => setCurrentView(AppView.PROFILE)}
            className="flex items-center gap-2 pl-4 border-l border-slate-200"
          >
            <span className="text-slate-900">{user?.name.split(' ')[0]}</span>
            <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white">
              <UserIcon size={14} />
            </div>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 flex flex-col">
        <div className="flex-1">
          {renderView()}
        </div>

        {/* Footer */}
        <footer className="py-8 px-4 text-center">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
            Learned is a product of REFORMA DIGITAL SOLUTIONS LIMITED (RC Number: 8801487)
          </p>
        </footer>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around py-3 px-2 pb-safe z-50">
        <NavButton
          active={currentView === AppView.PRACTICE}
          onClick={() => setCurrentView(AppView.PRACTICE)}
          icon={<BookOpen size={22} />}
          label="Practice"
        />
        <NavButton
          active={currentView === AppView.STUDY}
          onClick={() => setCurrentView(AppView.STUDY)}
          icon={<MessageSquare size={22} />}
          label="Study"
        />
        <NavButton
          active={currentView === AppView.BLOG}
          onClick={() => setCurrentView(AppView.BLOG)}
          icon={<BookText size={22} />}
          label="Journal"
        />
        <NavButton
          active={currentView === AppView.PROFILE}
          onClick={() => setCurrentView(AppView.PROFILE)}
          icon={<UserIcon size={22} />}
          label="Profile"
        />
      </nav>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 w-16 transition-colors ${active ? 'text-amber-600' : 'text-slate-400 hover:text-slate-600'
      }`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
