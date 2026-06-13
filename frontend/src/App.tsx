import type { ReactElement } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { About } from "./pages/About";
import { AskAgent } from "./pages/AskAgent";
import { Budget } from "./pages/Budget";
import { Dashboard } from "./pages/Dashboard";
import { Debts } from "./pages/Debts";
import { FinanceGuru } from "./pages/FinanceGuru";
import { Goals } from "./pages/Goals";
import { Investments } from "./pages/Investments";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Notifications } from "./pages/Notifications";
import { Profile } from "./pages/Profile";
import { Reports } from "./pages/Reports";
import { Savings } from "./pages/Savings";
import { SignUp } from "./pages/SignUp";
import { Wallets } from "./pages/Wallets";

function PublicOnly({ children }: { children: ReactElement }) {
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-sm font-medium text-gray-500">
        Loading SafeSpend...
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/login"
          element={
            <PublicOnly>
              <Login />
            </PublicOnly>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnly>
              <SignUp />
            </PublicOnly>
          }
        />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wallets" element={<Wallets />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/savings" element={<Savings />} />
            <Route path="/debts" element={<Debts />} />
            <Route path="/finance-guru" element={<FinanceGuru />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/ask-agent" element={<AskAgent />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/bills" element={<div className="p-8 text-center text-gray-500">Bills feature coming soon</div>} />
            <Route path="/docs" element={<div className="p-8 text-center text-gray-500">Documents feature coming soon</div>} />
            <Route path="/settings" element={<div className="p-8 text-center text-gray-500">Settings feature coming soon</div>} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
