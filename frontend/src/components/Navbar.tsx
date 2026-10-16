import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Store, LogOut, KeyRound, User as UserIcon, ShieldAlert, ShoppingBag } from "lucide-react";
import { ChangePasswordModal } from "./ChangePasswordModal";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  if (!user) return null;

  const roleBadgeConfig = {
    ADMIN: {
      label: "System Administrator",
      bg: "bg-purple-100 text-purple-800 border-purple-200",
      icon: ShieldAlert,
    },
    STORE_OWNER: {
      label: "Store Owner",
      bg: "bg-amber-100 text-amber-800 border-amber-200",
      icon: ShoppingBag,
    },
    USER: {
      label: "Normal User",
      bg: "bg-brand-100 text-brand-800 border-brand-200",
      icon: UserIcon,
    },
  }[user.role];

  const RoleIcon = roleBadgeConfig.icon;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                StoreRate
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                Hub
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-sm font-semibold text-slate-800 truncate max-w-[200px]" title={user.name}>
                {user.name}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${roleBadgeConfig.bg}`}>
                  <RoleIcon className="w-3 h-3" />
                  {roleBadgeConfig.label}
                </span>
                {user.store && (
                  <span className="text-xs text-slate-500 font-medium truncate max-w-[150px]">
                    • {user.store.name}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="p-2 sm:px-3 sm:py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/70 rounded-xl transition-all flex items-center gap-1.5"
              title="Change Password"
            >
              <KeyRound className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">Change Password</span>
            </button>

            <button
              onClick={logout}
              className="p-2 sm:px-3.5 sm:py-2 text-xs font-medium text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-xl transition-all flex items-center gap-1.5 border border-rose-100 hover:border-transparent"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
};
