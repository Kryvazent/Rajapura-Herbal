import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },

    lastName: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["ADMIN", "USER", "STAFF"],
      default: "USER",
      index: true
    },

    status: {
      type: String,
      enum: ["ACTIVE", "DISABLED"],
      default: "ACTIVE"
    },

    phone: String,

    address: {
      street: String,
      city: String,
      district: String,
      province: String
    },

    profileImage: String,

    auth: {
      provider: {
        type: String,
        enum: ["LOCAL", "GOOGLE"],
        default: "LOCAL"
      },
      lastLogin: Date
    },

    flags: {
      isEmailVerified: {
        type: Boolean,
        default: false
      },
      isBlocked: {
        type: Boolean,
        default: false
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);