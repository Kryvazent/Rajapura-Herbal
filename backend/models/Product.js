import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Name too short"],
      maxlength: [100, "Name too long"],
    },
    sinhalaName: {
      type: String,
      required: [true, "Sinhala name is required"],
      trim: true,
      minlength: [2, "Sinhala name too short"],
      maxlength: [100, "Sinhala name too long"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [50],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000],
    },
    benefits: [{ type: String, maxlength: 200 }],
    ingredients: [{ type: String, maxlength: 200 }],
    howToUse: [{ type: String, maxlength: 500 }],
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    image: {
      type: String,
      required: [true, "Image is required"],
      match: [
        /(http[s]?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i,
        "Please provide a valid image URL",
      ],
    },
    badge: {
      type: String,
      enum: {
        values: ["Bestseller", "Premium", "New", "Organic"],
        message: "Invalid badge type",
      },
    },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", category: "text" });

export default mongoose.model("Product", productSchema);