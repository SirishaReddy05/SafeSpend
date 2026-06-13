import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CreditCard, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../lib/utils";
import { financeApi } from "../services/financeApi";
import type { DebtItem } from "../types";

export function Debts() {
  const { user } = useAuth();
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    amount: "",
    remainingAmount: "",
    startDate: "",
    endDate: "",
    dueDate: "",
    walletOfPayment: "",
    typeOfDebt: "payable" as DebtItem["typeOfDebt"],
    interestRate: "",
  });

  useEffect(() => {
    if (!user?.id) return;
    financeApi.debts.list(user.id).then((response) => setDebts(response.data));
  }, [user?.id]);

  const totalOutstanding = useMemo(() => debts.reduce((sum, debt) => sum + debt.remainingAmount, 0), [debts]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user?.id) return;
    const response = await financeApi.debts.create(user.id, {
      ...form,
      amount: Number(form.amount),
      remainingAmount: Number(form.remainingAmount),
      interestRate: Number(form.interestRate),
    });
    setDebts((current) => [response.data, ...current]);
    setForm({
      name: "",
      description: "",
      amount: "",
      remainingAmount: "",
      startDate: "",
      endDate: "",
      dueDate: "",
      walletOfPayment: "",
      typeOfDebt: "payable",
      interestRate: "",
    });
  };

  const handleDelete = async (debtId: string) => {
    await financeApi.debts.remove(debtId);
    setDebts((current) => current.filter((debt) => debt._id !== debtId));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Debts</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage debt records from the Express backend.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Add Debt</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Connected to `/api/debt`</p>
            </div>
          </div>
          <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Debt name" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white" required />
          <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white" />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} placeholder="Total amount" type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white" required />
            <input value={form.remainingAmount} onChange={(event) => setForm((current) => ({ ...current, remainingAmount: event.target.value }))} placeholder="Remaining amount" type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white" required />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} type="date" className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white" required />
            <input value={form.endDate} onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))} type="date" className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white" required />
            <input value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} type="date" className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.walletOfPayment} onChange={(event) => setForm((current) => ({ ...current, walletOfPayment: event.target.value }))} placeholder="Wallet ID" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white" required />
            <input value={form.interestRate} onChange={(event) => setForm((current) => ({ ...current, interestRate: event.target.value }))} placeholder="Interest rate" type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white" required />
          </div>
          <select value={form.typeOfDebt} onChange={(event) => setForm((current) => ({ ...current, typeOfDebt: event.target.value as DebtItem["typeOfDebt"] }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent dark:text-white">
            <option value="payable">payable</option>
            <option value="receivable">receivable</option>
          </select>
          <button className="w-full py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors">Save Debt</button>
        </form>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">Outstanding balance</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{formatCurrency(totalOutstanding)}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {debts.map((debt) => (
              <div key={debt._id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{debt.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{debt.typeOfDebt} / {debt.interestRate}%</p>
                  </div>
                  <button onClick={() => handleDelete(debt._id)} className="text-gray-400 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Remaining</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(debt.remainingAmount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Total</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(debt.amount)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {debts.length === 0 ? <div className="bg-white dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-10 text-center text-sm text-gray-500 dark:text-gray-400">No debt records yet.</div> : null}
        </div>
      </div>
    </div>
  );
}

