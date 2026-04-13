import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';

import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js'
import * as authMiddleware from './middleware/auth.js';

dotenv.config();
const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    rolling: true,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        collectionName: 'sessions'
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',           
        maxAge: 60 * 60 * 1000,
        sameSite: 'lax',
        httpOnly: true       
    }
}));

app.use("/auth", authRoutes);
app.use("/admin",authMiddleware.verifyLoggin, authMiddleware.verifyUserRole, adminRoutes);
app.use("/user", userRoutes);

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('Connected to MongoDB');

        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB', err);
    });