import mongoose from "mongoose";
import { Schema } from "mongoose";
const textTranslations = { en: { type: String, trim: true }, si: { type: String, trim: true }, ta: { type: String, trim: true } };

const serviceItem = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  duration: String,
  icon: String,
  imageUrl: String,
  showInShowcase: { type: Boolean, default: false }
  ,translations: { name: textTranslations, description: textTranslations, duration: textTranslations }
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
    imageUrl: String,
    videoUrl: String,
    translations: { name: textTranslations, area: textTranslations, address: textTranslations, mapLabel: textTranslations, description: textTranslations },
    
    services: [serviceItem]
  },
  { 
    timestamps: true 
  }
);

service.index({ area: 1 });

export default mongoose.model("Service", service);
