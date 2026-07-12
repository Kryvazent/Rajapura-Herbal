import express from 'express';
import * as productController from '../controllers/productController.js'; 
import * as ServiceController from '../controllers/serviceController.js';
import * as ShopController from '../controllers/shopController.js';
import * as TeamController from '../controllers/teamController.js';

const router = express.Router();

router.get('/products-all', productController.getAllProducts);
router.get('/product-count/:count', productController.getProductCount);
router.get('/products', productController.getProductsByPage);

router.get('/services', ServiceController.getAllServices);

router.get('/shops', ShopController.getAllShops);
router.get('/team', TeamController.getTeam);

export default router;
