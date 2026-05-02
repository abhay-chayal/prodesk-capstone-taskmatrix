"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useUserStore } from "@/store/userStore";
import { Menu, X, LogOut, User } from "lucide-react";

export default function Navbar() {
  const { user } = useUserStore();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <>
      <nav className="mb-8 flex items-center justify-between rounded-lg bg-white p-4 shadow-sm border border-slate-100">
        {/* Logo */}
        <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">
          TaskMatrix
        </h1>

        {/* Desktop controls */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="flex items-center space-x-2 rounded-full bg-slate-50 px-3 py-1.5 border border-slate-100">
            <User className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-600 max-w-[200px] truncate">
              {user?.name || user?.email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-200 hover:shadow-sm active:scale-95"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden flex items-center justify-center h-10 w-10 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors active:scale-95"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </nav>

      {/* Mobile overlay backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile slide-in menu */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Menu header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-indigo-600">Menu</h2>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-center h-10 w-10 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors active:scale-95"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm">
              {(user?.name || user?.email || "U")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              {user?.name && (
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {user.name}
                </p>
              )}
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Menu actions */}
        <div className="p-4">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="flex items-center space-x-3 w-full rounded-lg px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all duration-200 active:scale-95"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
