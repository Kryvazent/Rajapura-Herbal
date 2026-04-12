import express from 'express';
import { verifyNotLoggin } from '../middleware/auth.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

router.post('/login', verifyNotLoggin, authController.login);


export default router;