import mongoose from "mongoose";
const textTranslations = { en: { type: String, trim: true }, si: { type: String, trim: true }, ta: { type: String, trim: true } };

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, default: "", maxlength: 600 },
  imageUrl: { type: String, default: "" },
  displayOrder: { type: Number, default: 0 },
  translations: { name: textTranslations, title: textTranslations, description: textTranslations },
}, { timestamps: true });

export default mongoose.model("TeamMember", teamMemberSchema);
