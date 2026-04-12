import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session';

import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js'
import { verifyUserRole } from './middleware/auth.js';

dotenv.config();
const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    rolling: true,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,           
        maxAge: 60 * 60 * 1000,
        sameSite: 'lax',
        httpOnly: true       
    }
}));

app.use("/auth", authRoutes);
app.use("/admin", verifyUserRole, adminRoutes);
app.use("/user", userRoutes);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
    mongoose.connect(process.env.MONGO_URL).then(() => {
        console.log('Connected to MongoDB');
    }).catch((err) => {
        console.error('Failed to connect to MongoDB', err);
    });
});