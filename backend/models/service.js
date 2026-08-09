import mongoose from "mongoose";
const textTranslations = {
  en: { type: String, trim: true, default: "" },
  si: { type: String, trim: true, default: "" },
  ta: { type: String, trim: true, default: "" },
};

const serviceItem = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, trim: true, default: "" },
  duration: { type: String, trim: true, default: "" },
  icon: { type: String, trim: true, default: "" },
  imageUrl: { type: String, trim: true, default: "" },
  showInShowcase: { type: Boolean, default: false },
  translations: { name: textTranslations, description: textTranslations, duration: textTranslations },
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
    mapLabel: { type: String, trim: true, default: "" },
    icon: { type: String, trim: true, default: "" },
    color: { type: String, trim: true, default: "#2D5016" },
    lightColor: { type: String, trim: true, default: "rgba(45,80,22,0.08)" },
    borderColor: { type: String, trim: true, default: "rgba(45,80,22,0.2)" },
    description: { type: String, trim: true, default: "" },
    imageUrl: { type: String, trim: true, default: "" },
    videoUrl: { type: String, trim: true, default: "" },
    translations: { name: textTranslations, area: textTranslations, address: textTranslations, mapLabel: textTranslations, description: textTranslations },
    
    services: [serviceItem],
  },
  { 
    timestamps: true 
  }
);

service.index({ area: 1 });

export default mongoose.model("Service", service);
