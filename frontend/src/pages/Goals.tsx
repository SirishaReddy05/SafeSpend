import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Target, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../lib/utils";
import { financeApi } from "../services/financeApi";
import type { GoalItem } from "../types";

export function Goals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [form, setForm] = useState({ name: "", targetAmount: "", currentAmount: "", targetDate: "" });

  useEffect(() => {
    if (!user?.id) return;
    financeApi.goals.list(user.id).then((response) => setGoals(response.data));
  }, [user?.id]);

  const progress = useMemo(() => {
    const target = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const current = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    return target ? Math.round((current / target) * 100) : 0;
  }, [goals]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user?.id) return;
    const response = await financeApi.goals.create(user.id, {
      name: form.name,
      targetAmount: Number(form.targetAmount),
      currentAmount: Number(form.currentAmount),
      targetDate: form.targetDate,
    });
    setGoals((current) => [response.data, ...current]);
    setForm({ name: "", targetAmount: "", currentAmount: "", targetDate: "" });
  };

  const handleDelete = async (goalId: string) => {
    await financeApi.goals.remove(goalId);
    setGoals((current) => current.filter((goal) => goal._id !== goalId));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Goals</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Track real goal records created through the backend.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Add Goal</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Connected to `/api/goals`</p>
            </div>
          </div>
          <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Goal name" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white" required />
          <input value={form.targetAmount} onChange={(event) => setForm((current) => ({ ...current, targetAmount: event.target.value }))} placeholder="Target amount" type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white" required />
          <input value={form.currentAmount} onChange={(event) => setForm((current) => ({ ...current, currentAmount: event.target.value }))} placeholder="Current amount" type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white" required />
          <input value={form.targetDate} onChange={(event) => setForm((current) => ({ ...current, targetDate: event.target.value }))} type="date" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white" required />
          <button className="w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors">Save Goal</button>
        </form>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Overall goal progress</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{progress}%</p>
              </div>
              <div className="w-24 h-24 rounded-full border-8 border-emerald-100 flex items-center justify-center text-emerald-600 font-semibold">{progress}%</div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {goals.map((goal) => {
              const percentage = goal.targetAmount ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) : 0;
              return (
                <div key={goal._id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{goal.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Target by {new Date(goal.targetDate).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => handleDelete(goal._id)} className="text-gray-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">{formatCurrency(goal.currentAmount)}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {goals.length === 0 ? <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-10 text-center text-sm text-gray-500 dark:text-gray-400">No goals stored yet.</div> : null}
        </div>
      </div>
    </div>
  );
}
