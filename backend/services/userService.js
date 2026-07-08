import User from "../models/User.js";

export const getAllStaff = async () => {
  return await User.find({ role: { $in: ["ADMIN", "STAFF"] } })
    .select("-password")
    .sort({ createdAt: -1 });
};

export const getUserById = async (id) => {
  return await User.findById(id).select("-password");
};

export const createUser = async (userData) => {
  const existing = await User.findOne({ email: userData.email.toLowerCase() });
  if (existing) {
    throw new Error("EMAIL_EXISTS");
  }
  const newUser = new User(userData);
  return await newUser.save();
};

export const updateUser = async (id, userData) => {
  const user = await User.findById(id);
  if (!user) throw new Error("USER_NOT_FOUND");

  
  if (userData.email && userData.email.toLowerCase() !== user.email) {
    const existing = await User.findOne({
      email: userData.email.toLowerCase(),
      _id: { $ne: id },
    });
    if (existing) throw new Error("EMAIL_EXISTS");
  }

  
  if (!userData.password || userData.password.trim() === "") {
    delete userData.password;
  }

  Object.assign(user, userData);
  return await user.save();
};

export const deleteUser = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new Error("USER_NOT_FOUND");
  return await User.findByIdAndDelete(id);
};

export const toggleUserStatus = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new Error("USER_NOT_FOUND");
  user.status = user.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
  return await user.save();
};

export const searchUsers = async (query) => {
  const regex = new RegExp(query, "i");
  return await User.find({
    role: { $in: ["ADMIN", "STAFF"] },
    $or: [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
    ],
  }).select("-password");
};
