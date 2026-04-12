import express from 'express';
import { verifyNotLoggin } from '../middleware/auth';

const router = express.Router();

router.post('/login', verifyNotLoggin, authController.login);


export default router;