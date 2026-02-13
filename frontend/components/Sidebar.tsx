
import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  PieChart, 
  Banknote, 
  Target, 
  BarChart3, 
  FileText, 
  Settings, 
  Sparkles,
  LogOut
} from 'lucide-react';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, isActive }) => (
  <button
    className={`
      w-full flex items-center gap-3 px-4 py-2.5 transition-all duration-200 relative group
      ${isActive 
        ? 'bg-[#ecfdf5] text-[#10b981] font-semibold' 
        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
    `}
  >
    {isActive && (
      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#10b981] rounded-r-full" />
    )}
    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-[#10b981]' : 'text-gray-400 group-hover:text-gray-600'} />
    <span className="text-[14.5px] tracking-tight">{label}</span>
  </button>
);

const Sidebar: React.FC = () => {
  return (
    <aside className="w-[240px] h-screen bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-40">
      {/* Brand - Padding to align with sidebar items */}
      <div className="h-14 flex items-center px-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#10b981] rounded-lg flex items-center justify-center text-white">
             <Banknote size={18} strokeWidth={3} />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Expen<span className="text-gray-800 font-extrabold">zo</span>
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-0.5">
        <NavItem icon={LayoutDashboard} label="Dashboard" isActive />
        <NavItem icon={Wallet} label="Wallets" />
        <NavItem icon={PieChart} label="Budget" />
        <NavItem icon={Banknote} label="Bills" />
        <NavItem icon={Target} label="Goals" />
        <NavItem icon={BarChart3} label="Reports" />
        <NavItem icon={FileText} label="Docs" />
        <NavItem icon={Settings} label="Settings" />
      </nav>

      {/* Action Area */}
      <div className="px-4 py-6">
        <button className="w-full flex items-center justify-center gap-2 bg-[#f0fdf4] text-[#10b981] py-2.5 rounded-lg font-semibold text-sm hover:bg-[#dcfce7] transition-colors border border-[#dcfce7]">
          <Sparkles size={16} fill="currentColor" />
          Ask Agent
        </button>
      </div>

      {/* User Section */}
      <div className="border-t border-gray-100 p-4 mb-2">
        <div className="flex items-center justify-between group">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-gray-200 border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
               <img 
                 src="https://picsum.photos/seed/john/40/40" 
                 alt="User Profile" 
                 className="w-full h-full object-cover"
               />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-gray-900 truncate">John Doe</span>
              <span className="text-xs text-gray-500 truncate">john.doe@example.com</span>
            </div>
          </div>
          <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all ml-1" title="Sign Out">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
