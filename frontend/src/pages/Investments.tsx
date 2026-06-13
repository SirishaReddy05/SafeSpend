import { useEffect, useMemo, useState, type FormEvent } from "react";
import { BarChart3, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../lib/utils";
import { financeApi } from "../services/financeApi";
import type { InvestmentItem } from "../types";

export function Investments() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<InvestmentItem[]>([]);
  const [form, setForm] = useState({ name: "", amount: "", date: "", maturityDate: "" });

  useEffect(() => {
    if (!user?.id) return;
    financeApi.investments.list(user.id).then((response) => setInvestments(response.data));
  }, [user?.id]);

  const totalInvested = useMemo(() => investments.reduce((sum, investment) => sum + investment.amount, 0), [investments]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user?.id) return;
    const response = await financeApi.investments.create(user.id, {
      name: form.name,
      amount: Number(form.amount),
      date: form.date,
      maturityDate: form.maturityDate,
    });
    setInvestments((current) => [response.data, ...current]);
    setForm({ name: "", amount: "", date: "", maturityDate: "" });
  };

  const handleDelete = async (investmentId: string) => {
    await financeApi.investments.remove(investmentId);
    setInvestments((current) => current.filter((investment) => investment._id !== investmentId));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Investments</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Portfolio items are now loaded from `/api/investments`.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Add Investment</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Connected to `/api/investments`</p>
            </div>
          </div>
          <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Investment name" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white" required />
          <input value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} placeholder="Amount" type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white" required />
          <input value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} type="date" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white" required />
          <input value={form.maturityDate} onChange={(event) => setForm((current) => ({ ...current, maturityDate: event.target.value }))} type="date" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white" required />
          <button className="w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors">Save Investment</button>
        </form>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total invested</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{formatCurrency(totalInvested)}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {investments.map((investment) => (
              <div key={investment._id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{investment.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Matures on {new Date(investment.maturityDate).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => handleDelete(investment._id)} className="text-gray-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-6">{formatCurrency(investment.amount)}</p>
              </div>
            ))}
          </div>
          {investments.length === 0 ? <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-10 text-center text-sm text-gray-500 dark:text-gray-400">No investments saved yet.</div> : null}
        </div>
      </div>
    </div>
  );
}
