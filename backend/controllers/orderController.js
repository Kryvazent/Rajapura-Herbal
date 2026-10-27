import Order from "../models/Order.js";
import Customer from "../models/Customer.js";
import Cart from "../models/Cart.js";
import mongoose from "mongoose";
import { sendOrderNotifications, sendOrderStatusNotification } from "../services/gmailService.js";

export const getCheckoutDetails = async (req, res) => {
  if (req.session?.role !== "USER") return res.status(403).json({ success: false, message: "Customer account required" });
  try {
    const [customer, latestOrder] = await Promise.all([
      Customer.findById(req.session.userId),
      Order.findOne({ customer: req.session.userId }).sort({ createdAt: -1 }).select("country address"),
    ]);
    if (!customer || customer.status !== "ACTIVE") return res.status(404).json({ success: false, message: "Customer account not found" });
    res.json({ success: true, data: {
      customerName: customer.name,
      address: customer.address || latestOrder?.address || "",
      country: customer.country || latestOrder?.country || "",
      contactNumber: customer.contactNumber,
    }});
  } catch (error) {
    console.error("getCheckoutDetails error:", error);
    res.status(500).json({ success: false, message: "Unable to load saved delivery details" });
  }
};

export const createCustomerOrder = async (req, res) => {
  if (req.session?.role !== "USER") return res.status(403).json({ success: false, message: "Customer account required" });
  const { orderId, paymentSlipFileName = "", address, country, contactNumber, additionalNote = "", paymentMethod, paymentSlipUrl = "", productIds } = req.body ?? {};
  const requestedCurrency = req.body?.currency;
  if (requestedCurrency !== undefined && !["USD", "LKR"].includes(requestedCurrency)) return res.status(422).json({ success: false, message: "Choose a valid order currency" });
  if (![address, country, contactNumber].every((value) => typeof value === "string" && value.trim())) {
    return res.status(422).json({ success: false, message: "Address, country, and contact number are required" });
  }
  if (!["Payment slip", "Online payment"].includes(paymentMethod)) return res.status(422).json({ success: false, message: "Choose a valid payment method" });
  if (paymentMethod === "Payment slip" && (typeof paymentSlipUrl !== "string" || !paymentSlipUrl.trim())) {
    return res.status(422).json({ success: false, message: "Upload your payment slip to continue" });
  }
  if (orderId !== undefined && !mongoose.isValidObjectId(orderId)) return res.status(422).json({ success: false, message: "Invalid order ID" });
  if (paymentMethod === "Payment slip" && (
    !orderId
    ||
    typeof paymentSlipFileName !== "string"
    || !new RegExp(`^${orderId}\\.[a-z0-9]{1,8}$`, "i").test(paymentSlipFileName)
  )) {
    return res.status(422).json({ success: false, message: "Payment slip filename must match the order ID" });
  }
  if (!Array.isArray(productIds) || productIds.length === 0 || productIds.length > 100 || productIds.some((id) => !mongoose.isValidObjectId(id))) {
    return res.status(422).json({ success: false, message: "Select at least one valid item for checkout" });
  }
  if (typeof additionalNote !== "string" || additionalNote.length > 1000) return res.status(422).json({ success: false, message: "Additional note cannot exceed 1000 characters" });

  try {
    const [customer, cart] = await Promise.all([
      Customer.findById(req.session.userId),
      Cart.findOne({ customer: req.session.userId }).populate("items.product"),
    ]);
    if (!customer || customer.status !== "ACTIVE") return res.status(401).json({ success: false, message: "Customer account is not available" });
    const cartItems = (cart?.items ?? []).filter((item) => item.product);
    const requestedIds = new Set(productIds.map(String));
    const selectedCartItems = cartItems.filter((item) => requestedIds.has(item.product._id.toString()));
    if (!selectedCartItems.length || selectedCartItems.length !== requestedIds.size) {
      return res.status(422).json({ success: false, message: "One or more selected items are no longer in your cart" });
    }

    // Currency follows the customer's shopping market, not the delivery destination.
    // Older clients may omit it, so retain the previous country-based fallback.
    const isSriLankaOrder = /^(LK|Sri Lanka)$/i.test(country.trim());
    const currency = requestedCurrency ?? (isSriLankaOrder ? "LKR" : "USD");
    const products = selectedCartItems.map(({ product, qty }) => {
      const legacyPriceMatchesCurrency = new RegExp(`^${currency}\\s`, "i").test(product.price || "");
      const rawPrice = currency === "LKR"
        ? product.priceLKR || (legacyPriceMatchesCurrency ? product.price : "")
        : product.priceUSD || (legacyPriceMatchesCurrency ? product.price : "");
      const price = Number(String(rawPrice).replace(/^(USD|LKR)\s*/i, "").replace(/,/g, "").trim());
      return { product: product._id, name: product.name, qty, price: Number.isFinite(price) ? price : 0 };
    });
    const customerUpdate = await Customer.updateOne(
      { _id: customer._id, status: "ACTIVE" },
      { $set: {
        contactNumber: contactNumber.trim(),
        country: country.trim(),
        address: address.trim(),
      } },
      { runValidators: true },
    );
    if (customerUpdate.matchedCount !== 1) {
      return res.status(401).json({ success: false, message: "Customer account is not available" });
    }

    const order = await Order.create({
      ...(orderId && { _id: orderId }),
      customer: customer._id,
      country: country.trim(),
      address: address.trim(),
      additionalNote: additionalNote.trim(),
      products,
      paymentMethod,
      currency,
      paymentSlipUrl: paymentSlipUrl.trim(),
      paymentSlipFileName: paymentSlipFileName.trim(),
    });
    const remainingCartItems = cartItems.filter((item) => !requestedIds.has(item.product._id.toString()));
    await Cart.updateOne({ customer: customer._id }, { $set: { items: remainingCartItems.map((item) => ({ product: item.product._id, qty: item.qty })) } });
    const emailResult = await sendOrderNotifications(order, customer, contactNumber.trim());
    if (emailResult.failures.length) console.error(`Order ${order._id} email delivery failed:`, emailResult.failures);
    res.status(201).json({ success: true, data: order, message: "Order placed successfully" });
  } catch (error) {
    console.error("createCustomerOrder error:", error);
    res.status(500).json({ success: false, message: "Unable to place your order" });
  }
};

