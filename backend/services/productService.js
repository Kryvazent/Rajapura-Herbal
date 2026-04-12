import product from "../models/product.js";

export const getAllProducts = async () => {

    return await product.find({});
};

export const getProductsByCount = async (count) => {

    return await product.aggregate([{ $sample: { size: count } }]);
}

export const getProductsByPage = async (skip, limit) => {

    return await product.find({}).skip(skip).limit(limit);
}