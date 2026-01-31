
import React, { useState } from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { AppView } from '../../types';

interface SignInProps {
  onSwitch: (view: AppView) => void;
  onSuccess: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSwitch, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate authentication delay
    setTimeout(() => {
      setIsLoading(false);
      onSuccess();
    }, 1200);
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Sign In</h2>
        <p className="text-slate-500 text-sm">Enter your credentials to access your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
          <div className="flex justify-between items-center">
             <label className="block text-sm font-semibold text-slate-700">Password</label>
             <button type="button" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Forgot password?</button>
          </div>
          <Input 
            type="password"
            placeholder="••••••••"
            required
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            }
          />
        </div>

        <div className="flex items-center">
          <input 
            type="checkbox" 
            id="remember" 
            className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
          <label htmlFor="remember" className="ml-2 text-sm text-slate-600 cursor-pointer">Remember me for 30 days</label>
        </div>

        <Button type="submit" isLoading={isLoading}>
          Sign in
        </Button>
      </form>

      <div className="mt-8 text-center border-t border-slate-100 pt-6">
        <p className="text-sm text-slate-500">
          Don't have an account?{' '}
          <button 
            onClick={() => onSwitch(AppView.SIGN_UP)}
            className="font-semibold text-emerald-600 hover:text-emerald-700 underline-offset-4 hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
