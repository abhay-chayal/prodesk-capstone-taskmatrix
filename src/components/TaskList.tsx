"use client";

import { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useTaskStore, Task } from "@/store/taskStore";
import { PencilIcon, TrashIcon } from "lucide-react";
import TaskForm from "./TaskForm";
import { toast } from "sonner";

// Skeleton Loader Component
function TaskSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex flex-col sm:flex-row justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm animate-pulse"
        >
          <div className="flex-1 space-y-3">
            <div className="h-5 w-3/4 rounded-md bg-slate-200" />
            <div className="h-4 w-full rounded-md bg-slate-100" />
            <div className="flex items-center space-x-3">
              <div className="h-5 w-20 rounded-full bg-slate-200" />
              <div className="h-4 w-24 rounded-md bg-slate-100" />
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex items-start justify-end space-x-2">
            <div className="h-9 w-9 rounded-md bg-slate-100" />
            <div className="h-9 w-9 rounded-md bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function TaskList() {
  const { tasks, loadingTasks, deleteTask } = useTaskStore();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(null);
    setDeletingId(id);
    try {
      const timeoutMs = 8000;
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Firestore timeout: Cannot connect to database.")), timeoutMs)
      );

      await Promise.race([
        deleteDoc(doc(db, "tasks", id)),
        timeoutPromise
      ]);
      
      deleteTask(id);
      toast.success("Task deleted successfully");
    } catch (err: any) {
      console.error("Error deleting task:", err);
      toast.error(err.message || "Failed to delete task");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo": return "bg-rose-100 text-rose-800 border-rose-200";
      case "in-progress": return "bg-amber-100 text-amber-800 border-amber-200";
      case "done": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  if (loadingTasks) {
    return <TaskSkeleton />;
  }

  if (tasks.length === 0) {
    return (
      <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-lg">
        <p className="text-slate-500">No tasks yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div 
          key={task.id} 
          className="flex flex-col sm:flex-row justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:scale-[1.01] hover:border-slate-300 transition-all duration-200"
        >
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-800 truncate">{task.title}</h3>
            {task.description && (
              <p className="mt-1 text-sm text-slate-600 line-clamp-2 break-words">{task.description}</p>
            )}
            <div className="mt-3 flex items-center space-x-3">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(task.status)}`}>
                {task.status.replace('-', ' ')}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(task.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          <div className="mt-3 sm:mt-0 flex items-start justify-end space-x-2 flex-shrink-0">
            <button
              onClick={() => setEditingTask(task)}
              disabled={deletingId === task.id}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 disabled:opacity-50 active:scale-90"
              title="Edit Task"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            
            {confirmDeleteId === task.id ? (
              <div className="flex items-center space-x-1 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                <span className="text-xs font-semibold text-rose-600 mr-1">Delete?</span>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="min-h-[32px] px-2 py-1 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-md transition-all duration-200 active:scale-90"
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="min-h-[32px] px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-md transition-all duration-200 active:scale-90"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDeleteId(task.id)}
                disabled={deletingId === task.id}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-200 disabled:opacity-50 active:scale-90"
                title="Delete Task"
              >
                {deletingId === task.id ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-rose-500 border-t-transparent"></div>
                ) : (
                  <TrashIcon className="h-5 w-5" />
                )}
              </button>
            )}
          </div>
        </div>
      ))}

      {editingTask && (
        <TaskForm 
          initialData={editingTask} 
          onClose={() => setEditingTask(null)} 
        />
      )}
    </div>
  );
}
