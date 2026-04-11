import * as productService from '../services/productService.js';

export const getAllProducts = async (req,res) => {

    try {
        const products = await productService.getAllProducts();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
};

export const getProductCount = async (req, res) => {

    const count = parseInt(req.params.count, 10);

    try {
        const products = await productService.getProductsByCount(count);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
};

export const getProductsByPage = async (req, res) => {

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    try {
        const products = await productService.getProductsByPage(skip, limit);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error });
    }
};