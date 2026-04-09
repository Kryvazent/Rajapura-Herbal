import mongoose from "mongoose";

const serviceItemSchema = new mongoose.Schema(
  {
    serviceId: Number,

    name: {
      type: String,
      required: true
    },

    description: String,

    duration: String,

    icon: String
  },
  { _id: false }
);

const serviceLocationSchema = new mongoose.Schema(
  {
    locationId: {
      type: Number,
      required: true,
      unique: true
    },

    name: {
      type: String,
      required: true
    },

    area: String,

    address: String,

    contact: {
      mobile: String,
      altMobile: String
    },

    mapLabel: String,

    ui: {
      icon: String,
      color: String,
      lightColor: String,
      borderColor: String
    },

    description: String,

    services: {
      type: [serviceItemSchema],
      default: []
    }
  },
  { timestamps: true }
);

export default mongoose.model("ServiceLocation", serviceLocationSchema);