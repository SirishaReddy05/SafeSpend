
import React, { useState } from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { AppView } from '../../types';

interface SignUpProps {
  onSwitch: (view: AppView) => void;
  onSuccess: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSwitch, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccess();
    }, 1500);
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Sign Up</h2>
        <p className="text-slate-500 text-sm">Enter your information to create an account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="First Name"
            placeholder="John"
            required
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            }
          />
          <Input 
            label="Last Name"
            placeholder="Doe"
            required
          />
        </div>

        <Input 
          label="Email"
          type="email"
          placeholder="name@example.com"
          required
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          }
        />

        <div className="space-y-1">
          <Input 
            label="Password"
            type="password"
            placeholder="••••••••"
            required
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            }
          />
          <p className="text-[10px] text-slate-400 leading-tight">
            Password must be at least 8 characters long.
          </p>
        </div>

        <div className="flex items-start pt-1">
          <input 
            type="checkbox" 
            id="terms" 
            required
            className="mt-1 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
          <label htmlFor="terms" className="ml-2 text-sm text-slate-600 leading-tight cursor-pointer">
            I agree to the <span className="text-emerald-600 font-medium hover:underline">Terms of Service</span>
          </label>
        </div>

        <Button type="submit" isLoading={isLoading} className="mt-2">
          Create account
        </Button>
      </form>

      <div className="mt-6 text-center border-t border-slate-100 pt-6">
        <p className="text-sm text-slate-500">
          Already have an account?{' '}
          <button 
            onClick={() => onSwitch(AppView.SIGN_IN)}
            className="font-semibold text-emerald-600 hover:text-emerald-700 underline-offset-4 hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
