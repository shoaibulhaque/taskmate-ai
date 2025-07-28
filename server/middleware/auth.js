import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to authenticate JWT tokens
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        message: "Access denied. No token provided.",
      });
    }

    // Verify token using jwt secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database (optional: for additional user info) retrieving user info without passwords...
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid token. User not found.",
      });
    }

    // Attach user info to request object
    req.user = {
      userId: decoded.userId,
      username: user.username,
      email: user.email,
    };

    next(); // Continue to the next middleware/route handler
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({
        message: "Invalid token.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(403).json({
        message: "Token expired.",
      });
    }

    console.error("Auth middleware error:", error);
    res.status(500).json({
      message: "Server error during authentication",
    });
  }
};

export default authenticateToken;
