import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express(); 

app.use(cors());
app.use(express.json());
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
    mongoose.connect('mongodb+srv://root:root@cluster0.ftqxq5x.mongodb.net/rajapura-herbal?appName=Cluster0').then(() => {
        console.log('Connected to MongoDB');
    }).catch((err) => {
        console.error('Failed to connect to MongoDB', err);
    });
});