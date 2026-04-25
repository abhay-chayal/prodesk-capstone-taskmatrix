"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { useTaskStore, Task } from "@/store/taskStore";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import TaskList from "@/components/TaskList";
import TaskForm from "@/components/TaskForm";
import TaskChart from "@/components/TaskChart";
import { PlusIcon } from "lucide-react";

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useUserStore();
  const { setTasks, setLoadingTasks } = useTaskStore();
  const router = useRouter();

  const [showAddModal, setShowAddModal] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // 1. Auth check
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // 2. Fetch Tasks
  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;
      
      setLoadingTasks(true);
      setFetchError(null);
      try {
        const q = query(collection(db, "tasks"), where("userId", "==", user.uid));
        
        const timeoutMs = 8000;
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Firestore timeout: Have you created the Firestore database in the Firebase Console?")), timeoutMs)
        );

        const querySnapshot = (await Promise.race([
          getDocs(q),
          timeoutPromise
        ])) as any;
        
        const loadedTasks: Task[] = [];
        querySnapshot.forEach((doc: any) => {
          loadedTasks.push({ id: doc.id, ...doc.data() } as Task);
        });
        
        // Sorting by createdAt locally
        loadedTasks.sort((a, b) => b.createdAt - a.createdAt);
        setTasks(loadedTasks);
      } catch (error: any) {
        console.error("Error fetching tasks:", error);
        setFetchError(error.message || "Failed to fetch tasks.");
      } finally {
        setLoadingTasks(false);
      }
    };

    if (user && isAuthenticated) {
      fetchTasks();
    }
  }, [user, isAuthenticated, setTasks, setLoadingTasks]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <div className="text-lg font-medium text-slate-600">Loading Dashboard...</div>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow p-6 text-center">
          <div className="text-rose-500 mb-4 px-4 py-3 bg-rose-50 rounded-md border border-rose-100">
            <h3 className="font-bold text-lg mb-1">Connection Error</h3>
            <p className="text-sm">{fetchError}</p>
          </div>
          <p className="text-slate-600 mb-6 text-sm">
            Firebase Auth works, but Firestore cannot be reached. Please ensure you have clicked "Create Database" under Firestore Database in your Firebase Console.
          </p>
          <button onClick={() => window.location.reload()} className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700">
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Navigation */}
        <nav className="mb-8 flex items-center justify-between rounded-lg bg-white p-4 shadow-sm">
          <h1 className="text-2xl font-bold text-indigo-600">TaskMatrix</h1>
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline-block text-sm text-slate-600">
              {user?.name || user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="rounded bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
              Logout
            </button>
          </div>
        </nav>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
           {/* Left/Top Column: Tasks List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between rounded-xl bg-white p-6 shadow-sm border border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Your Tasks</h2>
                <p className="text-sm text-slate-500 mt-1">Manage and organize your personal workload.</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-white shadow hover:bg-indigo-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Task</span>
              </button>
            </div>
            
            <div>
              <TaskList />
            </div>
          </div>

          {/* Right/Bottom Column: Analytics */}
          <div className="space-y-6">
            <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
              <TaskChart />
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <TaskForm onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
