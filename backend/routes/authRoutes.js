import express from 'express';
import * as authMiddleware from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/login', authMiddleware.verifyNotLoggin, authController.login);
router.post('/logout',authMiddleware.verifyLoggin, authController.logout);
router.get('/status', authController.status);


export default router;