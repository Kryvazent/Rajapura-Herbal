import User from "../models/user.js";

export const verifyCurrentRole = async (req, res, next) => {
  try {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    
    const user = await User.findById(req.session.userId).select("role status");

    if (!user) {
      
      req.session.destroy((err) => {
        if (err) console.error("Session destroy error:", err);
      });

      return res.status(401).json({ message: "User not found" });
    }

    
    if (user.status === "DISABLED") {
      req.session.destroy((err) => {
        if (err) console.error("Session destroy error:", err);
      });

      return res.status(403).json({
        message: "Your account has been disabled. Please contact support.",
      });
    }

    
    req.session.role = user.role;

    
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