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
const isProduction = process.env.NODE_ENV === 'production' || isVercel;
const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI || "";
const allowedOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

if (isProduction) {
    app.set("trust proxy", 1);
}

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

const sessionConfig = {
    secret: process.env.SESSION_SECRET || "development-session-secret",
    rolling: true,
    resave: false,
    saveUninitialized: false,
    proxy: isProduction,
    cookie: {
        secure: isProduction,
        maxAge: 60 * 60 * 1000,
        sameSite: isProduction ? 'none' : 'lax',
        httpOnly: true       
    }
};

if (mongoUrl) {
    try {
        sessionConfig.store = MongoStore.create({
            mongoUrl,
            collectionName: 'sessions'
        });
    } catch (error) {
        console.error("Failed to create Mongo session store:", error);
    }
} else {
    console.error("MONGO_URL is missing. Session persistence and database routes will not work.");
}

app.use(session(sessionConfig));

let dbConnectionPromise = null;
const connectDB = async () => {
    if (!mongoUrl) {
        throw new Error("MONGO_URL or MONGODB_URI is required to connect to MongoDB");
    }

    if (mongoose.connection.readyState >= 1) {
        return;
    }

    if (!dbConnectionPromise) {
        dbConnectionPromise = mongoose.connect(mongoUrl).catch((error) => {
            dbConnectionPromise = null;
            throw error;
        });
    }

    await dbConnectionPromise;
};

const requireDatabase = async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (error) {
        console.error("Database connection error:", error);
        res.status(503).json({
            success: false,
            message: "Database connection is not available",
        });
    }
};

app.use("/auth", requireDatabase, authRoutes);
app.use("/admin/uploadthing", uploadThingRouter);
app.use("/admin", requireDatabase, authMiddleware.verifyLoggin, authMiddleware.verifyUserRoleBoth, adminRoutes);
app.use("/user", requireDatabase, userRoutes);

app.get("/", (req, res) => {
    res.send("Welcome to the Rajapura Herbal API");
});

app.get("/health", async (req, res) => {
    try {
        await connectDB();
        res.status(200).json({ success: true, database: "connected" });
    } catch (error) {
        res.status(503).json({
            success: false,
            database: "unavailable",
            message: error.message,
        });
    }
});

if (!isVercel) {
    connectDB()
        .then(() => {
            console.log('Connected to MongoDB');
            app.listen(PORT, () => {
                console.log(`Server is running on port ${PORT}`);
            });
        })
        .catch((err) => {
            console.error('Failed to connect to MongoDB', err);
        });
}

export default app;
