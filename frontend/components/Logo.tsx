
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex flex-col items-center mb-6">
      <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center shadow-sm">
        <span className="text-white text-2xl font-bold font-mono">$</span>
      </div>
    </div>
  );
};

export default Logo;
