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
    const existingProduct = await product.findById(id);

    if (!existingProduct) {
        return null;
    }

    Object.assign(existingProduct, fields);

    if (translations) {
        existingProduct.translations = translations;
        existingProduct.markModified("translations");
    }

    // Save and then re-query to ensure we return a fresh document
    // (avoids any Mongoose transform/virtuals issues and guarantees
    // nested `translations` are present in the returned object).
    await existingProduct.save();
    return await product.findById(id);
};
