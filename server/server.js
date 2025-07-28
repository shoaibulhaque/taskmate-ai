import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";
import aiRoutes from "./routes/ai.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Create HTTP server (needed for Socket.io)
const server = createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173", // Allow test client
      "file://",
      "null",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.log("MongoDB connection error:", error));

// Basic route for testing
app.get("/", (req, res) => {
  res.json({ message: "TaskMate API is running!" });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Task routes (protected) - Pass io instance for real-time updates
app.use(
  "/api/tasks",
  (req, res, next) => {
    req.io = io; // Attach Socket.io instance to request
    next();
  },
  taskRoutes
);

// AI routes (protected)
app.use("/api/ai", aiRoutes);

// Socket.io Connection Handling
io.on("connection", (socket) => {
  console.log(`🔌 New Socket.io connection: ${socket.id}`);

  // Handle user joining their personal room
  socket.on("join-user-room", (userId) => {
    socket.join(userId);
    console.log(`🏠 User ${userId} joined room with socket ${socket.id}`);

    // Send welcome message
    socket.emit("welcome", {
      message: "Connected to TaskMate real-time updates!",
      userId: userId,
    });
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });

  // Debug: Handle any other events
  socket.onAny((eventName, ...args) => {
    console.log(`📡 Received event: ${eventName}`, args);
  });

  // Handle typing indicators (for future features)
  socket.on("typing", (data) => {
    socket.to(data.userId).emit("user-typing", {
      userId: data.userId,
      isTyping: data.isTyping,
    });
  });
});

// Start server (HTTP + WebSocket)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.io enabled for real-time features`);
});
