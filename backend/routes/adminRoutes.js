import express from 'express';
import * as productController from '../controllers/productController.js'; 
import * as storeController from '../controllers/storeController.js'

const router = express.Router();

router.post('/add-product', productController.addProduct);
router.delete('/delete-product', productController.deleteProduct);
router.put('/update-product', productController.updateProduct);

router.post('/add-store',storeController.addStore);
router.post('/update-store',storeController.updateStore);
router.post('/delete-store',storeController.deleteStore);

export default router;