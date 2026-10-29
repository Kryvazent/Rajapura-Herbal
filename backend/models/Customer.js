import mongoose from "mongoose";
import bcrypt from "bcrypt";

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  status: { type: String, enum: ["ACTIVE", "DISABLED"], default: "ACTIVE" },
  mustChangePassword: { type: Boolean, default: false },
  contactNumber: { type: String, trim: true, default: "" },
  country: { type: String, trim: true, default: "" },
  address: { type: String, trim: true, default: "" },
}, { timestamps: true });

customerSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: "string" } } },
);

customerSchema.pre("save", async function() {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

customerSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("Customer", customerSchema);
