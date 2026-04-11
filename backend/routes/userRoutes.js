import express from 'express';
import * as productController from '../controllers/productController.js'; 

const router = express.Router();

router.get('/products', productController.getAllProducts);

router.get('/home', (req, res) => {
    res.send('Welcome to the user home page!');
});

export default router;
