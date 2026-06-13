import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../lib/utils";
import { financeApi } from "../services/financeApi";
import type { BudgetItem } from "../types";

const categories = ["bills", "clothing", "education", "entertainment", "food", "gifts", "health", "furniture", "pet", "shopping", "transport", "fitness", "travel", "others"];

export function Budget() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [form, setForm] = useState({ name: "", category: "food", amount: "", period: "monthly" as BudgetItem["period"] });

  useEffect(() => {
    if (!user?.id) return;
    financeApi.budgets.list(user.id).then((response) => setBudgets(response.data));
  }, [user?.id]);

  const totalBudget = useMemo(() => budgets.reduce((sum, budget) => sum + budget.amount, 0), [budgets]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user?.id) return;
    const response = await financeApi.budgets.create(user.id, { ...form, amount: Number(form.amount) });
    setBudgets((current) => [response.data, ...current]);
    setForm({ name: "", category: "food", amount: "", period: "monthly" });
  };

  const handleDelete = async (budgetId: string) => {
    await financeApi.budgets.remove(budgetId);
    setBudgets((current) => current.filter((budget) => budget._id !== budgetId));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Create and list budget categories from your backend.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">New Budget</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Connected to `/api/budget`</p>
            </div>
          </div>
          <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Budget name" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white" required />
          <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white">
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <input value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} placeholder="Amount" type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white" required />
          <select value={form.period} onChange={(event) => setForm((current) => ({ ...current, period: event.target.value as BudgetItem["period"] }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white">
            <option value="daily">daily</option>
            <option value="weekly">weekly</option>
            <option value="monthly">monthly</option>
            <option value="yearly">yearly</option>
          </select>
          <button className="w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors">Save Budget</button>
        </form>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total allocated</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{formatCurrency(totalBudget)}</p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Period</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((budget) => (
                  <tr key={budget._id} className="border-b border-gray-50 dark:border-gray-800">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{budget.name}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{budget.category}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{budget.period}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{formatCurrency(budget.amount)}</td>
                    <td className="px-6 py-4"><button onClick={() => handleDelete(budget._id)} className="text-gray-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {budgets.length === 0 ? <div className="p-10 text-center text-sm text-gray-500 dark:text-gray-400">No budgets found for this user yet.</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
