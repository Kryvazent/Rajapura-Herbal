import express from 'express';
import * as productController from '../controllers/productController.js'; 
import * as ServiceController from '../controllers/serviceController.js';
import * as ShopController from '../controllers/shopController.js';
import * as StoreController from '../controllers/storeController.js';

const router = express.Router();

// product routes
router.get('/products-all', productController.getAllProducts);
router.get('/product-count/:count', productController.getProductCount);
router.get('/products', productController.getProductsByPage);

// service routes
router.get('/services', ServiceController.getAllServices);

// shop routes
router.get('/shops', ShopController.getAllShops);

router.get('/store-all', StoreController.getAllStores);

export default router;
