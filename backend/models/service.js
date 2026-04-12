import mongoose from "mongoose";
import { Schema } from "mongoose";

const serviceItem = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  duration: String,
  icon: String
});

const service = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    area: String,
    address: String,
    mobile: String,
    altMobile: String,
    mapLabel: String,
    icon: String,
    color: String,
    lightColor: String,
    borderColor: String,
    description: String,
    
    services: [serviceItem]
  },
  { 
    timestamps: true 
  }
);

service.index({ area: 1 });

export default mongoose.model("Service", service);
