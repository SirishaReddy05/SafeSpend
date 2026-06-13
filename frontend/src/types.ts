export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  token?: string;
  avatar?: string;
}

export interface AuthResponse extends User {
  token: string;
}

export interface Wallet {
  _id: string;
  user: string;
  incomeType: string;
  amount: number;
  createdAt?: string;
}

export interface BudgetItem {
  _id: string;
  user: string;
  name: string;
  category: string;
  amount: number;
  period: "daily" | "weekly" | "monthly" | "yearly";
  createdAt?: string;
}

export interface GoalItem {
  _id: string;
  user: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  createdAt?: string;
}

export interface SavingsItem {
  _id: string;
  userId: string;
  amount: number;
  date: string;
  createdAt?: string;
}

export interface DebtItem {
  _id: string;
  user: string;
  name: string;
  description?: string;
  amount: number;
  remainingAmount: number;
  startDate: string;
  endDate: string;
  dueDate: string;
  walletOfPayment: string;
  typeOfDebt: "payable" | "receivable";
  interestRate: number;
  createdAt?: string;
}

export interface InvestmentItem {
  _id: string;
  user: string;
  name: string;
  amount: number;
  date: string;
  maturityDate: string;
  createdAt?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: "transaction" | "alert" | "success";
  read: boolean;
}
