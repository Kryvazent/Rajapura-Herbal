import mongoose from "mongoose";
import bcrypt from 'bcrypt';

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

    flags: {
      isEmailVerified: {
        type: Boolean,
        default: false
      }
    }
  },
  { timestamps: true }
);

userSchema.pre('save', async function() {

    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
      return;
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
        throw err;
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};


export default mongoose.model("User", userSchema);