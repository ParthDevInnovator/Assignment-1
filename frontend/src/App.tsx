import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { UserDashboard } from "./pages/UserDashboard";
import { OwnerDashboard } from "./pages/OwnerDashboard";

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [authView, setAuthView] = useState<"login" | "signup">("login");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400">Loading StoreRate Platform...</p>
      </div>
    );
  }

  if (!user) {
    if (authView === "signup") {
      return <SignupPage onNavigateToLogin={() => setAuthView("login")} />;
    }
    return <LoginPage onNavigateToSignup={() => setAuthView("signup")} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        {user.role === "ADMIN" && <AdminDashboard />}
        {user.role === "STORE_OWNER" && <OwnerDashboard />}
        {user.role === "USER" && <UserDashboard />}
      </main>
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-400">
        Store Rating Platform &copy; 2026. Built with Express, PostgreSQL & React.
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
