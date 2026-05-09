import User from "../models/user.js";

/**
 * Middleware to verify user's current role from the database
 * Ensures that if an admin changed a user's role, it's immediately enforced
 */
export const verifyCurrentRole = async (req, res, next) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Fetch the user's current role from the database
    const user = await User.findById(req.session.userId).select("role status");

    if (!user) {
      // User was deleted
      req.session.destroy((err) => {
        if (err) console.error("Session destroy error:", err);
      });

      return res.status(401).json({ message: "User not found" });
    }

    // Check if user is disabled
    if (user.status === "DISABLED") {
      req.session.destroy((err) => {
        if (err) console.error("Session destroy error:", err);
      });

      return res.status(403).json({
        message: "Your account has been disabled. Please contact support.",
      });
    }

    // Set session role to the received/current database role
    req.session.role = user.role;

    // Check if user still has ADMIN role
    if (user.role !== "ADMIN") {
      return res.status(403).json({
        message:
          "Access denied. Your role has been changed and no longer has admin privileges.",
      });
    }

    next();
  } catch (error) {
    console.error("verifyCurrentRole error:", error);

    res.status(500).json({ message: "Internal server error" });
  }
};