import mongoose, { Mongoose, Schema } from "mongoose";

const storeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  hours: { type: String, required: true },
  type: {
    type: String,
    enum: ["Pharmacy", "Ayurvedic Store", "Health Center", "Supermarket"],
    required: true
  }
});

const townSchema = new mongoose.Schema({
  name: { type: String, required: true },
  shops: [storeSchema]
});

const districtSchema = new mongoose.Schema({
  name: { type: String, required: true },
  towns: [townSchema]
});

const provinceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    icon: { type: String, required: true },
    districts: [districtSchema]
  },
  { timestamps: true }
);

const ShopSchema = new mongoose.Schema({
  provinces: [provinceSchema]
})

export default mongoose.model("Shop", ShopSchema);
