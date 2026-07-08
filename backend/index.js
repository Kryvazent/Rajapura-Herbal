import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';

import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js'
import { uploadThingRouter } from './routes/uploadthing.js';
import * as authMiddleware from './middleware/auth.js';

dotenv.config({ path: new URL(".env", import.meta.url) });
const app = express();
const PORT = process.env.PORT || 3000;
const isVercel = Boolean(process.env.VERCEL);
const allowedOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const sessionConfig = {
    secret: process.env.SESSION_SECRET || "development-session-secret",
    rolling: true,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        httpOnly: true       
    }
};

if (process.env.MONGO_URL) {
    sessionConfig.store = MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        collectionName: 'sessions'
    });
} else {
    console.error("MONGO_URL is missing. Session persistence and database routes will not work.");
}

app.use(session(sessionConfig));

app.use("/auth", authRoutes);
app.use("/admin/uploadthing", uploadThingRouter);
app.use("/admin",authMiddleware.verifyLoggin, authMiddleware.verifyUserRoleBoth, adminRoutes);
app.use("/user", userRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to the Rajapura Herbal API");
});

const connectDB = async () => {
    if (!process.env.MONGO_URL) {
        console.error("MONGO_URL is required to connect to MongoDB");
        return;
    }

    if (mongoose.connection.readyState >= 1) {
        return;
    }

    await mongoose.connect(process.env.MONGO_URL);
};

connectDB()
    .then(() => {
        console.log('Connected to MongoDB');

        if (!isVercel) {
            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            });
        }
    })
    .catch((err) => {
        console.error('Failed to connect to MongoDB', err);
    });

export default app;
