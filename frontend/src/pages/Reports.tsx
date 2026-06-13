import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { cn, formatCurrency } from '../lib/utils';
import { financeApi } from '../services/financeApi';
import type { BudgetItem, InvestmentItem, SavingsItem, Wallet } from '../types';

type Metric = 'all' | 'income' | 'spending' | 'savings';

type MonthPoint = {
  name: string;
  income: number;
  spending: number;
  savings: number;
};

const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' });
const chartColors = ['#10b981', '#0f766e', '#f59e0b', '#3b82f6', '#f97316', '#14b8a6'];

const getMonthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;
const getMonthLabel = (date: Date) => monthFormatter.format(date);

function getLastMonths(count: number) {
  const months: Date[] = [];
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (count - 1), 1);

  for (let index = 0; index < count; index += 1) {
    months.push(new Date(start.getFullYear(), start.getMonth() + index, 1));
  }

  return months;
}

function sumByMonth<T>(items: T[], getDate: (item: T) => string | undefined, getAmount: (item: T) => number, validMonths: Set<string>) {
  return items.reduce<Record<string, number>>((totals, item) => {
    const rawDate = getDate(item);
    if (!rawDate) return totals;

    const date = new Date(rawDate);
    const key = getMonthKey(date);
    if (!validMonths.has(key)) return totals;

    totals[key] = (totals[key] ?? 0) + getAmount(item);
    return totals;
  }, {});
}

const formatTooltipCurrency = (value: number | string | undefined) => formatCurrency(Number(value ?? 0));

export function Reports() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [savings, setSavings] = useState<SavingsItem[]>([]);
  const [investments, setInvestments] = useState<InvestmentItem[]>([]);
  const [activeMetric, setActiveMetric] = useState<Metric>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    Promise.all([
      financeApi.wallets.list(user.id),
      financeApi.budgets.list(user.id),
      financeApi.savings.list(user.id),
      financeApi.investments.list(user.id),
    ])
      .then(([walletResponse, budgetResponse, savingsResponse, investmentResponse]) => {
        setWallets(walletResponse.data);
        setBudgets(budgetResponse.data);
        setSavings(savingsResponse.data);
        setInvestments(investmentResponse.data);
      })
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  const reportData = useMemo(() => {
    const months = getLastMonths(6);
    const validMonthKeys = new Set(months.map(getMonthKey));

    const incomeByMonth = sumByMonth(wallets, (wallet) => wallet.createdAt, (wallet) => wallet.amount, validMonthKeys);
    const spendingByMonth = sumByMonth(budgets, (budget) => budget.createdAt, (budget) => budget.amount, validMonthKeys);
    const savingsByMonth = sumByMonth(savings, (saving) => saving.date ?? saving.createdAt, (saving) => saving.amount, validMonthKeys);

    const trendData: MonthPoint[] = months.map((month) => {
      const key = getMonthKey(month);
      return {
        name: getMonthLabel(month),
        income: incomeByMonth[key] ?? 0,
        spending: spendingByMonth[key] ?? 0,
        savings: savingsByMonth[key] ?? 0,
      };
    });

    let runningSavings = 0;
    const growthData = trendData.map((point) => {
      runningSavings += point.savings;
      return {
        name: point.name,
        value: runningSavings,
      };
    });

    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const categoryTotals = budgets.reduce<Record<string, number>>((totals, budget) => {
      totals[budget.category] = (totals[budget.category] ?? 0) + budget.amount;
      return totals;
    }, {});

    const categoryData = Object.entries(categoryTotals)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 6)
      .map(([name, value], index) => ({
        name,
        value: totalBudget ? Math.round((value / totalBudget) * 100) : 0,
        amount: value,
        color: chartColors[index % chartColors.length],
      }));

    const totalIncome = wallets.reduce((sum, wallet) => sum + wallet.amount, 0);
    const totalSavings = savings.reduce((sum, saving) => sum + saving.amount, 0);
    const totalInvested = investments.reduce((sum, investment) => sum + investment.amount, 0);

    return {
      trendData,
      growthData,
      categoryData,
      totalIncome,
      totalBudget,
      totalSavings,
      totalInvested,
    };
  }, [budgets, investments, savings, wallets]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500">Every chart below is built from the signed-in user's own records.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total income', value: formatCurrency(reportData.totalIncome) },
          { label: 'Budgeted spend', value: formatCurrency(reportData.totalBudget) },
          { label: 'Savings logged', value: formatCurrency(reportData.totalSavings) },
          { label: 'Invested amount', value: formatCurrency(reportData.totalInvested) },
        ].map((card) => (
          <div key={card.label} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="bg-white p-10 rounded-2xl border border-gray-100 shadow-sm text-center text-sm text-gray-500">
          Building user-specific reports...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900">Financial Trends</h2>
                <p className="text-sm text-gray-500">Income, budget allocations, and savings for the last 6 months</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-8 bg-gray-50 p-1 rounded-xl w-fit">
                {[
                  { key: 'all', label: 'All Metrics' },
                  { key: 'income', label: 'Income' },
                  { key: 'spending', label: 'Spending' },
                  { key: 'savings', label: 'Savings' },
                ].map((metric) => (
                  <button
                    key={metric.key}
                    onClick={() => setActiveMetric(metric.key as Metric)}
                    className={cn(
                      'px-4 py-1.5 rounded-lg text-xs font-bold transition-all',
                      activeMetric === metric.key ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100',
                    )}
                  >
                    {metric.label}
                  </button>
                ))}
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportData.trendData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(value) => `Rs.${value}`} />
                    <Tooltip formatter={(value) => formatTooltipCurrency(value as number | string | undefined)} />
                    {(activeMetric === 'all' || activeMetric === 'income') && (
                      <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                    )}
                    {(activeMetric === 'all' || activeMetric === 'spending') && (
                      <Line type="monotone" dataKey="spending" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }} />
                    )}
                    {(activeMetric === 'all' || activeMetric === 'savings') && (
                      <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Savings Growth</h2>
                  <p className="text-sm text-gray-500">Cumulative savings built from this user's savings entries</p>
                </div>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">
                  {formatCurrency(reportData.totalSavings)}
                </span>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={reportData.growthData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(value) => `Rs.${value}`} />
                    <Tooltip formatter={(value) => formatTooltipCurrency(value as number | string | undefined)} />
                    <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900">Budget Categories</h2>
              <p className="text-sm text-gray-500">Share of your budget by category</p>
            </div>

            {reportData.categoryData.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-10">No user-specific budget data is available yet.</div>
            ) : (
              <div className="grid gap-8 lg:grid-cols-[320px_1fr] items-center">
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData.categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {reportData.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, _name, item) => [`${Number(value ?? 0)}%`, item.payload.name]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {reportData.categoryData.map((item) => (
                    <div key={item.name} className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-sm font-semibold text-gray-700 capitalize">{item.name}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-3">{formatCurrency(item.amount)} allocated</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
