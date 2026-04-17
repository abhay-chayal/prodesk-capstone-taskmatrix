"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    // If we've finished loading and the user is NOT authenticated, boot them to login
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  // Show a loading state while auth status is being determined
  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-xl text-slate-600">Loading Dashboard...</div>
      </div>
    );
  }

  // Once authenticated
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <nav className="flex justify-between items-center mb-8 bg-white p-4 shadow-sm rounded">
          <h1 className="text-xl font-bold text-indigo-600">TaskMatrix</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-200 text-slate-800 rounded hover:bg-slate-300 transition-colors"
          >
            Logout
          </button>
        </nav>

        <main className="bg-white p-8 rounded shadow-sm border border-slate-100">
          <h2 className="text-2xl font-bold mb-4">
            Welcome, {user?.name || "Abhay"}
          </h2>
          <div className="mb-6 space-y-2">
            <p className="text-slate-600">
              <span className="font-semibold text-slate-900">Email:</span>{" "}
              <a href={`mailto:${user?.email}`} className="text-indigo-600 hover:underline">
                {user?.email}
              </a>
            </p>
            <p className="text-slate-600">
              <span className="font-semibold text-slate-900">User ID:</span> {user?.uid}
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 text-slate-500">
            <p>This is your protected dashboard. Only authenticated users can see this screen.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
