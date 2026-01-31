
import React, { ReactNode } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, icon, error, className, ...props }) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full py-2.5 px-3 rounded-lg border border-slate-200 
            focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500
            placeholder:text-slate-400 text-slate-900 transition-all
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default Input;
