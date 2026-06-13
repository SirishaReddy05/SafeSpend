import { useEffect, useMemo, useState } from "react";
import { ArrowRightLeft, PiggyBank, Target, Wallet } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../lib/utils";
import { financeApi } from "../services/financeApi";
import type { BudgetItem, GoalItem, SavingsItem, Wallet as WalletType } from "../types";

export function Dashboard() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [savings, setSavings] = useState<SavingsItem[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      financeApi.wallets.list(user.id),
      financeApi.budgets.list(user.id),
      financeApi.goals.list(user.id),
      financeApi.savings.list(user.id),
    ]).then(([walletResponse, budgetResponse, goalResponse, savingsResponse]) => {
      setWallets(walletResponse.data);
      setBudgets(budgetResponse.data);
      setGoals(goalResponse.data);
      setSavings(savingsResponse.data);
    });
  }, [user?.id]);

  const totalWallets = useMemo(() => wallets.reduce((sum, wallet) => sum + wallet.amount, 0), [wallets]);
  const totalBudget = useMemo(() => budgets.reduce((sum, budget) => sum + budget.amount, 0), [budgets]);
  const totalGoalTarget = useMemo(() => goals.reduce((sum, goal) => sum + goal.targetAmount, 0), [goals]);
  const totalSavings = useMemo(() => savings.reduce((sum, saving) => sum + saving.amount, 0), [savings]);

  const stats = [
    { label: "Wallet Balance", value: formatCurrency(totalWallets), icon: Wallet, color: "bg-emerald-50 text-emerald-600" },
    { label: "Budget Total", value: formatCurrency(totalBudget), icon: ArrowRightLeft, color: "bg-blue-50 text-blue-600" },
    { label: "Goal Targets", value: formatCurrency(totalGoalTarget), icon: Target, color: "bg-violet-50 text-violet-600" },
    { label: "Savings Entries", value: formatCurrency(totalSavings), icon: PiggyBank, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Your main frontend is now reading live data for user <span className="font-semibold">{user?.email}</span>.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 dark:text-white">Recent Wallets</h2>
          <div className="mt-4 space-y-3">
            {wallets.slice(0, 5).map((wallet) => (
              <div key={wallet._id} className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{wallet.incomeType}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(wallet.createdAt ?? Date.now()).toLocaleString()}</p>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(wallet.amount)}</span>
              </div>
            ))}
            {wallets.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400">No wallet data yet.</p> : null}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-gray-900 dark:text-white">Recent Goals</h2>
          <div className="mt-4 space-y-3">
            {goals.slice(0, 5).map((goal) => {
              const percentage = goal.targetAmount ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
              return (
                <div key={goal._id} className="rounded-xl bg-gray-50 dark:bg-gray-800 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 dark:text-white">{goal.name}</p>
                    <span className="text-sm font-semibold text-emerald-600">{percentage}%</span>
                  </div>
                  <div className="h-2 mt-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
            {goals.length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400">No goal data yet.</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
