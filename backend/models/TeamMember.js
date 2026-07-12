import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, default: "", maxlength: 600 },
  imageUrl: { type: String, default: "" },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("TeamMember", teamMemberSchema);
