
import React from 'react';
import { Transaction } from '../../types';

interface DashboardProps {
  onLogout: () => void;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', name: 'Apple Store', amount: -129.00, category: 'Electronics', date: '2023-10-24', type: 'expense' },
  { id: '2', name: 'Monthly Salary', amount: 4500.00, category: 'Income', date: '2023-10-23', type: 'income' },
  { id: '3', name: 'Starbucks', amount: -6.50, category: 'Food & Drink', date: '2023-10-22', type: 'expense' },
  { id: '4', name: 'Uber', amount: -18.20, category: 'Transport', date: '2023-10-21', type: 'expense' },
  { id: '5', name: 'Freelance Work', amount: 850.00, category: 'Income', date: '2023-10-20', type: 'income' },
];

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  return (
    <div className="w-full max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome, Alex</h1>
          <p className="text-slate-500">Here's what's happening with your money.</p>
        </div>
        <button 
          onClick={onLogout}
          className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-red-600 transition-colors flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          Logout
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Balance', value: '$12,450.00', change: '+12%', color: 'emerald' },
          { label: 'Monthly Spending', value: '$2,840.50', change: '-4%', color: 'slate' },
          { label: 'Savings Goal', value: '85%', change: 'On track', color: 'blue' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
              <span className={`text-xs font-bold text-${stat.color}-500`}>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transactions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Recent Transactions</h3>
            <button className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">View all</button>
          </div>
          <div className="divide-y divide-slate-50">
            {MOCK_TRANSACTIONS.map((tx) => (
              <div key={tx.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                    {tx.type === 'income' ? '+' : '-'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{tx.name}</p>
                    <p className="text-xs text-slate-500">{tx.category} • {tx.date}</p>
                  </div>
                </div>
                <span className={`font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                  {tx.type === 'income' ? '+' : ''}{tx.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-6">
          <div className="bg-emerald-600 p-6 rounded-2xl text-white shadow-lg shadow-emerald-200">
            <h3 className="font-bold mb-2">Smart Savings</h3>
            <p className="text-emerald-100 text-sm mb-4">You've saved $450 more than last month. Want to invest it?</p>
            <button className="w-full py-2 bg-white text-emerald-600 rounded-lg font-bold text-sm hover:bg-emerald-50 transition-colors">
              Check Opportunities
            </button>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {['Send Money', 'Add Bill', 'Statistics', 'Settings'].map((action) => (
                <button key={action} className="p-3 text-xs font-semibold text-slate-600 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
