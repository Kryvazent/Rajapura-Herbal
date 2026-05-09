import * as productService from "../services/productService.js";

// Helper to format mongoose validation errors
const formatMongooseError = (error) => {
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((e) => e.message);
    return { status: 422, message: "Validation failed", errors };
  }
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return {
      status: 409,
      message: `A product with this ${field} already exists`,
    };
  }
  return { status: 500, message: "Internal server error" };
};

export const getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts();
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("getAllProducts error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching products" });
  }
};

export const getProductCount = async (req, res) => {
  const count = parseInt(req.params.count, 10);

  // validate count param
  if (isNaN(count) || count <= 0 || count > 100) {
    return res.status(422).json({
      success: false,
      message: "Count must be a number between 1 and 100",
    });
  }

  try {
    const products = await productService.getProductsByCount(count);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("getProductCount error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching products" });
  }
};

export const getProductsByPage = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  // validate pagination params
  if (page < 1) {
    return res
      .status(422)
      .json({ success: false, message: "Page must be at least 1" });
  }
  if (limit < 1 || limit > 100) {
    return res
      .status(422)
      .json({ success: false, message: "Limit must be between 1 and 100" });
  }

  const skip = (page - 1) * limit;

  try {
    const products = await productService.getProductsByPage(skip, limit);
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("getProductsByPage error:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching products" });
  }
};

export const addProduct = async (req, res) => {
  // Check product object exists in body
  if (!req.body.product || typeof req.body.product !== "object") {
    return res.status(422).json({
      success: false,
      message: "Product data is required",
    });
  }

  const { _id, ...productData } = req.body.product;

  // Convert price to number if sent as string
  if (productData.price !== undefined) {
    productData.price = parseFloat(productData.price);
  }

  try {
    const product = await productService.addProduct(productData);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error("addProduct error:", error);
    const { status, message, errors } = formatMongooseError(error);
    res.status(status).json({ success: false, message, errors });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res
      .status(422)
      .json({ success: false, message: "Product ID is required" });
  }

  try {
    const deleted = await productService.deleteProduct(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("deleteProduct error:", error);
    // Handle invalid ObjectId format
    if (error.name === "CastError") {
      return res
        .status(422)
        .json({ success: false, message: "Invalid product ID format" });
    }
    res.status(500).json({ success: false, message: "Error deleting product" });
  }
};

export const updateProduct = async (req, res) => {
  if (!req.body.product || typeof req.body.product !== "object") {
    return res
      .status(422)
      .json({ success: false, message: "Product data is required" });
  }

  const { _id, ...productData } = req.body.product;

  if (!_id) {
    return res
      .status(422)
      .json({ success: false, message: "Product ID is required for update" });
  }

  // Convert price to number if sent as string
  if (productData.price !== undefined) {
    productData.price = parseFloat(productData.price);
  }

  try {
    await productService.deleteProduct(_id);
    const product = await productService.addProduct(productData);
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("updateProduct error:", error);
    if (error.name === "CastError") {
      return res
        .status(422)
        .json({ success: false, message: "Invalid product ID format" });
    }
    const { status, message, errors } = formatMongooseError(error);
    res.status(status).json({ success: false, message, errors });
  }
};