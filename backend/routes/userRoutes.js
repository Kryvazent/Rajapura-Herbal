import express from 'express';
import * as productController from '../controllers/productController.js'; 

const router = express.Router();

router.get('/products', productController.getAllProducts);
router.get('/product-count/:count', productController.getProductCount);
router.get('/products?page=:page&limit=:limit', productController.getProductsByPage);

router.get('/services', ServiceController.getAllServices);


export default router;
