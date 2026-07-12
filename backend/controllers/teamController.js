import TeamMember from "../models/TeamMember.js";

export const getTeam = async (_req, res) => {
  try {
    const data = await TeamMember.find({}).sort({ displayOrder: 1, createdAt: 1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load team members" });
  }
};

export const createTeamMember = async (req, res) => {
  try {
    const member = await TeamMember.create(req.body);
    res.status(201).json({ success: true, data: member });
  } catch (error) {
    res.status(422).json({ success: false, message: error.message });
  }
};

export const updateTeamMember = async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!member) return res.status(404).json({ success: false, message: "Team member not found" });
    res.status(200).json({ success: true, data: member });
  } catch (error) {
    res.status(422).json({ success: false, message: error.message });
  }
};

export const deleteTeamMember = async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: "Team member not found" });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(422).json({ success: false, message: error.message });
  }
};
