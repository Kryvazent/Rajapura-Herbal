import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  country: { type: String, required: true, trim: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  customerName: { type: String, required: true, trim: true },
  contactNumber: { type: String, required: true, trim: true },
  products: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, name: { type: String, required: true }, qty: { type: Number, min: 1, required: true }, price: { type: Number, min: 0, required: true } }],
  address: { type: String, required: true, trim: true },
  orderStatus: { type: String, enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"], default: "Pending" },
  paymentStatus: { type: String, enum: ["Unpaid", "Paid", "Refunded"], default: "Unpaid" },
  paymentMethod: { type: String, default: "Not selected" },
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
