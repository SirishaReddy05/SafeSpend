import { api, withUserId } from "./api";
import type {
  BudgetItem,
  DebtItem,
  GoalItem,
  InvestmentItem,
  SavingsItem,
  Wallet,
} from "../types";

export const financeApi = {
  wallets: {
    list: (userId: string) => api.get<Wallet[]>(`/wallet/getWallets/${userId}`),
    create: (userId: string, payload: { incomeType: string; amount: number }) =>
      api.post<Wallet>("/wallet/addWallet", withUserId(payload, userId)),
    remove: (walletId: string) => api.delete(`/wallet/deleteWallet/${walletId}`),
  },
  budgets: {
    list: (userId: string) => api.get<BudgetItem[]>(`/budget/getBudgets/${userId}`),
    create: (userId: string, payload: { name: string; category: string; amount: number; period: BudgetItem["period"] }) =>
      api.post<BudgetItem>("/budget/addBudget", withUserId(payload, userId)),
    remove: (budgetId: string) => api.delete(`/budget/deleteBudget/${budgetId}`),
  },
  goals: {
    list: (userId: string) => api.get<GoalItem[]>(`/goals/getGoals/${userId}`),
    create: (userId: string, payload: { name: string; targetAmount: number; currentAmount: number; targetDate: string }) =>
      api.post<GoalItem>("/goals/addGoal", withUserId(payload, userId)),
    remove: (goalId: string) => api.delete(`/goals/deleteGoal/${goalId}`),
  },
  savings: {
    list: (userId: string) => api.get<SavingsItem[]>(`/savings/getSavings/${userId}`),
    create: (userId: string, payload: { amount: number; date: string }) =>
      api.post<SavingsItem>("/savings/addSavings", withUserId(payload, userId)),
    remove: (savingsId: string) => api.delete(`/savings/deleteSavings/${savingsId}`),
  },
  debts: {
    list: (userId: string) => api.get<DebtItem[]>(`/debt/getDebts/${userId}`),
    create: (
      userId: string,
      payload: {
        name: string;
        description?: string;
        amount: number;
        remainingAmount: number;
        startDate: string;
        endDate: string;
        dueDate: string;
        walletOfPayment: string;
        typeOfDebt: DebtItem["typeOfDebt"];
        interestRate: number;
      },
    ) => api.post<DebtItem>("/debt/addDebt", withUserId(payload, userId)),
    remove: (debtId: string) => api.delete(`/debt/deleteDebt/${debtId}`),
  },
  investments: {
    list: (userId: string) => api.get<InvestmentItem[]>(`/investments/getInvestments/${userId}`),
    create: (userId: string, payload: { name: string; amount: number; date: string; maturityDate: string }) =>
      api.post<InvestmentItem>("/investments/addInvestment", withUserId(payload, userId)),
    remove: (investmentId: string) => api.delete(`/investments/deleteInvestment/${investmentId}`),
  },
};
