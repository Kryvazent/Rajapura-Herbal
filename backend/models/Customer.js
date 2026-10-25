import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  contactNumber: { type: String, required: true, trim: true },
  country: { type: String, required: true, trim: true },
}, { timestamps: true });

export default mongoose.model("Customer", customerSchema);
