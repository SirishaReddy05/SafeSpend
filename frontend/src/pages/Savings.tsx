import { useEffect, useMemo, useState, type FormEvent } from "react";
import { PiggyBank, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../lib/utils";
import { financeApi } from "../services/financeApi";
import type { SavingsItem } from "../types";

export function Savings() {
  const { user } = useAuth();
  const [savings, setSavings] = useState<SavingsItem[]>([]);
  const [form, setForm] = useState({ amount: "", date: "" });

  useEffect(() => {
    if (!user?.id) return;
    financeApi.savings.list(user.id).then((response) => setSavings(response.data));
  }, [user?.id]);

  const totalSavings = useMemo(() => savings.reduce((sum, item) => sum + item.amount, 0), [savings]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user?.id) return;
    const response = await financeApi.savings.create(user.id, { amount: Number(form.amount), date: form.date });
    setSavings((current) => [response.data, ...current]);
    setForm({ amount: "", date: "" });
  };

  const handleDelete = async (savingsId: string) => {
    await financeApi.savings.remove(savingsId);
    setSavings((current) => current.filter((item) => item._id !== savingsId));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Savings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Save entries now come from `/api/savings`.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Add Saving</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Connected to `/api/savings`</p>
            </div>
          </div>
          <input value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} placeholder="Amount" type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white" required />
          <input value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} type="date" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white" required />
          <button className="w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors">Save Entry</button>
        </form>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total saved entries</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{formatCurrency(totalSavings)}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {savings.map((item) => (
                  <tr key={item._id} className="border-b border-gray-50 dark:border-gray-800">
                    <td className="px-6 py-4 text-gray-900 dark:text-white">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{formatCurrency(item.amount)}</td>
                    <td className="px-6 py-4"><button onClick={() => handleDelete(item._id)} className="text-gray-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {savings.length === 0 ? <div className="p-10 text-center text-sm text-gray-500 dark:text-gray-400">No savings entries stored yet.</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
