import mongoose from "mongoose";

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Shop name is required"],
    trim: true,
    maxlength: [100, "Shop name cannot exceed 100 characters"],
  },
  address: {
    type: String,
    required: [true, "Shop address is required"],
    trim: true,
    maxlength: [200, "Address cannot exceed 200 characters"],
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
    match: [/^\+?[\d\s\-\(\)]{7,20}$/, "Please enter a valid phone number"],
  },
  hours: {
    type: String,
    required: [true, "Opening hours are required"],
    trim: true,
    maxlength: [100, "Hours cannot exceed 100 characters"],
  },
  type: {
    type: String,
    required: [true, "Shop type is required"],
    enum: {
      values: ["Pharmacy", "Ayurvedic Store", "Health Center", "Supermarket"],
      message: "Invalid shop type",
    },
  },
});

const townSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Town name is required"],
    trim: true,
    maxlength: [60, "Town name cannot exceed 60 characters"],
  },
  shops: [storeSchema],
});

const districtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "District name is required"],
    trim: true,
    maxlength: [60, "District name cannot exceed 60 characters"],
  },
  towns: [townSchema],
});

const provinceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Province name is required"],
      trim: true,
      unique: true,
      maxlength: [50, "Province name cannot exceed 50 characters"],
    },
    icon: {
      type: String,
      required: [true, "Province icon is required"],
      trim: true,
    },
    districts: [districtSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Shop", provinceSchema);