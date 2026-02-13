
import React from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

const App: React.FC = () => {
  return (
    <div className="flex h-full w-full bg-gray-50 overflow-hidden font-['Inter']">
      {/* Sidebar - Fixed width on the left */}
      <Sidebar />

      {/* Main Content Area - Expands to fill remaining space */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
        {/* Navbar - Fixed height at the top */}
        <Navbar />
        
        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50">
          <div className="max-w-[1600px] mx-auto h-full">
            {/* 
              This is the "Plain Page" content area. 
              The Sidebar and Navbar are preserved as requested. 
            */}
            <div className="w-full h-full min-h-[calc(100vh-120px)] border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center bg-white shadow-sm">
              <div className="text-center p-10">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Main Content Canvas</h2>
                <p className="text-gray-400 mt-2 max-w-sm">
                  This area is now correctly scaled to fill the remaining screen space. Start adding your dashboard widgets or pages here.
                </p>
                <button className="mt-6 px-6 py-2 bg-[#10b981] text-white rounded-lg font-medium hover:bg-[#059669] transition-colors shadow-sm">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
