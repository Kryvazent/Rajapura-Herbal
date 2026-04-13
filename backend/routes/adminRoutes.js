import express from 'express';
import * as productController from '../controllers/productController.js'; 

const router = express.Router();

router.post('/add-product', productController.addProduct);
router.delete('/delete-product', productController.deleteProduct);
router.put('/update-product', productController.updateProduct);

export default router;