export const prepareCustomerOrder = async (req, res) => {
  if (req.session?.role !== "USER") return res.status(403).json({ success: false, message: "Customer account required" });
  const { address, country, contactNumber, productIds } = req.body ?? {};
  if (![address, country, contactNumber].every((value) => typeof value === "string" && value.trim())) {
    return res.status(422).json({ success: false, message: "Address, country, and contact number are required" });
  }
  if (!Array.isArray(productIds) || productIds.length === 0 || productIds.length > 100 || productIds.some((id) => !mongoose.isValidObjectId(id))) {
    return res.status(422).json({ success: false, message: "Select at least one valid item for checkout" });
  }

  try {
    const [customer, cart] = await Promise.all([
      Customer.findById(req.session.userId).select("status"),
      Cart.findOne({ customer: req.session.userId }),
    ]);
    if (!customer || customer.status !== "ACTIVE") return res.status(401).json({ success: false, message: "Customer account is not available" });
    const cartProductIds = new Set((cart?.items ?? []).map((item) => item.product.toString()));
    if (new Set(productIds.map(String)).size !== productIds.length || productIds.some((id) => !cartProductIds.has(String(id)))) {
      return res.status(422).json({ success: false, message: "One or more selected items are no longer in your cart" });
    }
    res.status(200).json({ success: true, data: { orderId: new mongoose.Types.ObjectId().toString() } });
  } catch (error) {
    console.error("prepareCustomerOrder error:", error);
    res.status(500).json({ success: false, message: "Unable to prepare your order" });
  }
};

export const listCustomerOrders = async (req, res) => {
  if (req.session?.role !== "USER") {
    return res.status(403).json({ success: false, message: "Customer account required" });
  }
  try {
    const customer = await Customer.findById(req.session.userId).select("status");
    if (!customer || customer.status !== "ACTIVE") {
      return res.status(401).json({ success: false, message: "Customer account is not available" });
    }
    const orders = await Order.find({ customer: req.session.userId })
      .sort({ createdAt: -1 })
      .populate("customer", "name contactNumber")
      .populate("products.product", "name sinhalaName translations.name price priceLKR priceUSD");
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("listCustomerOrders error:", error);
    res.status(500).json({ success: false, message: "Unable to load your orders" });
  }
};

export const listOrders = async (_req, res) => {
  try { res.json({ success: true, data: await Order.find().sort({ createdAt: -1 }).populate("customer", "name email contactNumber") }); }
  catch (error) { console.error("listOrders error:", error); res.status(500).json({ success: false, message: "Unable to load orders" }); }
};

export const updateOrder = async (req, res) => {
  const allowed = ["orderStatus", "paymentStatus", "paymentMethod"];
  const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));
  try {
    const order = await Order.findById(req.params.id).populate("customer", "name email contactNumber");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    const changes = {};
    for (const field of ["orderStatus", "paymentStatus"]) {
      if (Object.hasOwn(updates, field) && order[field] !== updates[field]) {
        changes[field] = { previous: order[field], current: updates[field] };
      }
    }
    Object.assign(order, updates);
    await order.save();
    if (Object.keys(changes).length > 0) {
      const emailResult = await sendOrderStatusNotification(order, order.customer, changes);
      if (!emailResult.success) console.error(`Order ${order._id} status email failed:`, emailResult.reason);
    }
    res.json({ success: true, data: order });
  } catch (error) { res.status(422).json({ success: false, message: "Invalid order update" }); }
};
