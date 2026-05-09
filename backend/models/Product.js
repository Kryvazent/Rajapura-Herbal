import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    sinhalaName: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true,
      index: true
    },

    description: {
      type: String,
      required: true
    },

    benefits: {
      type: [String],
      default: []
    },

    ingredients: {
      type: [String],
      default: []
    },

    howToUse: {
      type: [String],
      default: []
    },

    price: {
      type: String,
      required: true
    },

    image: {
      type: String,
      required: true
    },

    badge: {
      type: String,
      enum: ["Bestseller", "Premium", "New", "Organic", null],
      default: null
    }
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text" });

export default mongoose.model("Product", productSchema);