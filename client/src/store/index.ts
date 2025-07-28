import { create } from "zustand";
import { devtools } from "zustand/middleware";

// Types
export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Auth Store
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      token: localStorage.getItem("token"),
      isAuthenticated: !!localStorage.getItem("token"),
      isLoading: false,

      setUser: (user) => set({ user }),

      setToken: (token) => {
        if (token) {
          localStorage.setItem("token", token);
        } else {
          localStorage.removeItem("token");
        }
        set({ token, isAuthenticated: !!token });
      },

      login: (user, token) => {
        localStorage.setItem("token", token);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        localStorage.removeItem("token");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    { name: "auth-store" }
  )
);

// Task Store
interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  toggleTask: (taskId: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useTaskStore = create<TaskState>()(
  devtools(
    (set) => ({
      tasks: [],
      isLoading: false,

      setTasks: (tasks) => set({ tasks }),

      addTask: (task) =>
        set(
          (state) => ({
            tasks: [task, ...state.tasks],
          }),
          false,
          "addTask"
        ),

      updateTask: (taskId, updates) =>
        set(
          (state) => ({
            tasks: state.tasks.map((task) =>
              task._id === taskId ? { ...task, ...updates } : task
            ),
          }),
          false,
          "updateTask"
        ),

      deleteTask: (taskId) =>
        set(
          (state) => ({
            tasks: state.tasks.filter((task) => task._id !== taskId),
          }),
          false,
          "deleteTask"
        ),

      toggleTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task._id === taskId ? { ...task, completed: !task.completed } : task
          ),
        })),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    { name: "task-store" }
  )
);

// Socket Store for real-time connection status
interface SocketState {
  isConnected: boolean;
  socketId: string | null;
  setConnected: (connected: boolean) => void;
  setSocketId: (socketId: string | null) => void;
}

export const useSocketStore = create<SocketState>()(
  devtools(
    (set) => ({
      isConnected: false,
      socketId: null,

      setConnected: (connected) => set({ isConnected: connected }),
      setSocketId: (socketId) => set({ socketId }),
    }),
    { name: "socket-store" }
  )
);
