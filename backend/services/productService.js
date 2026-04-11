import Product from "../models/Product.js";

export const getAllProducts = async () => {

    return await Product.find({});
};

export const getProductsByCount = async (count) => {

    return await Product.aggregate([{ $sample: { size: count } }]);
}

export const getProductsByPage = async (skip, limit) => {

    return await Product.find({}).skip(skip).limit(limit);
}