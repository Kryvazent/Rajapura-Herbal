import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
  {
    shopId: {
      type: Number,
      required: true,
      unique: true
    },

    name: {
      type: String,
      required: true
    },

    location: {
      province: {
        type: String,
        index: true
      },
      district: {
        type: String,
        index: true
      },
      town: String
    },

    address: String,

    phone: String,

    hours: String,

    type: {
      type: String,
      enum: ["Pharmacy", "Ayurvedic Store", "Health Center", "Supermarket"],
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Shop", shopSchema);