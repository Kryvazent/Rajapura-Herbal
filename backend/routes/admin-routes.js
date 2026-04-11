import express from 'express';

const router = express.Router();

router.get('/dashboard', (req, res) => {
    res.send('Welcome to the admin dashboard!');
});

export default router;