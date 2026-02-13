
export enum AppView {
  SIGN_IN = 'SIGN_IN',
  SIGN_UP = 'SIGN_UP',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
  DASHBOARD = 'DASHBOARD'
}

export interface UserFormData {
  firstName?: string;
  lastName?: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  rememberMe?: boolean;
  termsAccepted?: boolean;
}

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  type: 'expense' | 'income';
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}
