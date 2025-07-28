import { io, Socket } from "socket.io-client";
import { useSocketStore, useTaskStore } from "../store";

class SocketService {
  private socket: Socket | null = null;
  private readonly serverUrl = "http://localhost:5000";

  // Initialize socket connection
  connect(userId: string): void {
    if (this.socket?.connected) {
      console.log("Socket already connected");
      return;
    }

    console.log("🔄 Connecting to TaskMate server...");

    this.socket = io(this.serverUrl, {
      transports: ["websocket", "polling"],
      forceNew: true,
      reconnection: true,
      timeout: 5000,
    });

    this.setupEventListeners(userId);
  }

  // Set up all socket event listeners
  private setupEventListeners(userId: string): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      console.log("🔌 Connected to Socket.io server");
      useSocketStore.getState().setConnected(true);
      useSocketStore.getState().setSocketId(this.socket?.id || null);

      // Join user's personal room
      this.socket?.emit("join-user-room", userId);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from server. Reason:", reason);
      useSocketStore.getState().setConnected(false);
      useSocketStore.getState().setSocketId(null);
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Connection Error:", error.message);
      useSocketStore.getState().setConnected(false);
    });

    // Welcome message
    this.socket.on("welcome", (data) => {
      console.log("🎉 Welcome message:", data.message);
    });

    // Task real-time events
    this.socket.on("task-created", (data) => {
      const store = useTaskStore.getState();
      store.addTask(data.task);
      this.showNotification("✅ New task created!", data.task.title);
    });

    this.socket.on("task-updated", (data) => {
      useTaskStore.getState().updateTask(data.task._id, data.task);
      this.showNotification("🔄 Task updated!", data.task.title);
    });

    this.socket.on("task-deleted", (data) => {
      useTaskStore.getState().deleteTask(data.deletedTask._id);
      this.showNotification("🗑️ Task deleted!", data.deletedTask.title);
    });

    this.socket.on("task-toggled", (data) => {
      console.log("✅ Real-time: Task toggled!", data.task);
      useTaskStore.getState().updateTask(data.task._id, data.task);
      const status = data.task.completed ? "completed" : "reopened";
      this.showNotification(`✅ Task ${status}!`, data.task.title);
    });

    // Error handling
    this.socket.on("error", (error) => {
      console.error("🚨 Socket error:", error);
    });

    // Reconnection events
    this.socket.on("reconnect", (attempt) => {
      console.log("🔄 Reconnected after", attempt, "attempts");
      useSocketStore.getState().setConnected(true);
    });

    this.socket.on("reconnect_error", (error) => {
      console.error("❌ Reconnection error:", error);
    });
  }

  // Show browser notification
  private showNotification(title: string, body: string): void {
    console.log("🔔 Attempting to show notification:", title, body);
    console.log("🔔 Notification permission:", Notification.permission);

    // Check if notifications are supported
    if (!("Notification" in window)) {
      console.log("❌ This browser does not support notifications");
      return;
    }

    // Check permission and show notification
    if (Notification.permission === "granted") {
      console.log("✅ Permission granted, creating notification");
      try {
        const notification = new Notification(title, {
          body,
          icon: "/vite.svg",
          badge: "/vite.svg",
          tag: "taskmate-update", // Prevents duplicate notifications
          requireInteraction: false,
          silent: false,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        console.log("✅ Notification created successfully");
      } catch (error) {
        console.error("❌ Failed to create notification:", error);
      }
    } else if (Notification.permission === "default") {
      console.log("⚠️ Permission not set, requesting...");
      // Request permission if not already asked
      Notification.requestPermission().then((permission) => {
        console.log("🔔 Permission request result:", permission);
        if (permission === "granted") {
          try {
            new Notification(title, {
              body,
              icon: "/vite.svg",
              badge: "/vite.svg",
              tag: "taskmate-update",
              requireInteraction: false,
              silent: false,
            });
            console.log("✅ Notification created after permission grant");
          } catch (error) {
            console.error(
              "❌ Failed to create notification after permission:",
              error
            );
          }
        } else {
          console.log("❌ Notification permission denied by user");
        }
      });
    } else {
      console.log("❌ Notification permission was denied");
    }
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      console.log("🔌 Disconnecting from server...");
      this.socket.disconnect();
      this.socket = null;
      useSocketStore.getState().setConnected(false);
      useSocketStore.getState().setSocketId(null);
    }
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket ID
  getSocketId(): string | null {
    return this.socket?.id || null;
  }

  // Emit typing indicator (for future features)
  emitTyping(userId: string, isTyping: boolean): void {
    this.socket?.emit("typing", { userId, isTyping });
  }
}

// Create singleton instance
export const socketService = new SocketService();

// Request notification permission on app load
export const requestNotificationPermission = async (): Promise<void> => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return;
  }

  if (Notification.permission === "default") {
    console.log("Requesting notification permission...");
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      console.log("✅ Notification permission granted");

      // Show welcome notification
      new Notification("TaskMate Notifications Enabled!", {
        body: "You'll now receive real-time task updates",
        icon: "/vite.svg",
        tag: "welcome",
        requireInteraction: false,
      });
    } else {
      console.log("❌ Notification permission denied");
    }
  } else if (Notification.permission === "granted") {
    console.log("✅ Notification permission already granted");
  } else {
    console.log("❌ Notification permission was denied");
  }
};
