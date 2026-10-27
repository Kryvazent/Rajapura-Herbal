import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  country: { type: String, required: true, trim: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  products: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, name: { type: String, required: true }, qty: { type: Number, min: 1, required: true }, price: { type: Number, min: 0, required: true } }],
  address: { type: String, required: true, trim: true },
  additionalNote: { type: String, trim: true, maxlength: 1000, default: "" },
  paymentSlipUrl: { type: String, trim: true, default: "" },
  paymentSlipFileName: { type: String, trim: true, default: "" },
  orderStatus: { type: String, enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"], default: "Pending" },
  paymentStatus: { type: String, enum: ["Unpaid", "Paid", "Refunded", "Processing"], default: "Processing" },
  paymentMethod: { type: String, default: "Not selected" },
  currency: { type: String, enum: ["USD", "LKR"], default: "USD" },
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
