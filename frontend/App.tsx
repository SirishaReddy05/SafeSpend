
import React, { useState, useEffect } from 'react';
import Logo from './components/Logo';
import SignIn from './features/auth/SignIn';
import SignUp from './features/auth/SignUp';
import Dashboard from './features/dashboard/Dashboard';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.SIGN_IN);
  const [aiTip, setAiTip] = useState<string>('Connecting to financial AI...');

  useEffect(() => {
    const fetchTip = async () => {
      // Determine context for Gemini
      const context = currentView === AppView.DASHBOARD ? 'dashboard' : 'auth';
        // Simulate fetching tip from Gemini service
    };
    fetchTip();
  }, [currentView]);

  const handleLoginSuccess = () => {
    setCurrentView(AppView.DASHBOARD);
  };

  const handleLogout = () => {
    setCurrentView(AppView.SIGN_IN);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.SIGN_UP:
        return (
          <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-100/50">
            <SignUp onSwitch={setCurrentView} onSuccess={handleLoginSuccess} />
          </div>
        );
      case AppView.DASHBOARD:
        return <Dashboard onLogout={handleLogout} />;
      case AppView.SIGN_IN:
      default:
        return (
          <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-2xl shadow-slate-200/60 border border-slate-100/50">
            <SignIn onSwitch={setCurrentView} onSuccess={handleLoginSuccess} />
          </div>
        );
    }
  };

  const isAuthView = currentView !== AppView.DASHBOARD;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isAuthView ? 'bg-[#f8fafc] items-center justify-center p-6' : 'bg-slate-50 p-6 md:p-12'}`}>
      
      {/* Auth-specific Header */}
      {isAuthView && (
        <div className="text-center mb-10 max-w-sm animate-in fade-in zoom-in-95 duration-700">
          <Logo />
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            {currentView === AppView.SIGN_UP ? "Get Started" : "Welcome Back"}
          </h1>
        </div>
      )}

      {/* Main View Port */}
      {renderContent()}
    </div>
  );
};

export default App;
