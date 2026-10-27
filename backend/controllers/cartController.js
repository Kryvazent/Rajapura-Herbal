import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Customer from "../models/Customer.js";

export const requireCustomer = async (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ success: false, message: "Sign in to use your cart." });
  }
  try {
    const customer = await Customer.findById(req.session.userId).select("status");
    if (!customer || customer.status !== "ACTIVE") {
      return res.status(401).json({ success: false, message: "Your session is no longer valid. Please sign in again." });
    }
    req.customer = customer;
    req.session.role = "USER";
    next();
  } catch (error) {
    console.error("Cart customer authentication error:", error);
    res.status(500).json({ success: false, message: "Unable to verify your customer account." });
  }
};

const populateCart = (query) => query.populate({
  path: "items.product",
  select: "name sinhalaName tamilName category description price priceLKR priceUSD stock image badge translations",
});

export const getCart = async (req, res) => {
  try {
    const cart = await populateCart(Cart.findOne({ customer: req.customer._id }));
    res.json({ success: true, data: cart ?? { items: [] } });
  } catch (error) {
    console.error("Get customer cart error:", error);
    res.status(500).json({ success: false, message: "Unable to load your cart." });
  }
};

export const updateCart = async (req, res) => {
  const items = req.body?.items;
  if (!Array.isArray(items) || items.length > 100) {
    return res.status(422).json({ success: false, message: "Cart items must be a list of no more than 100 products." });
  }

  const normalized = [];
  const uniqueItems = new Map();
  for (const item of items) {
    const productId = String(item?.productId ?? "");
    const qty = Number(item?.qty);
    if (!mongoose.isValidObjectId(productId) || !Number.isSafeInteger(qty) || qty < 1) {
      return res.status(422).json({ success: false, message: "Each cart item needs a valid product and quantity." });
    }
    uniqueItems.set(productId, (uniqueItems.get(productId) ?? 0) + qty);
  }
  for (const [product, qty] of uniqueItems) {
    if (!Number.isSafeInteger(qty)) {
      return res.status(422).json({ success: false, message: "Cart quantity is too large." });
    }
    normalized.push({ product, qty });
  }

  try {
    const products = await Product.find({ _id: { $in: normalized.map((item) => item.product) } }).select("name");
    if (products.length !== normalized.length) {
      return res.status(404).json({ success: false, message: "One or more products are no longer available." });
    }
    const cart = await populateCart(Cart.findOneAndUpdate(
      { customer: req.customer._id },
      { $set: { items: normalized } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ));
    res.json({ success: true, data: cart });
  } catch (error) {
    console.error("Update customer cart error:", error);
    res.status(500).json({ success: false, message: "Unable to save your cart." });
  }
};

export const addCartItem = async (req, res) => {
  const productId = String(req.body?.productId ?? "");
  const qty = Number(req.body?.qty ?? 1);
  if (!mongoose.isValidObjectId(productId) || !Number.isSafeInteger(qty) || qty < 1) {
    return res.status(422).json({ success: false, message: "Choose a valid product quantity." });
  }

  try {
    const product = await Product.findById(productId).select("name");
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });
    const cart = await Cart.findOne({ customer: req.customer._id });
    const current = cart?.items.find((item) => item.product.toString() === productId);
    const nextQty = (current?.qty ?? 0) + qty;
    if (!Number.isSafeInteger(nextQty)) {
      return res.status(422).json({ success: false, message: "Cart quantity is too large." });
    }
    const items = cart ? cart.items.map((item) => ({ product: item.product, qty: item.product.toString() === productId ? nextQty : item.qty })) : [{ product: product._id, qty }];
    if (cart && !current) items.push({ product: product._id, qty });
    const updatedCart = await populateCart(Cart.findOneAndUpdate(
      { customer: req.customer._id },
      { $set: { items } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    ));
    res.json({ success: true, data: updatedCart });
  } catch (error) {
    console.error("Add customer cart item error:", error);
    res.status(500).json({ success: false, message: "Unable to add this product to your cart." });
  }
};
