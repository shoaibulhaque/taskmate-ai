import React, { useState, useEffect, useMemo } from "react";
import { useAuthStore, useTaskStore } from "../store";
import { tasksApi, aiApi } from "../services/api"; // Ensure aiApi is imported
import LoadingSpinner from "../components/LoadingSpinner";
import AiChatModal from "../components/ai/AiChatModal"; // Import the new AI modal
import {
  FaPlus,
  FaCheckCircle,
  FaTrash,
  FaBrain,
  FaMagic,
} from "react-icons/fa"; // Import FaMagic
import { format, parseISO } from "date-fns";

const DashboardPage: React.FC = () => {
  // --- STATE MANAGEMENT ---
  // State from our global Zustand stores
  const user = useAuthStore((state) => state.user);
  const {
    tasks,
    setTasks,
    updateTask: updateStoreTask,
    deleteTask: deleteStoreTask,
  } = useTaskStore();

  // Local component state for UI control
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
  });
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  // State specifically for AI features
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [breakdownTaskId, setBreakdownTaskId] = useState<string | null>(null);
  const [breakdownSuggestions, setBreakdownSuggestions] = useState<string[]>(
    []
  );
  const [isBreakingDown, setIsBreakingDown] = useState(false);

  // --- DATA FETCHING ---
  // Runs once when the component first mounts to load initial tasks
  useEffect(() => {
    tasksApi
      .getTasks()
      .then((tasksData) => {
        setTasks(Array.isArray(tasksData) ? tasksData : []);
      })
      .catch(() => setTasks([]))
      .finally(() => setIsLoading(false));
  }, [setTasks]);

  // --- HANDLER FUNCTIONS ---
  const handleOpenModal = () => {
    setNewTask({ title: "", description: "", priority: "medium" });
    setIsModalOpen(true);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    setIsSubmitting(true);
    try {
      // The API call will trigger a socket event which updates the store.
      // This is more robust than manually adding to the store here.
      await tasksApi.createTask(newTask);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;
    // Optimistic UI Update: Update the UI instantly.
    updateStoreTask(taskId, { completed: !task.completed });
    try {
      // Send the request to the server in the background.
      await tasksApi.toggleTask(taskId);
    } catch {
      // If the server fails, revert the change in the UI.
      updateStoreTask(taskId, { completed: task.completed });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    const originalTasks = [...tasks];
    // Optimistic UI Update: Remove the task from the list instantly.
    deleteStoreTask(taskId);
    try {
      await tasksApi.deleteTask(taskId);
    } catch {
      // If the server fails, put the tasks back how they were.
      setTasks(originalTasks);
    }
  };

  const handleBreakdownTask = async (task: { _id: string; title: string }) => {
    if (breakdownTaskId === task._id) {
      setBreakdownTaskId(null);
      return;
    }
    setIsBreakingDown(true);
    setBreakdownTaskId(task._id);
    setBreakdownSuggestions([]);
    try {
      const subtasks = await aiApi.breakdownTask(task.title);
      setBreakdownSuggestions(subtasks);
    } catch (error) {
      console.error("Failed to get AI breakdown:", error);
      setBreakdownTaskId(null);
    } finally {
      setIsBreakingDown(false);
    }
  };

  // --- MEMOIZED COMPUTATIONS ---
  // These calculations only re-run when `tasks` or `filter` changes.
  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (filter === "completed") return task.completed;
        if (filter === "pending") return !task.completed;
        return true;
      }),
    [tasks, filter]
  );

  const stats = useMemo(
    () => ({
      total: tasks.length,
      completed: tasks.filter((t) => t.completed).length,
      pending: tasks.filter((t) => !t.completed).length,
    }),
    [tasks]
  );

  // --- STYLING ---
  const priorityClasses = {
    high: "border-l-error",
    medium: "border-l-warning",
    low: "border-l-success",
  };

  if (isLoading) return <LoadingSpinner fullScreen />;

  // --- JSX RENDER ---
  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-base-content">
            Welcome back, {user?.username}. You have {stats.pending} pending
            tasks.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main tasks column */}
          <main className="lg:col-span-2 space-y-6">
            <div className="card bg-base-200">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                  <div className="tabs tabs-boxed">
                    {(["all", "pending", "completed"] as const).map((f) => (
                      <a
                        key={f}
                        className={`tab ${filter === f ? "tab-active" : ""}`}
                        onClick={() => setFilter(f)}
                      >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </a>
                    ))}
                  </div>
                  <button onClick={handleOpenModal} className="btn btn-primary">
                    <FaPlus className="mr-2" /> Add Task
                  </button>
                </div>

                <div className="space-y-2">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <div key={task._id}>
                        <div
                          className={`flex items-center gap-3 p-4 bg-base-100 rounded-lg border-l-4 ${
                            priorityClasses[task.priority]
                          } transition-opacity ${
                            task.completed ? "opacity-60" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => handleToggleTask(task._id)}
                            className="checkbox checkbox-primary"
                          />
                          <div className="flex-grow">
                            <p
                              className={`font-medium text-primary ${
                                task.completed ? "line-through" : ""
                              }`}
                            >
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-sm text-base-content">
                                {task.description}
                              </p>
                            )}
                          </div>
                          <div className="text-sm text-base-content hidden sm:block">
                            {format(parseISO(task.createdAt), "MMM d, yyyy")}
                          </div>

                          <button
                            onClick={() => handleBreakdownTask(task)}
                            className="btn btn-ghost btn-sm btn-square text-base-content/70 hover:text-primary hover:bg-primary/10"
                            title="Break down task with AI"
                            disabled={
                              isBreakingDown && breakdownTaskId === task._id
                            }
                          >
                            {isBreakingDown && breakdownTaskId === task._id ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              <FaMagic />
                            )}
                          </button>

                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="btn btn-ghost btn-sm btn-square text-base-content/70 hover:text-error hover:bg-error/10"
                          >
                            <FaTrash />
                          </button>
                        </div>

                        {breakdownTaskId === task._id &&
                          breakdownSuggestions.length > 0 && (
                            <div className="p-4 ml-8 mt-2 bg-primary/5 border-l-2 border-primary rounded-r-lg">
                              <h4 className="font-bold text-sm text-primary mb-2">
                                Suggested Sub-tasks:
                              </h4>
                              <ul className="list-disc list-inside space-y-1 text-sm text-base-content">
                                {breakdownSuggestions.map((subtask, index) => (
                                  <li key={index}>{subtask}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <FaCheckCircle className="mx-auto text-5xl text-success mb-4" />
                      <h3 className="text-xl font-bold text-primary">
                        All Clear!
                      </h3>
                      <p className="text-base-content">
                        You have no {filter} tasks.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="card bg-base-200">
              <div className="card-body">
                <h2 className="card-title text-primary">Stats</h2>
                <div className="stats stats-vertical shadow w-full bg-base-100">
                  <div className="stat">
                    <div className="stat-title">Total Tasks</div>
                    <div className="stat-value">{stats.total}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Pending</div>
                    <div className="stat-value text-warning">
                      {stats.pending}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Completed</div>
                    <div className="stat-value text-success">
                      {stats.completed}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="card bg-base-200">
              <div className="card-body">
                <h2 className="card-title text-primary flex items-center gap-2">
                  <FaBrain className="text-primary" />
                  AI Assistant
                </h2>
                <p className="text-sm text-base-content">
                  Need help? Ask our AI assistant about productivity and time
                  management.
                </p>
                <div className="card-actions justify-end mt-2">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setIsAiModalOpen(true)}
                  >
                    Ask AI
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* --- MODALS --- */}
      {/* This is the modal for adding a new task */}
      <div className={`modal ${isModalOpen ? "modal-open" : ""}`}>
        <div className="modal-box">
          <button
            onClick={() => setIsModalOpen(false)}
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          >
            ✕
          </button>
          <h3 className="font-bold text-lg text-primary mb-4">
            Create a New Task
          </h3>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Title</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Finish project report"
                className="input input-bordered w-full"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                required
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Description (Optional)</span>
              </label>
              <textarea
                placeholder="Add more details..."
                className="textarea textarea-bordered w-full"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Priority</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={newTask.priority}
                onChange={(e) =>
                  setNewTask({ ...newTask, priority: e.target.value as any })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="modal-action">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Create Task"
                )}
              </button>
            </div>
          </form>
        </div>
        <div className="modal-backdrop">
          <button onClick={() => setIsModalOpen(false)}>close</button>
        </div>
      </div>

      {/* This is our new AI Chat Modal component */}
      <AiChatModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;
