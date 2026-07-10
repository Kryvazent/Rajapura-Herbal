import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js'
import { uploadThingRouter } from './routes/uploadthing.js';
import * as roleMiddleware from './middleware/roleMiddleware.js';

dotenv.config({ path: new URL(".env", import.meta.url) });
const app = express();
const PORT = process.env.PORT || 3000;
const isVercel = Boolean(process.env.VERCEL);
const isRailway = Boolean(
    process.env.RAILWAY_ENVIRONMENT ||
    process.env.RAILWAY_PUBLIC_DOMAIN ||
    process.env.RAILWAY_STATIC_URL
);
const isProduction =
    process.env.NODE_ENV === 'production' || isVercel || isRailway;
const mongoUrl = process.env.MONGO_URL || process.env.MONGODB_URI || "";
const allowedOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const apiRateLimitMax = Number(process.env.RATE_LIMIT_MAX) || 300;
const authRateLimitMax = Number(process.env.AUTH_RATE_LIMIT_MAX) || 10;
const bodyLimit = process.env.BODY_LIMIT || "1mb";
const cspExtraConnectSrc = (process.env.CSP_CONNECT_SRC || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
const cspExtraImgSrc = (process.env.CSP_IMG_SRC || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

if (isProduction && !process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is required in production");
}

if (isProduction && allowedOrigins.length === 0) {
    throw new Error("FRONTEND_URL must list allowed origins in production");
}

if (isProduction) {
    app.set("trust proxy", 1);
}

app.disable("x-powered-by");
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            defaultSrc: ["'self'"],
            baseUri: ["'self'"],
            objectSrc: ["'none'"],
            frameAncestors: ["'none'"],
            scriptSrc: ["'self'"],
            scriptSrcAttr: ["'none'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
            imgSrc: [
                "'self'",
                "data:",
                "blob:",
                "https:",
                ...cspExtraImgSrc,
            ],
            connectSrc: [
                "'self'",
                ...allowedOrigins,
                "https://*.uploadthing.com",
                "https://*.ufs.sh",
                "https://*.utfs.io",
                ...cspExtraConnectSrc,
            ],
            formAction: ["'self'"],
            upgradeInsecureRequests: isProduction ? [] : null,
        },
    },
}));

app.use(cors({
    origin(origin, callback) {
        if (!origin) {
            return callback(null, true);
        }

        if (!isProduction && allowedOrigins.length === 0) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));

const csrfOriginGuard = (req, res, next) => {
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        return next();
    }

    if (req.originalUrl.startsWith("/admin/uploadthing")) {
        return next();
    }

    if (!isProduction) {
        return next();
    }

    const requestOrigin = req.get("origin");
    const referer = req.get("referer");
    let refererOrigin = "";

    if (referer) {
        try {
            refererOrigin = new URL(referer).origin;
        } catch {
            refererOrigin = "";
        }
    }

    const sourceOrigin = requestOrigin || refererOrigin;

    if (sourceOrigin && allowedOrigins.includes(sourceOrigin)) {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: "Request origin is not allowed",
    });
};

const apiLimiter = rateLimit({
    windowMs: rateLimitWindowMs,
    limit: apiRateLimitMax,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: (req) =>
        req.method === "OPTIONS" ||
        req.originalUrl === "/" ||
        req.originalUrl === "/health" ||
        req.originalUrl.startsWith("/admin/uploadthing"),
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});

const authLimiter = rateLimit({
    windowMs: rateLimitWindowMs,
    limit: authRateLimitMax,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: {
        success: false,
        message: "Too many login attempts. Please try again later.",
    },
});

app.use("/auth/login", authLimiter);
app.use(["/auth", "/admin", "/user"], apiLimiter);
app.use(csrfOriginGuard);

app.use(express.json({ limit: bodyLimit }));
app.use(express.urlencoded({ limit: bodyLimit, extended: true }));

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
app.use("/admin", requireDatabase, roleMiddleware.verifyActiveAdminOrStaff, adminRoutes);
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
