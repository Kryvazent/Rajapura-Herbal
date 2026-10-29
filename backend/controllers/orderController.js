import Order from "../models/Order.js";
import User from "../models/User.js";
import Cart from "../models/Cart.js";
import mongoose from "mongoose";

export const getCheckoutDetails = async (req, res) => {
  if (req.session?.role !== "USER") return res.status(403).json({ success: false, message: "Customer account required" });
  try {
    const [user, latestOrder] = await Promise.all([
      User.findById(req.session.userId).select("firstName lastName phone country address"),
      Order.findOne({ customer: req.session.userId }).sort({ createdAt: -1 }).select("country contactNumber address"),
    ]);
    if (!user) return res.status(404).json({ success: false, message: "Customer account not found" });
    const profileAddress = typeof user.address === "string" ? user.address : [user.address?.street, user.address?.city, user.address?.district, user.address?.province].filter(Boolean).join(", ");
    res.json({ success: true, data: {
      customerName: [user.firstName, user.lastName].filter(Boolean).join(" "),
      address: latestOrder?.address || profileAddress,
      country: latestOrder?.country || user.country || "",
      contactNumber: latestOrder?.contactNumber || user.phone || "",
    }});
  } catch (error) {
    console.error("getCheckoutDetails error:", error);
    res.status(500).json({ success: false, message: "Unable to load saved delivery details" });
  }
};

export const createCustomerOrder = async (req, res) => {
  if (req.session?.role !== "USER") return res.status(403).json({ success: false, message: "Customer account required" });
  const { address, country, contactNumber, additionalNote = "", paymentMethod, paymentSlipUrl = "", productIds } = req.body ?? {};
  if (![address, country, contactNumber].every((value) => typeof value === "string" && value.trim())) {
    return res.status(422).json({ success: false, message: "Address, country, and contact number are required" });
  }
  if (!["Payment slip", "Online payment"].includes(paymentMethod)) return res.status(422).json({ success: false, message: "Choose a valid payment method" });
  if (paymentMethod === "Payment slip" && (typeof paymentSlipUrl !== "string" || !paymentSlipUrl.trim())) {
    return res.status(422).json({ success: false, message: "Upload your payment slip to continue" });
  }
  if (!Array.isArray(productIds) || productIds.length === 0 || productIds.length > 100 || productIds.some((id) => !mongoose.isValidObjectId(id))) {
    return res.status(422).json({ success: false, message: "Select at least one valid item for checkout" });
  }
  if (typeof additionalNote !== "string" || additionalNote.length > 1000) return res.status(422).json({ success: false, message: "Additional note cannot exceed 1000 characters" });

  try {
    const [user, cart] = await Promise.all([
      User.findById(req.session.userId),
      Cart.findOne({ customer: req.session.userId }).populate("items.product"),
    ]);
    if (!user || user.role !== "USER" || user.status !== "ACTIVE") return res.status(401).json({ success: false, message: "Customer account is not available" });
    const cartItems = (cart?.items ?? []).filter((item) => item.product);
    const requestedIds = new Set(productIds.map(String));
    const selectedCartItems = cartItems.filter((item) => requestedIds.has(item.product._id.toString()));
    if (!selectedCartItems.length || selectedCartItems.length !== requestedIds.size) {
      return res.status(422).json({ success: false, message: "One or more selected items are no longer in your cart" });
    }

    const products = selectedCartItems.map(({ product, qty }) => {
      const rawPrice = product.priceUSD || (product.price?.startsWith("USD ") ? product.price : "");
      const price = Number(String(rawPrice).replace(/USD\s*/i, "").replace(/,/g, "").trim());
      return { product: product._id, name: product.name, qty, price: Number.isFinite(price) ? price : 0 };
    });
    user.phone = contactNumber.trim();
    user.country = country.trim();
    user.address = { ...(user.address?.toObject?.() ?? user.address ?? {}), street: address.trim() };
    await user.save();

    const order = await Order.create({
      customer: user._id,
      customerName: [user.firstName, user.lastName].filter(Boolean).join(" "),
      country: country.trim(),
      contactNumber: contactNumber.trim(),
      address: address.trim(),
      additionalNote: additionalNote.trim(),
      products,
      paymentMethod,
      paymentSlipUrl: paymentSlipUrl.trim(),
    });
    const remainingCartItems = cartItems.filter((item) => !requestedIds.has(item.product._id.toString()));
    await Cart.updateOne({ customer: user._id }, { $set: { items: remainingCartItems.map((item) => ({ product: item.product._id, qty: item.qty })) } });
    res.status(201).json({ success: true, data: order, message: "Order placed successfully" });
  } catch (error) {
    console.error("createCustomerOrder error:", error);
    res.status(500).json({ success: false, message: "Unable to place your order" });
  }
};

export const listCustomerOrders = async (req, res) => {
  if (req.session?.role !== "USER") {
    return res.status(403).json({ success: false, message: "Customer account required" });
  }
  try {
    const orders = await Order.find({ customer: req.session.userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("listCustomerOrders error:", error);
    res.status(500).json({ success: false, message: "Unable to load your orders" });
  }
};

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
