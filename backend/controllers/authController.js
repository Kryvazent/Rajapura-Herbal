import * as authService from "../services/authService.js";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import CustomerEmailVerification from "../models/CustomerEmailVerification.js";
import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { sendCustomerRegistrationOtp } from "../services/gmailService.js";

const destroySession = (req) => {
  req.session?.destroy((err) => {
    if (err) console.error("Session destroy error:", err);
  });
};

const loginWithAllowedRoles = async (req, res, allowedRoles) => {
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

    const isMatch = await user.comparePassword(password);
    // const isMatch = true; // For testing purposes, bypass password check. Remove this line in production.
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ success: false, message: "This account belongs to a different sign-in portal." });
    }

    req.session.regenerate((regenErr) => {
      if (regenErr) {
        console.error("Session regenerate error:", regenErr);
        return res.status(500).json({ success: false, message: "Session setup failed" });
      }

      req.session.role = user.role;
      req.session.userId = user._id;
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
          mustChangePassword: user.flags?.mustChangePassword ?? false,
        });
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "An error occurred during login" });
  }
};

export const loginAdmin = (req, res) =>
  loginWithAllowedRoles(req, res, ["ADMIN", "STAFF"]);

export const loginCustomer = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(422).json({ success: false, message: "Username and password are required" });
  }

  try {
    const customer = await Customer.findOne({ email: username.trim().toLowerCase() });
    if (!customer || !(await customer.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    if (customer.status !== "ACTIVE") {
      return res.status(403).json({ success: false, message: "Your account has been disabled. Contact support." });
    }

    req.session.regenerate((regenErr) => {
      if (regenErr) {
        console.error("Customer login session error:", regenErr);
        return res.status(500).json({ success: false, message: "Session setup failed" });
      }
      req.session.role = "USER";
      req.session.userId = customer._id;
      req.session.mustChangePassword = customer.mustChangePassword;
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error("Customer login session save error:", saveErr);
          return res.status(500).json({ success: false, message: "Session save failed" });
        }
        res.status(200).json({
          success: true,
          message: "Logged in successfully",
          role: "USER",
          mustChangePassword: customer.mustChangePassword,
        });
      });
    });
  } catch (error) {
    console.error("Customer login error:", error);
    res.status(500).json({ success: false, message: "An error occurred during login" });
  }
};

const hashRegistrationOtp = (salt, code) => createHash("sha256").update(`${salt}:${code}`).digest("hex");

export const sendCustomerRegistrationCode = async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const normalizedEmail = String(req.body?.email ?? "").trim().toLowerCase();
  if (name.length < 2 || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return res.status(422).json({ success: false, message: "Enter a valid name and email address" });
  }

  try {
    if (await Customer.exists({ email: normalizedEmail })) {
      return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }
    const existing = await CustomerEmailVerification.findOne({ email: normalizedEmail });
    if (existing && Date.now() - existing.lastSentAt.getTime() < 60_000) {
      return res.status(429).json({ success: false, message: "Please wait a minute before requesting another code" });
    }

    const otp = String(randomInt(100000, 1000000));
    const salt = randomBytes(16).toString("hex");
    const verification = await CustomerEmailVerification.findOneAndUpdate(
      { email: normalizedEmail },
      { $set: { codeHash: hashRegistrationOtp(salt, otp), salt, expiresAt: new Date(Date.now() + 10 * 60_000), lastSentAt: new Date(), attempts: 0 } },
      { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true },
    );
    const emailResult = await sendCustomerRegistrationOtp(normalizedEmail, name, otp);
    if (!emailResult.success) {
      await CustomerEmailVerification.deleteOne({ _id: verification._id });
      console.error("Customer registration OTP email failed:", emailResult.reason);
      return res.status(503).json({ success: false, message: "We could not send the verification email. Please try again later." });
    }
    return res.status(200).json({ success: true, message: "Verification code sent to your email" });
  } catch (error) {
    console.error("sendCustomerRegistrationCode error:", error);
    return res.status(500).json({ success: false, message: "Unable to send a verification code" });
  }
};

