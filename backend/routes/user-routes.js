import express from 'express';

const router = express.Router();

router.get('/home', (req, res) => {
    res.send('Welcome to the user home page!');
});

export default router;
