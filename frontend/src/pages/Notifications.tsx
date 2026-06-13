import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowDownCircle, CheckCircle2, Inbox } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { financeApi } from '../services/financeApi';
import type { BudgetItem, DebtItem, GoalItem, InvestmentItem, Notification, Wallet } from '../types';

type NotificationFilter = 'All' | 'Unread' | 'Transactions' | 'Alerts' | 'Success';
type NotificationWithMeta = Notification & {
  kind: NotificationFilter | 'All';
  createdAtValue: number;
};

const filters: NotificationFilter[] = ['All', 'Unread', 'Transactions', 'Alerts', 'Success'];

const formatDisplayDate = (value: string | Date) =>
  new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const differenceInDays = (value: string | Date) =>
  Math.ceil((new Date(value).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

export function Notifications() {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [investments, setInvestments] = useState<InvestmentItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('All');
  const [manuallyReadIds, setManuallyReadIds] = useState<string[]>([]);
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
      financeApi.goals.list(user.id),
      financeApi.debts.list(user.id),
      financeApi.investments.list(user.id),
    ])
      .then(([walletResponse, budgetResponse, goalResponse, debtResponse, investmentResponse]) => {
        setWallets(walletResponse.data);
        setBudgets(budgetResponse.data);
        setGoals(goalResponse.data);
        setDebts(debtResponse.data);
        setInvestments(investmentResponse.data);
      })
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  const notifications = useMemo<NotificationWithMeta[]>(() => {
    const totalWalletBalance = wallets.reduce((sum, wallet) => sum + wallet.amount, 0);
    const items: NotificationWithMeta[] = [];

    wallets
      .slice()
      .sort((left, right) => new Date(right.createdAt ?? 0).getTime() - new Date(left.createdAt ?? 0).getTime())
      .slice(0, 3)
      .forEach((wallet) => {
        const createdAt = wallet.createdAt ?? new Date().toISOString();
        items.push({
          id: `wallet-${wallet._id}`,
          title: 'Wallet updated',
          message: `${wallet.incomeType} wallet added with an amount of Rs. ${wallet.amount.toLocaleString()}.`,
          timestamp: formatDisplayDate(createdAt),
          type: 'transaction',
          read: false,
          kind: 'Transactions',
          createdAtValue: new Date(createdAt).getTime(),
        });
      });

    budgets.forEach((budget) => {
      if (totalWalletBalance > 0 && budget.amount > totalWalletBalance * 0.6) {
        const createdAt = budget.createdAt ?? new Date().toISOString();
        items.push({
          id: `budget-${budget._id}`,
          title: 'Budget allocation alert',
          message: `${budget.name} is consuming a large part of your current wallet balance. Review this category soon.`,
          timestamp: formatDisplayDate(createdAt),
          type: 'alert',
          read: false,
          kind: 'Alerts',
          createdAtValue: new Date(createdAt).getTime(),
        });
      }
    });

    goals.forEach((goal) => {
      const daysLeft = differenceInDays(goal.targetDate);
      if (goal.currentAmount >= goal.targetAmount) {
        items.push({
          id: `goal-success-${goal._id}`,
          title: 'Goal achieved',
          message: `You reached your ${goal.name} goal with Rs. ${goal.currentAmount.toLocaleString()} saved.`,
          timestamp: formatDisplayDate(goal.targetDate),
          type: 'success',
          read: false,
          kind: 'Success',
          createdAtValue: new Date(goal.targetDate).getTime(),
        });
      } else if (daysLeft >= 0 && daysLeft <= 30) {
        items.push({
          id: `goal-alert-${goal._id}`,
          title: 'Goal deadline approaching',
          message: `${goal.name} is due in ${daysLeft} day${daysLeft === 1 ? '' : 's'}. You still need Rs. ${(goal.targetAmount - goal.currentAmount).toLocaleString()}.`,
          timestamp: formatDisplayDate(goal.targetDate),
          type: 'alert',
          read: false,
          kind: 'Alerts',
          createdAtValue: new Date(goal.targetDate).getTime(),
        });
      }
    });

    debts.forEach((debt) => {
      const daysLeft = differenceInDays(debt.dueDate);
      if (daysLeft >= 0 && daysLeft <= 14) {
        items.push({
          id: `debt-${debt._id}`,
          title: 'Debt payment reminder',
          message: `${debt.name} is due in ${daysLeft} day${daysLeft === 1 ? '' : 's'} with Rs. ${debt.remainingAmount.toLocaleString()} remaining.`,
          timestamp: formatDisplayDate(debt.dueDate),
          type: 'alert',
          read: false,
          kind: 'Alerts',
          createdAtValue: new Date(debt.dueDate).getTime(),
        });
      }
    });

    investments.forEach((investment) => {
      const daysLeft = differenceInDays(investment.maturityDate);
      if (daysLeft >= 0 && daysLeft <= 30) {
        items.push({
          id: `investment-${investment._id}`,
          title: 'Investment maturing soon',
          message: `${investment.name} matures in ${daysLeft} day${daysLeft === 1 ? '' : 's'}. Plan your next move for Rs. ${investment.amount.toLocaleString()}.`,
          timestamp: formatDisplayDate(investment.maturityDate),
          type: 'alert',
          read: false,
          kind: 'Alerts',
          createdAtValue: new Date(investment.maturityDate).getTime(),
        });
      }
    });

    return items
      .sort((left, right) => right.createdAtValue - left.createdAtValue)
      .map((item, index) => ({
        ...item,
        read: index > 2 || manuallyReadIds.includes(item.id),
      }));
  }, [budgets, debts, goals, investments, manuallyReadIds, wallets]);

  const filteredNotifications = useMemo(() => {
    switch (activeFilter) {
      case 'Unread':
        return notifications.filter((notification) => !notification.read);
      case 'Transactions':
        return notifications.filter((notification) => notification.kind === 'Transactions');
      case 'Alerts':
        return notifications.filter((notification) => notification.kind === 'Alerts');
      case 'Success':
        return notifications.filter((notification) => notification.kind === 'Success');
      default:
        return notifications;
    }
  }, [activeFilter, notifications]);

  const markAllAsRead = () => {
    setManuallyReadIds(notifications.map((notification) => notification.id));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-sm text-gray-500">Live alerts are generated from the signed-in user's own financial records.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Your Alerts</h2>
            <p className="text-sm text-gray-500">{notifications.length} notification{notifications.length === 1 ? '' : 's'} generated from your current data.</p>
          </div>
          <button onClick={markAllAsRead} className="text-xs font-bold text-gray-500 hover:text-gray-900">
            Mark All as Read
          </button>
        </div>

        <div className="bg-emerald-50/50 p-2 flex flex-wrap items-center justify-center gap-2 md:gap-4">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-xs font-bold transition-all',
                filter === activeFilter ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-500 hover:bg-emerald-100',
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-sm text-gray-500">Loading alerts...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500 flex flex-col items-center gap-3">
            <Inbox className="w-8 h-8 text-gray-300" />
            <p>No alerts yet for this user. Add budgets, debts, goals, investments, or wallets to generate notifications.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  'p-6 flex gap-4 transition-colors hover:bg-gray-50/50',
                  !notification.read && 'bg-blue-50/30',
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                    notification.type === 'success' && 'bg-emerald-50 text-emerald-600',
                    notification.type === 'alert' && 'bg-amber-50 text-amber-600',
                    notification.type === 'transaction' && 'bg-blue-50 text-blue-600',
                  )}
                >
                  {notification.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
                  {notification.type === 'alert' && <AlertTriangle className="w-5 h-5" />}
                  {notification.type === 'transaction' && <ArrowDownCircle className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1 gap-4">
                    <h3 className="text-sm font-bold text-gray-900">{notification.title}</h3>
                    <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">{notification.timestamp}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{notification.message}</p>
                </div>
                {!notification.read ? <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
