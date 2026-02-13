
import React from 'react';
import { 
  Search, 
  PanelLeft, 
  Moon, 
  Settings, 
  Bell, 
  DollarSign 
} from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="sticky top-0 z-50 w-full h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      {/* Left Section: Logo & Brand */}
      <div className="flex items-center h-full">
        <div className="flex items-center gap-3 pr-6">
          <div className="w-8 h-8 bg-[#10b981] rounded-lg flex items-center justify-center text-white shadow-sm">
            <DollarSign size={18} strokeWidth={3} />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Expen<span className="text-gray-800">zo</span>
          </span>
        </div>

        {/* Vertical Divider */}
        <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden md:block"></div>

        {/* Middle Section: Navigation Tools */}
        <div className="flex items-center gap-1 ml-4 text-gray-500">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200" title="Toggle Sidebar">
            <PanelLeft size={20} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200" title="Search">
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* Right Section: User Controls */}
      <div className="flex items-center gap-2 text-gray-500">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200" title="Appearance">
          <Moon size={20} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200" title="Settings">
          <Settings size={20} />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 relative" title="Notifications">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        {/* User Profile Avatar */}
        <div className="ml-2 pl-2 flex items-center">
          <button className="w-8 h-8 rounded-full bg-gray-200 hover:ring-2 hover:ring-gray-300 transition-all duration-200 flex items-center justify-center overflow-hidden">
             <img 
               src="https://picsum.photos/seed/user1/32/32" 
               alt="User profile" 
               className="w-full h-full object-cover grayscale opacity-80"
             />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