export const registerCustomer = async (req, res) => {
  const { name, email, password, otp } = req.body;
  const normalizedEmail = String(email ?? "").trim().toLowerCase();

  try {
    const verification = await CustomerEmailVerification.findOne({ email: normalizedEmail });
    if (!verification || verification.expiresAt <= new Date()) {
      if (verification) await CustomerEmailVerification.deleteOne({ _id: verification._id });
      return res.status(400).json({ success: false, message: "Your verification code expired. Request a new one." });
    }
    if (verification.attempts >= 5) {
      await CustomerEmailVerification.deleteOne({ _id: verification._id });
      return res.status(429).json({ success: false, message: "Too many incorrect codes. Request a new verification code." });
    }
    const submittedHash = hashRegistrationOtp(verification.salt, String(otp ?? ""));
    const expectedHash = Buffer.from(verification.codeHash, "hex");
    const actualHash = Buffer.from(submittedHash, "hex");
    if (expectedHash.length !== actualHash.length || !timingSafeEqual(expectedHash, actualHash)) {
      const attempt = await CustomerEmailVerification.findOneAndUpdate(
        { _id: verification._id, attempts: { $lt: 5 } },
        { $inc: { attempts: 1 } },
      );
      if (!attempt) return res.status(429).json({ success: false, message: "Too many incorrect codes. Request a new verification code." });
      return res.status(400).json({ success: false, message: "The verification code is incorrect" });
    }
    const consumed = await CustomerEmailVerification.deleteOne({ _id: verification._id, codeHash: verification.codeHash });
    if (consumed.deletedCount !== 1) return res.status(400).json({ success: false, message: "This verification code has already been used. Request a new one." });

    // Older customer migrations left a unique index on the removed `user` field.
    // MongoDB treats missing values as duplicates under that index, so it can
    // reject every new customer and incorrectly look like an email conflict.
    const customerIndexes = await Customer.collection.indexes().catch((indexError) => {
      if (indexError.code === 26 || indexError.codeName === "NamespaceNotFound") return [];
      throw indexError;
    });
    if (customerIndexes.some((index) => index.name === "user_1")) {
      await Customer.collection.dropIndex("user_1");
    }

    const customer = await Customer.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
    });

    req.session.regenerate((regenerateError) => {
      if (regenerateError) {
        console.error("Customer registration session error:", regenerateError);
        return res.status(500).json({ success: false, message: "Account created, but sign in failed. Please sign in." });
      }

      req.session.userId = customer._id;
      req.session.role = "USER";
      req.session.mustChangePassword = false;
      req.session.save((saveError) => {
        if (saveError) {
          console.error("Customer registration session save error:", saveError);
          return res.status(500).json({ success: false, message: "Account created, but sign in failed. Please sign in." });
        }
        res.status(201).json({
          success: true,
          message: "Customer account created",
          role: "USER",
          data: { _id: customer._id, name: customer.name, email: customer.email },
        });
      });
    });
  } catch (error) {
    if (error.code === 11000 && (error.keyPattern?.email || error.keyValue?.email || /email_1/.test(error.message ?? ""))) {
      return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }
    if (error.name === "ValidationError") {
      return res.status(422).json({ success: false, message: Object.values(error.errors).map((item) => item.message).join(". ") });
    }
    console.error("Customer registration error:", error);
    res.status(500).json({ success: false, message: "Unable to create your account" });
  }
};

export const logout = (req, res) => {
  const sessionCookie = req.session?.cookie;
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ success: false, message: "Could not log out" });
    }
    const isHosted = Boolean(
      process.env.NODE_ENV === "production" ||
      process.env.VERCEL ||
      process.env.RAILWAY_ENVIRONMENT ||
      process.env.RAILWAY_PUBLIC_DOMAIN ||
      process.env.RAILWAY_STATIC_URL
    );
    res.clearCookie(req.portalSessionCookieName || "connect.sid", {
      path: sessionCookie?.path || "/",
      httpOnly: true,
      secure: sessionCookie?.secure ?? isHosted,
      sameSite: sessionCookie?.sameSite ?? (isHosted ? "none" : "lax"),
    });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  });
};

export const status = async (req, res) => {
  if (!req.session?.userId) {
    return res.status(200).json({ success: true, authenticated: false });
  }

  try {
    if (req.portal === "customer" || req.session.role === "USER") {
      const customer = await Customer.findById(req.session.userId).select("status mustChangePassword");
      if (!customer || customer.status !== "ACTIVE") {
        destroySession(req);
        return res.status(200).json({ success: true, authenticated: false });
      }
      req.session.role = "USER";
      req.session.mustChangePassword = customer.mustChangePassword;
      return res.status(200).json({
        success: true,
        authenticated: true,
        role: "USER",
        mustChangePassword: customer.mustChangePassword,
      });
    }

    const user = await User.findById(req.session.userId).select("role status flags");
    if (!user || user.status !== "ACTIVE" || !["ADMIN", "STAFF"].includes(user.role)) {
      destroySession(req);
      return res.status(200).json({ success: true, authenticated: false });
    }

    req.session.role = user.role;
    req.session.mustChangePassword = user.flags?.mustChangePassword ?? false;
    return res.status(200).json({
      success: true,
      authenticated: true,
      role: user.role,
      mustChangePassword: user.flags?.mustChangePassword ?? false,
    });
  } catch (error) {
    console.error("status error:", error);
    return res.status(500).json({ success: false, authenticated: false });
  }
};


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
    const isCustomer = req.portal === "customer" || req.session.role === "USER";
    const account = isCustomer ? await Customer.findById(userId) : await User.findById(userId);
    if (!account) return res.status(404).json({ success: false, message: "Account not found" });
    const permittedRoles = isCustomer ? account.status === "ACTIVE" : account.status === "ACTIVE" && ["ADMIN", "STAFF"].includes(account.role);
    if (!permittedRoles) {
      destroySession(req);
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const isMatch = await account.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }

    account.password = newPassword;
    if (isCustomer) account.mustChangePassword = false;
    else account.flags = { ...account.flags, mustChangePassword: false };
    await account.save();

    
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



export const getMe = async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Not logged in" });
  }
  try {
    if (req.portal === "customer" || req.session.role === "USER") {
      const customer = await Customer.findById(userId).select("-password");
      if (!customer || customer.status !== "ACTIVE") {
        destroySession(req);
        return res.status(403).json({ success: false, message: "Access denied" });
      }
      req.session.role = "USER";
      const [firstName = "", ...lastNameParts] = customer.name.split(/\s+/);
      return res.status(200).json({
        success: true,
        data: {
          ...customer.toObject(),
          role: "USER",
          firstName,
          lastName: lastNameParts.join(" "),
          phone: customer.contactNumber,
        },
      });
    }
    const user = await User.findById(userId).select("-password");
    if (!user || user.status !== "ACTIVE" || !["ADMIN", "STAFF"].includes(user.role)) {
      destroySession(req);
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    req.session.role = user.role;
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
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.status !== "ACTIVE" || !["ADMIN", "STAFF"].includes(user.role)) {
      destroySession(req);
      return res.status(403).json({ success: false, message: "Access denied" });
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
