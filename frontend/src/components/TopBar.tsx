import { Bell, LogOut, PanelLeft } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'Track your accounts, goals, and saving momentum in one place.',
  },
  '/wallets': {
    title: 'Wallets',
    subtitle: 'Review balances and add fresh wallet entries from the connected backend.',
  },
  '/budget': {
    title: 'Budget',
    subtitle: 'Create category budgets and keep spending under control.',
  },
  '/goals': {
    title: 'Goals',
    subtitle: 'Monitor your target progress with live goal records.',
  },
  '/investments': {
    title: 'Investments',
    subtitle: 'Manage investment entries and total portfolio contributions.',
  },
  '/savings': {
    title: 'Savings',
    subtitle: 'Log savings activity and watch your total grow.',
  },
  '/debts': {
    title: 'Debts',
    subtitle: 'Stay on top of payable and receivable balances.',
  },
  '/reports': {
    title: 'Reports',
    subtitle: 'See trends and charts for your financial activity.',
  },
  '/ask-agent': {
    title: 'Ask Agent',
    subtitle: 'Chat with the finance assistant for tailored guidance.',
  },
  '/profile': {
    title: 'Profile',
    subtitle: 'Review and update the account details tied to this session.',
  },
  '/notifications': {
    title: 'Notifications',
    subtitle: 'Review financial alerts and recent account activity.',
  },
};

export function TopBar() {
  const { toggleSidebar } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const currentPage = pageTitles[location.pathname] ?? {
    title: 'SafeSpend',
    subtitle: 'Manage your money with a cleaner connected workspace.',
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 sticky top-0 z-10 transition-colors">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 md:px-6 xl:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors"
            title="Toggle Sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <p className="text-base font-semibold text-gray-900 truncate">{currentPage.title}</p>
            <p className="hidden text-sm text-gray-500 md:block truncate">{currentPage.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Link to="/notifications" className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg relative transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </Link>

          <div className="hidden h-6 w-px bg-gray-100 md:block"></div>

          <Link to="/profile" className="hidden items-center gap-3 md:flex group">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 leading-none">
                {user?.firstName ?? 'Safe'} {user?.lastName ?? 'Spend'}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-40">{user?.email ?? 'Guest session'}</p>
            </div>
            <img
              src={user?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(`${user?.firstName ?? 'Safe'} ${user?.lastName ?? 'Spend'}`)}&background=10b981&color=fff`}
              alt="Profile"
              className="w-8 h-8 rounded-full border border-gray-100 group-hover:border-emerald-500 transition-colors"
              referrerPolicy="no-referrer"
            />
          </Link>

          <button
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
