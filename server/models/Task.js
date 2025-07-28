import mongoose from "mongoose";

// Task Schema Definition
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [100, "Task title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Task description cannot exceed 500 characters"],
      default: "",
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Index for faster queries by user
taskSchema.index({ userId: 1, createdAt: -1 });

// Instance method to check if task belongs to user
taskSchema.methods.belongsToUser = function (userId) {
  return this.userId.toString() === userId.toString();
};

export default mongoose.model("Task", taskSchema);
