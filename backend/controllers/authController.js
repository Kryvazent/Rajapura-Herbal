// backend/controllers/authController.js
import * as authService from "../services/authService.js";

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(422).json({
      success: false,
      message: "Username and password are required"
    });
  }

  try {
    const user = await authService.login(username.trim().toLowerCase());

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (user.status === "DISABLED") {
      return res.status(403).json({
        success: false,
        message: "Your account has been disabled. Contact support.",
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    req.session.role = user.role;
    req.session.userId = user._id;
    // Store mustChangePassword in session so middleware can check it
    req.session.mustChangePassword = user.flags?.mustChangePassword ?? false;

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ success: false, message: "Session save failed" });
      }
      res.status(200).json({
        success: true,
        message: "Logged in successfully",
        role: user.role,
        mustChangePassword: user.flags?.mustChangePassword ?? false, // ← NEW
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "An error occurred during login" });
  }
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ success: false, message: "Could not log out" });
    }
    res.clearCookie("connect.sid");
    res.status(200).json({ success: true, message: "Logged out successfully" });
  });
};

export const status = (req, res) => {
  if (req.session && req.session.userId) {

    console.log("Session data:", {
      userId: req.session.userId,
      role: req.session.role,
      mustChangePassword: req.session.mustChangePassword,
    });

    console.log(req.session)
    return res.status(200).json({
      success: true,
      authenticated: true,
      role: req.session.role,
      mustChangePassword: req.session.mustChangePassword ?? false, // ← NEW
    });
  }
  res.status(401).json({ success: false, authenticated: false });
};

// ── NEW: Change password endpoint ─────────────────────────────────────────────
export const changePassword = async (req, res) => {
  const userId = req.session.userId;
  const { currentPassword, newPassword } = req.body;

  if (!userId) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }
  if (!currentPassword) {
    return res.status(422).json({ success: false, message: "Current password is required" });
  }
  if (!newPassword) {
    return res.status(422).json({ success: false, message: "New password is required" });
  }
  if (newPassword.length < 6) {
    return res.status(422).json({ success: false, message: "New password must be at least 6 characters" });
  }
  if (newPassword.length > 128) {
    return res.status(422).json({ success: false, message: "New password cannot exceed 128 characters" });
  }
  if (currentPassword === newPassword) {
    return res.status(422).json({ success: false, message: "New password must be different from the current password" });
  }

  try {
    const User = (await import("../models/user.js")).default;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    user.password = newPassword;
    user.flags = { ...user.flags, mustChangePassword: false };
    await user.save();

    // Update session
    req.session.mustChangePassword = false;
    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: "Session update failed" });
      }
      res.status(200).json({ success: true, message: "Password changed successfully" });
    });
  } catch (error) {
    console.error("changePassword error:", error);
    res.status(500).json({ success: false, message: "Failed to change password" });
  }
};

// Add these two exports to backend/controllers/authController.js

export const getMe = async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }
  try {
    const User = (await import("../models/user.js")).default;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("getMe error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
};

export const updateMe = async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }

  const { firstName, lastName, phone } = req.body;

  // Validate
  if (firstName !== undefined) {
    if (!firstName.trim())
      return res
        .status(422)
        .json({ success: false, message: "First name cannot be empty" });
    if (firstName.trim().length < 2)
      return res
        .status(422)
        .json({ success: false, message: "First name must be at least 2 characters" });
    if (firstName.trim().length > 50)
      return res
        .status(422)
        .json({ success: false, message: "First name cannot exceed 50 characters" });
  }
  if (lastName !== undefined) {
    if (!lastName.trim())
      return res
        .status(422)
        .json({ success: false, message: "Last name cannot be empty" });
    if (lastName.trim().length < 2)
      return res
        .status(422)
        .json({ success: false, message: "Last name must be at least 2 characters" });
    if (lastName.trim().length > 50)
      return res
        .status(422)
        .json({ success: false, message: "Last name cannot exceed 50 characters" });
  }

  const PHONE_REGEX = /^\+?[\d\s\-\(\)]{7,20}$/;
  if (phone && phone.trim() && !PHONE_REGEX.test(phone.trim())) {
    return res
      .status(422)
      .json({ success: false, message: "Please enter a valid phone number" });
  }

  try {
    const User = (await import("../models/user.js")).default;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (firstName !== undefined) user.firstName = firstName.trim();
    if (lastName !== undefined) user.lastName = lastName.trim();
    if (phone !== undefined) user.phone = phone.trim();

    await user.save();

    const { password: _pw, ...safeUser } = user.toObject();
    res.status(200).json({ success: true, data: safeUser });
  } catch (error) {
    console.error("updateMe error:", error);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
};