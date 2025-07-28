import express from "express";
import Task from "../models/Task.js";
import authenticateToken from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all task routes, the middleware will run before the route
// Client → Request → Express Server → Middleware → Route Handler → Response → Client
router.use(authenticateToken);

// @route   GET /api/tasks
// @desc    Get all tasks for the authenticated user
// @access  Private
router.get("/", async (req, res) => {
  try {
    // Find tasks only for the authenticated user
    const tasks = await Task.find({ userId: req.user.userId }).sort({
      createdAt: -1,
    }); // Most recent first

    res.json({
      message: "Tasks retrieved successfully",
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({ message: "Server error while fetching tasks" });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
router.post("/", async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: "Task title is required" });
    }

    // Create new task
    const task = new Task({
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      userId: req.user.userId, // Associate task with authenticated user
    });

    await task.save();

    // Broadcast real-time update to user's room
    if (req.io) {
      console.log(
        `📡 Broadcasting task-created event to user: ${req.user.userId}`
      );
      req.io.to(req.user.userId).emit("task-created", {
        message: "New task created!",
        task: task,
      });
      console.log(`✅ Event broadcasted successfully`);
    } else {
      console.log(`❌ req.io not available for broadcasting`);
    }

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    console.error("Create task error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    res.status(500).json({ message: "Server error while creating task" });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get a specific task by ID
// @access  Private
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.userId, // Ensure user can only access their own tasks
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({
      message: "Task retrieved successfully",
      task,
    });
  } catch (error) {
    console.error("Get task error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    res.status(500).json({ message: "Server error while fetching task" });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task
// @access  Private
router.put("/:id", async (req, res) => {
  try {
    const { title, description, completed, priority, dueDate } = req.body;

    // Find task and ensure it belongs to the authenticated user
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update task fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined)
      task.dueDate = dueDate ? new Date(dueDate) : null;

    await task.save();

    // Broadcast real-time update to user's room
    if (req.io) {
      req.io.to(req.user.userId).emit("task-updated", {
        message: "Task updated successfully!",
        task: task,
      });
    }

    res.json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Update task error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    res.status(500).json({ message: "Server error while updating task" });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete("/:id", async (req, res) => {
  try {
    // Find and delete task (only if it belongs to the authenticated user)
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Broadcast real-time update to user's room
    if (req.io) {
      req.io.to(req.user.userId).emit("task-deleted", {
        message: "Task deleted successfully!",
        deletedTask: task,
      });
    }

    res.json({
      message: "Task deleted successfully",
      deletedTask: task,
    });
  } catch (error) {
    console.error("Delete task error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    res.status(500).json({ message: "Server error while deleting task" });
  }
});

// @route   PATCH /api/tasks/:id/toggle
// @desc    Toggle task completion status
// @access  Private
router.patch("/:id/toggle", async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Toggle completion status
    task.completed = !task.completed;
    await task.save();

    // Broadcast real-time update to user's room
    if (req.io) {
      req.io.to(req.user.userId).emit("task-toggled", {
        message: `Task marked as ${
          task.completed ? "completed" : "incomplete"
        }`,
        task: task,
      });
    }

    res.json({
      message: `Task marked as ${task.completed ? "completed" : "incomplete"}`,
      task,
    });
  } catch (error) {
    console.error("Toggle task error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    res.status(500).json({ message: "Server error while toggling task" });
  }
});

export default router;
