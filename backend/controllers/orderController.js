import Order from "../models/Order.js";

export const listOrders = async (_req, res) => {
  try { res.json({ success: true, data: await Order.find().sort({ createdAt: -1 }).populate("customer", "firstName lastName email") }); }
  catch (error) { console.error("listOrders error:", error); res.status(500).json({ success: false, message: "Unable to load orders" }); }
};

export const updateOrder = async (req, res) => {
  const allowed = ["orderStatus", "paymentStatus", "paymentMethod"];
  const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, data: order });
  } catch (error) { res.status(422).json({ success: false, message: "Invalid order update" }); }
};
