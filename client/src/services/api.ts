import axios, { type AxiosInstance } from "axios";
import { useAuthStore } from "../store";

// API Configuration
const API_BASE_URL = "http://localhost:5000";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, logout user
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
}

// Auth API
export const authApi = {
  login: async (data: LoginRequest) => {
    const response = await apiClient.post("/api/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await apiClient.post("/api/auth/register", data);
    return response.data;
  },
};

// Tasks API
export const tasksApi = {
  getTasks: async () => {
    const response = await apiClient.get("/api/tasks");
    return response.data.tasks; // Extract tasks array from response
  },

  createTask: async (data: CreateTaskRequest) => {
    const response = await apiClient.post("/api/tasks", data);
    return response.data.task; // Extract task from response
  },

  updateTask: async (taskId: string, data: UpdateTaskRequest) => {
    const response = await apiClient.put(`/api/tasks/${taskId}`, data);
    return response.data.task; // Extract task from response
  },

  deleteTask: async (taskId: string) => {
    const response = await apiClient.delete(`/api/tasks/${taskId}`);
    return response.data;
  },

  toggleTask: async (taskId: string) => {
    const response = await apiClient.patch(`/api/tasks/${taskId}/toggle`);
    return response.data.task; // Extract task from response
  },
};

// AI API
export const aiApi = {
  /**
   * Sends a task title to the backend to be broken down into sub-tasks.
   * @param taskTitle The title of the complex task.
   * @returns A promise that resolves to an array of sub-task strings.
   */
  breakdownTask: async (taskTitle: string): Promise<string[]> => {
    const response = await apiClient.post("/api/ai/breakdown-task", {
      taskTitle,
    });
    return response.data.subtasks; // e.g., ["Book flights", "Reserve hotel"]
  },

  /**
   * Sends a question to the AI for a productivity-related answer.
   * @param question The user's question.
   * @returns A promise that resolves to the AI's answer string.
   */
  askQuestion: async (question: string): Promise<string> => {
    const response = await apiClient.post("/api/ai/ask-question", { question });
    return response.data.answer;
  },
};

// Export the client for custom requests
export default apiClient;
