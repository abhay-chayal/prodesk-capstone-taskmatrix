"use client";

import { useState } from "react";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useTaskStore, Task, TaskStatus } from "@/store/taskStore";
import { useUserStore } from "@/store/userStore";
import { Sparkles, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

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

  // AI Subtask state
  const [aiSubtasks, setAiSubtasks] = useState<string[]>([]);
  const [checkedSubtasks, setCheckedSubtasks] = useState<Set<number>>(new Set());
  const [aiLoading, setAiLoading] = useState(false);

  const { addTask, updateTask } = useTaskStore();
  const { user } = useUserStore();

  const handleGenerateSubtasks = async () => {
    if (!title.trim()) {
      toast.error("Please enter a task title first");
      return;
    }

    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate-subtasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate subtasks");
      }

      setAiSubtasks(data.subtasks);
      setCheckedSubtasks(new Set(data.subtasks.map((_: string, i: number) => i)));
      toast.success("Subtasks generated!");
    } catch (err: any) {
      console.error("AI generation error:", err);
      toast.error(err.message || "Failed to generate subtasks");
    } finally {
      setAiLoading(false);
    }
  };

  const toggleSubtask = (index: number) => {
    setCheckedSubtasks((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) {
      setError("Title is required.");
      return;
    }
    setLoading(true);
    setError("");

    // Build final description with selected subtasks
    let finalDescription = description;
    if (aiSubtasks.length > 0) {
      const selectedSubtasks = aiSubtasks.filter((_, i) => checkedSubtasks.has(i));
      if (selectedSubtasks.length > 0) {
        const subtaskList = selectedSubtasks.map((s) => `• ${s}`).join("\n");
        finalDescription = finalDescription
          ? `${finalDescription}\n\nSubtasks:\n${subtaskList}`
          : `Subtasks:\n${subtaskList}`;
      }
    }

    try {
      const timeoutMs = 8000;
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Firestore timeout: Have you created the Firestore database in the Firebase Console?")), timeoutMs)
      );

      if (initialData) {
        // Edit mode
        const taskRef = doc(db, "tasks", initialData.id);
        await Promise.race([updateDoc(taskRef, { title, description: finalDescription, status }), timeoutPromise]);
        updateTask(initialData.id, { title, description: finalDescription, status });
        toast.success("Task updated successfully");
      } else {
        // Create mode
        const newTask = {
          title,
          description: finalDescription,
          status,
          createdAt: Date.now(),
          userId: user.uid,
        };
        const docRef = (await Promise.race([
          addDoc(collection(db, "tasks"), newTask),
          timeoutPromise
        ])) as any;
        addTask({ id: docRef.id, ...newTask });
        toast.success("Task added successfully");
      }
      onClose();
    } catch (err: any) {
      console.error("Error saving task:", err);
      toast.error(err.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <h2 className="mb-4 text-xl font-bold text-slate-800">
          {initialData ? "Edit Task" : "Add New Task"}
        </h2>
        {error && <div className="mb-4 text-sm text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 p-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              placeholder="Task title"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 p-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              placeholder="Detailed description..."
              rows={3}
            />
          </div>

          {/* AI Subtask Generation — only in create mode */}
          {!initialData && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGenerateSubtasks}
                disabled={aiLoading || !title.trim()}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:shadow-lg hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Subtasks with AI</span>
                  </>
                )}
              </button>

              {/* AI Generated Subtasks Checklist */}
              {aiSubtasks.length > 0 && (
                <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3 space-y-2">
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                    AI-Generated Subtasks
                  </p>
                  {aiSubtasks.map((subtask, index) => (
                    <label
                      key={index}
                      className="flex items-start space-x-2.5 cursor-pointer group"
                    >
                      <div
                        onClick={() => toggleSubtask(index)}
                        className={`mt-0.5 flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                          checkedSubtasks.has(index)
                            ? "bg-indigo-600 border-indigo-600"
                            : "border-slate-300 group-hover:border-indigo-400"
                        }`}
                      >
                        {checkedSubtasks.has(index) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span
                        onClick={() => toggleSubtask(index)}
                        className={`text-sm transition-all duration-200 ${
                          checkedSubtasks.has(index) ? "text-slate-800" : "text-slate-400 line-through"
                        }`}
                      >
                        {subtask}
                      </span>
                    </label>
                  ))}
                  <p className="text-xs text-slate-400 mt-1">
                    Uncheck subtasks you don&apos;t want to include
                  </p>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full rounded-lg border border-slate-300 bg-white text-slate-900 p-2.5 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto rounded-lg px-4 py-2.5 text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-all duration-200 active:scale-95 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto rounded-lg bg-indigo-600 px-6 py-2.5 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center transition-all duration-200 active:scale-95 font-medium shadow-sm hover:shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
