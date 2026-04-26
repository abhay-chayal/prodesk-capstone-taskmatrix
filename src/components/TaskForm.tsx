"use client";

import { useState } from "react";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useTaskStore, Task, TaskStatus } from "@/store/taskStore";
import { useUserStore } from "@/store/userStore";

interface TaskFormProps {
  onClose: () => void;
  initialData?: Task;
}

export default function TaskForm({ onClose, initialData }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [status, setStatus] = useState<TaskStatus>(initialData?.status || "todo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { addTask, updateTask } = useTaskStore();
  const { user } = useUserStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) {
      setError("Title is required.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const timeoutMs = 8000;
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Firestore timeout: Have you created the Firestore database in the Firebase Console?")), timeoutMs)
      );

      if (initialData) {
        // Edit mode
        const taskRef = doc(db, "tasks", initialData.id);
        await Promise.race([updateDoc(taskRef, { title, description, status }), timeoutPromise]);
        updateTask(initialData.id, { title, description, status });
      } else {
        // Create mode
        const newTask = {
          title,
          description,
          status,
          createdAt: Date.now(),
          userId: user.uid,
        };
        const docRef = (await Promise.race([
          addDoc(collection(db, "tasks"), newTask),
          timeoutPromise
        ])) as any;
        addTask({ id: docRef.id, ...newTask });
      }
      onClose();
    } catch (err: any) {
      console.error("Error saving task:", err);
      setError(err.message || "Failed to save task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-slate-800">
          {initialData ? "Edit Task" : "Add New Task"}
        </h2>
        {error && <div className="mb-4 text-sm text-red-500">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 p-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Task title"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 p-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Detailed description..."
              rows={3}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full rounded border border-slate-300 bg-white text-slate-900 p-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded px-4 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
