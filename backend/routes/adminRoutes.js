import express from 'express';
import * as productController from '../controllers/productController.js'; 
import * as storeController from '../controllers/storeController.js'; 

const router = express.Router();

// Product routes
router.post('/add-product', productController.addProduct);
router.delete('/delete-product', productController.deleteProduct);
router.put('/update-product', productController.updateProduct);

// Province routes
router.post('/add-province', storeController.addProvince);
router.put('/update-province', storeController.updateProvince);
router.delete('/delete-province', storeController.deleteProvince);

// District routes
router.post('/add-district', storeController.addDistrict);
router.put('/update-district', storeController.updateDistrict);
router.delete('/delete-district', storeController.deleteDistrict);

// Town routes
router.post('/add-town', storeController.addTown);
router.put('/update-town', storeController.updateTown);
router.delete('/delete-town', storeController.deleteTown);

// Shop routes
router.post('/add-shop', storeController.addShop);
router.put('/update-shop', storeController.updateShop);
router.delete('/delete-shop', storeController.deleteShop);

// Get all provinces
router.get('/provinces', storeController.getAllProvinces);

// Wizard route
router.post('/add-shop-wizard', storeController.addShopWizard);

export default router;