"use client";

import { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useTaskStore, Task } from "@/store/taskStore";
import { PencilIcon, TrashIcon } from "lucide-react";
import TaskForm from "./TaskForm";

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
    } catch (err: any) {
      console.error("Error deleting task:", err);
      alert(err.message || "Failed to delete task.");
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
    return <div className="py-8 text-center text-slate-500">Loading tasks...</div>;
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
          className="flex flex-col sm:flex-row justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-800">{task.title}</h3>
            {task.description && (
              <p className="mt-1 text-sm text-slate-600 line-clamp-2">{task.description}</p>
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
          
          <div className="mt-4 sm:mt-0 flex items-start justify-end space-x-2">
            <button
              onClick={() => setEditingTask(task)}
              disabled={deletingId === task.id}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors disabled:opacity-50"
              title="Edit Task"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            
            {confirmDeleteId === task.id ? (
              <div className="flex items-center space-x-1 bg-rose-50 px-2 rounded-md border border-rose-100">
                <span className="text-xs font-semibold text-rose-600 mr-1">Delete?</span>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="px-2 py-1 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 rounded transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded transition-colors"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDeleteId(task.id)}
                disabled={deletingId === task.id}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors disabled:opacity-50"
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
