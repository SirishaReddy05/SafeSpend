import { NavLink, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  PieChart, 
  Target, 
  TrendingUp,
  PiggyBank,
  CreditCard,
  Bot,
  BarChart3, 
  MessageSquareText,
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useSidebar } from '../context/SidebarContext';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Wallet, label: 'Wallets', href: '/wallets' },
  { icon: PieChart, label: 'Budget', href: '/budget' },
  { icon: Target, label: 'Goals', href: '/goals' },
  { icon: TrendingUp, label: 'Investments', href: '/investments' },
  { icon: PiggyBank, label: 'Savings', href: '/savings' },
  { icon: CreditCard, label: 'Debts', href: '/debts' },
  { icon: BarChart3, label: 'Reports', href: '/reports' },
];

export function Sidebar() {
  const { isCollapsed } = useSidebar();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className={cn(
      "border-r border-gray-100 dark:border-gray-800 flex flex-col h-screen sticky top-0 bg-white dark:bg-gray-900 transition-all duration-300 z-20",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className={cn("p-6 flex items-center gap-2", isCollapsed && "justify-center px-0")}>
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shrink-0">
          $
        </div>
          {!isCollapsed && <span className="text-xl font-bold text-gray-900 dark:text-white truncate">Safe Spend</span>}
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium",
              isCollapsed && "justify-center px-0",
              isActive 
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500" 
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
            )}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}

        <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
          <NavLink
            to="/finance-guru"
            title={isCollapsed ? "Finance Guru" : undefined}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium",
              isCollapsed && "justify-center px-0",
              isActive 
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500" 
                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
            )}
          >
            <Bot className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span className="truncate">Finance Guru</span>}
          </NavLink>
        </div>
      </nav>

      <div className="p-4">
        <NavLink
          to="/ask-agent"
          title={isCollapsed ? "Ask Agent" : undefined}
          className={({ isActive }) => cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium",
            isCollapsed && "justify-center px-0",
            isActive 
              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500" 
              : "bg-emerald-50/50 dark:bg-emerald-500/5 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
          )}
        >
          <MessageSquareText className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="truncate">Ask Agent</span>}
        </NavLink>
      </div>

      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <div className={cn("flex items-center gap-3 p-2", isCollapsed && "flex-col")}>
          <img 
            src={user?.avatar ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(`${user?.firstName ?? "Safe"} ${user?.lastName ?? "Spend"}`)}&background=10b981&color=fff`} 
            alt={user?.firstName ?? "User"} 
            className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-gray-800 shrink-0"
            referrerPolicy="no-referrer"
          />
          {!isCollapsed && (
            <Link to="/profile" className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate hover:text-emerald-600 transition-colors">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate hover:text-emerald-500">
                {user?.email}
              </p>
            </Link>
          )}
          <button 
            onClick={handleLogout}
            title="Logout"
            className="text-gray-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors shrink-0"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

      
