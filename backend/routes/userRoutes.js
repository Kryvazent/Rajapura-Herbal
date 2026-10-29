import express from 'express';
import * as productController from '../controllers/productController.js'; 
import * as ServiceController from '../controllers/serviceController.js';
import * as ShopController from '../controllers/shopController.js';
import * as TeamController from '../controllers/teamController.js';
import * as orderController from '../controllers/orderController.js';
import * as cartController from '../controllers/cartController.js';

const router = express.Router();

router.get('/cart', cartController.requireCustomer, cartController.getCart);
router.put('/cart', cartController.requireCustomer, cartController.updateCart);
router.post('/cart/items', cartController.requireCustomer, cartController.addCartItem);
router.get('/orders', orderController.listCustomerOrders);
router.get('/checkout-details', cartController.requireCustomer, orderController.getCheckoutDetails);
router.post('/orders', cartController.requireCustomer, orderController.createCustomerOrder);

router.get('/products-all', productController.getAllProducts);
router.get('/product-count/:count', productController.getProductCount);
router.get('/products', productController.getProductsByPage);

router.get('/services', ServiceController.getAllServices);

router.get('/shops', ShopController.getAllShops);
router.get('/team', TeamController.getTeam);

export default router;
