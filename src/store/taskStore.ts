import { create } from 'zustand';

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: number;
  userId: string;
}

interface TaskState {
  tasks: Task[];
  loadingTasks: boolean;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updatedData: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  setLoadingTasks: (loading: boolean) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  loadingTasks: true,
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (taskId, updatedData) => 
    set((state) => ({
      tasks: state.tasks.map((task) => 
        task.id === taskId ? { ...task, ...updatedData } : task
      ),
    })),
  deleteTask: (taskId) => 
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== taskId),
    })),
  setLoadingTasks: (loadingTasks) => set({ loadingTasks }),
}));
