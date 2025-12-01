import React, { useState, useEffect } from 'react';
import { AppView, UserProfile } from './types';
import { Onboarding } from './views/Onboarding';
import { Practice } from './views/Practice';
import { Study } from './views/Study';
import { Blog } from './views/Blog';
import { BookOpen, MessageSquare, User as UserIcon, BookText } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.ONBOARDING);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('learned_user_profile');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setCurrentView(AppView.PRACTICE); // Default to Practice (Priority feature)
    }
  }, []);

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem('learned_user_profile', JSON.stringify(profile));
    setCurrentView(AppView.PRACTICE);
  };

  const handleLogout = () => {
    localStorage.removeItem('learned_user_profile');
    setUser(null);
    setCurrentView(AppView.ONBOARDING);
  }

  // Helper to render the active view
  const renderView = () => {
    switch (currentView) {
      case AppView.ONBOARDING:
        return <Onboarding onComplete={handleOnboardingComplete} />;
      case AppView.PRACTICE:
        return user ? <Practice user={user} /> : null;
      case AppView.STUDY:
        return user ? <Study user={user} /> : null;
      case AppView.BLOG:
        return <Blog />;
      case AppView.PROFILE:
        return (
          <div className="p-6 max-w-md mx-auto text-center space-y-6 pt-20">
            <div className="w-24 h-24 bg-slate-200 rounded-full mx-auto flex items-center justify-center text-slate-500">
              <UserIcon size={48} />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-slate-900">{user?.name}</h2>
              <p className="text-slate-500">{user?.university}</p>
              <p className="text-amber-600 font-medium mt-2">{user?.level}</p>
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

  if (currentView === AppView.ONBOARDING) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navbar (Desktop Only mostly, mobile has bottom nav) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/learned_logo.svg" alt="Learned Logo" className="h-8 w-auto" />
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

export default App;
