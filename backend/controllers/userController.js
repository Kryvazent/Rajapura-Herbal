// backend/controllers/userController.js
// import * as userService from "../services/userService.js";

const DEFAULT_TEMP_PASSWORD = "Welcome@123";

const formatMongooseError = (error) => {
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((e) => e.message);
    return { status: 422, message: "Validation failed", errors };
  }
  if (error.code === 11000) {
    return { status: 409, message: "A user with this email already exists" };
  }
  return { status: 500, message: "Internal server error" };
};

export const getAllStaff = async (req, res) => {
  try {
    const users = await userService.getAllStaff();
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("getAllStaff error:", error);
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(422).json({ success: false, message: "User ID is required" });
  }
  try {
    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("getUserById error:", error);
    if (error.name === "CastError") {
      return res.status(422).json({ success: false, message: "Invalid user ID format" });
    }
    res.status(500).json({ success: false, message: "Error fetching user" });
  }
};

export const createUser = async (req, res) => {
  const { firstName, lastName, email, password, role, phone, status } = req.body;

  if (!firstName?.trim()) return res.status(422).json({ success: false, message: "First name is required" });
  if (!lastName?.trim()) return res.status(422).json({ success: false, message: "Last name is required" });
  if (!email?.trim()) return res.status(422).json({ success: false, message: "Email is required" });
  if (!["ADMIN", "STAFF"].includes(role)) return res.status(422).json({ success: false, message: "Role must be ADMIN or STAFF" });

  // Use provided password or fall back to default temp password
  const finalPassword = (password && password.trim().length >= 6)
    ? password.trim()
    : DEFAULT_TEMP_PASSWORD;

  // If no custom password was provided, user must change on first login
  const mustChangePassword = !password || password.trim().length < 6;

  try {
    const user = await userService.createUser({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password: finalPassword,
      role,
      phone: phone?.trim() || "",
      status: status || "ACTIVE",
      flags: {
        isEmailVerified: false,
        mustChangePassword,   // ← NEW
      },
    });

    const { password: _pw, ...safeUser } = user.toObject();
    res.status(201).json({
      success: true,
      data: safeUser,
      // Tell the frontend what temp password was set so admin can share it
      tempPassword: mustChangePassword ? DEFAULT_TEMP_PASSWORD : undefined,
    });
  } catch (error) {
    console.error("createUser error:", error);
    if (error.message === "EMAIL_EXISTS") {
      return res.status(409).json({ success: false, message: "A user with this email already exists" });
    }
    const { status: s, message, errors } = formatMongooseError(error);
    res.status(s).json({ success: false, message, errors });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(422).json({ success: false, message: "User ID is required" });

  const { firstName, lastName, email, password, role, phone, status } = req.body;

  if (firstName !== undefined && !firstName.trim()) {
    return res.status(422).json({ success: false, message: "First name cannot be empty" });
  }
  if (lastName !== undefined && !lastName.trim()) {
    return res.status(422).json({ success: false, message: "Last name cannot be empty" });
  }
  if (email !== undefined && !email.trim()) {
    return res.status(422).json({ success: false, message: "Email cannot be empty" });
  }
  if (password && password.trim().length > 0 && password.length < 6) {
    return res.status(422).json({ success: false, message: "Password must be at least 6 characters" });
  }
  if (role && !["ADMIN", "STAFF"].includes(role)) {
    return res.status(422).json({ success: false, message: "Role must be ADMIN or STAFF" });
  }

  try {
    const updated = await userService.updateUser(id, {
      ...(firstName && { firstName: firstName.trim() }),
      ...(lastName && { lastName: lastName.trim() }),
      ...(email && { email: email.trim().toLowerCase() }),
      ...(password && password.trim() && { password }),
      ...(role && { role }),
      ...(phone !== undefined && { phone: phone.trim() }),
      ...(status && { status }),
    });

    const { password: _pw, ...safeUser } = updated.toObject();
    res.status(200).json({ success: true, data: safeUser });
  } catch (error) {
    console.error("updateUser error:", error);
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (error.message === "EMAIL_EXISTS") {
      return res.status(409).json({ success: false, message: "A user with this email already exists" });
    }
    if (error.name === "CastError") {
      return res.status(422).json({ success: false, message: "Invalid user ID format" });
    }
    const { status: s, message, errors } = formatMongooseError(error);
    res.status(s).json({ success: false, message, errors });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (id === req.session.userId?.toString()) {
    return res.status(403).json({ success: false, message: "You cannot delete your own account" });
  }
  try {
    await userService.deleteUser(id);
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("deleteUser error:", error);
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (error.name === "CastError") {
      return res.status(422).json({ success: false, message: "Invalid user ID format" });
    }
    res.status(500).json({ success: false, message: "Error deleting user" });
  }
};

export const toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  if (id === req.session.userId?.toString()) {
    return res.status(403).json({ success: false, message: "You cannot disable your own account" });
  }
  try {
    const updated = await userService.toggleUserStatus(id);
    const { password: _pw, ...safeUser } = updated.toObject();
    res.status(200).json({ success: true, data: safeUser });
  } catch (error) {
    console.error("toggleUserStatus error:", error);
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(500).json({ success: false, message: "Error updating user status" });
  }
};

export const searchUsers = async (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) {
    return res.status(422).json({ success: false, message: "Search query is required" });
  }
  try {
    const users = await userService.searchUsers(q.trim());
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("searchUsers error:", error);
    res.status(500).json({ success: false, message: "Error searching users" });
  }
};