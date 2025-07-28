import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// User Schema Definition
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [20, "Username cannot exceed 20 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Hash password before saving to database
// This function runs BEFORE user.save() completes
// next: Callback to continue with the save operation
// this: Refers to the user document being saved
userSchema.pre("save", async function (next) {
  // Only hash if password is modified (new user or password change)
  if (!this.isModified("password")) return next();

  // Hash password with salt rounds of 12 (good security vs performance balance)
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare provided password with hashed password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", userSchema);
