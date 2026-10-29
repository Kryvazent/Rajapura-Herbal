import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  qty: { type: Number, min: 1, required: true },
}, { _id: false });

const cartSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true, unique: true, index: true },
  items: { type: [cartItemSchema], default: [] },
}, { timestamps: true });

export default mongoose.model("Cart", cartSchema);
