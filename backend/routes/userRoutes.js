import express from 'express';
import * as productController from '../controllers/productController.js'; 
import * as ServiceController from '../controllers/serviceController.js';
import * as ShopController from '../controllers/shopController.js';

const router = express.Router();

// product routes
router.get('/products-all', productController.getAllProducts);
router.get('/product-count/:count', productController.getProductCount);
router.get('/products', productController.getProductsByPage);

// service routes
router.get('/services', ServiceController.getAllServices);

// shop routes
router.get('/shops', ShopController.getAllShops);


export default router;
