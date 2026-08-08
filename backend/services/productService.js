import product from "../models/Product.js";

export const getAllProducts = async () => {

    return await product.find({});
};

export const getProductsByCount = async (count) => {

    return await product.aggregate([{ $sample: { size: count } }]);
}

export const getProductsByPage = async (skip, limit) => {

    return await product.find({}).skip(skip).limit(limit);
}

export const addProduct = async (productData) => {

    const newProduct = new product(productData);
    return await newProduct.save();
};

export const deleteProduct = async (id) => {
    return await product.findByIdAndDelete(id);
};

export const updateProduct = async (id, productData) => {
    const { translations, ...fields } = productData;
    const updates = {
        ...fields,
        ...(translations ? { translations } : {}),
    };

    return await product.findByIdAndUpdate(id, { $set: updates }, {
        new: true,
        runValidators: true,
    });
};
