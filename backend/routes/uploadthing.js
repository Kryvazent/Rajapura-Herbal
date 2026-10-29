import "../config/env.js";
import express from "express";
import { createRouteHandler, createUploadthing } from "uploadthing/express";
import { UploadThingError } from "uploadthing/server";
import { deleteUploadThingFileByKey } from "../services/uploadthingService.js";
import Customer from "../models/Customer.js";

const f = createUploadthing();
const uploadThingToken = process.env.UPLOADTHING_TOKEN?.trim();
const paymentUploadThingToken = process.env.UPLOADTHING_PAYMENT_TOKEN?.trim();
const backendUrl =
  process.env.BACKEND_URL ||
  process.env.UPLOADTHING_CALLBACK_ORIGIN ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
const callbackOrigin = backendUrl.replace(/\/$/, "");
const adminCallbackUrl = callbackOrigin ? `${callbackOrigin}/admin/uploadthing` : undefined;
const customerCallbackUrl = callbackOrigin ? `${callbackOrigin}/user/uploadthing` : undefined;

export const uploadRouter = {
  productImage: f(
    {
      image: {
        maxFileSize: "4MB",
        maxFileCount: 1,
      },
    },
    { awaitServerData: false }
  )
    .middleware(({ req }) => {
      const isAllowedRole =
        req.session?.role === "ADMIN" || req.session?.role === "STAFF";

      if (!req.session?.userId || !isAllowedRole) {
        throw new UploadThingError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to upload product images.",
        });
      }

      return {
        userId: req.session.userId,
        role: req.session.role,
      };
    })
    .onUploadComplete(({ file, metadata }) => {
      console.log(
        `Product image uploaded by ${metadata.userId}: ${file.name}`
      );

      return {
        uploadedBy: metadata.userId,
        url: file.ufsUrl ?? file.url,
      };
    }),
  serviceImage: f(
    { image: { maxFileSize: "8MB", maxFileCount: 1 } },
    { awaitServerData: false }
  )
    .middleware(({ req }) => {
      const allowed = req.session?.role === "ADMIN" || req.session?.role === "STAFF";
      if (!req.session?.userId || !allowed) {
        throw new UploadThingError({ code: "UNAUTHORIZED", message: "You must be logged in to upload service images." });
      }
      return { userId: req.session.userId, role: req.session.role };
    })
    .onUploadComplete(({ file, metadata }) => {
      console.log(`Service image uploaded by ${metadata.userId}: ${file.name}`);
      console.debug('serviceImage file object:', file);
      return { uploadedBy: metadata.userId, url: file.ufsUrl ?? file.url };
    }),
  serviceVideo: f(
    { video: { maxFileSize: "64MB", maxFileCount: 1 } },
    { awaitServerData: false }
  )
    .middleware(({ req }) => {
      const allowed = req.session?.role === "ADMIN" || req.session?.role === "STAFF";
      if (!req.session?.userId || !allowed) {
        throw new UploadThingError({ code: "UNAUTHORIZED", message: "You must be logged in to upload service videos." });
      }
      return { userId: req.session.userId, role: req.session.role };
    })
    .onUploadComplete(({ file, metadata }) => {
      console.log(`Service video uploaded by ${metadata.userId}: ${file.name}`);
      console.debug('serviceVideo file object:', file);
      return { uploadedBy: metadata.userId, url: file.ufsUrl ?? file.url };
    }),
};

export const customerUploadRouter = {
  paymentSlip: f(
    { image: { maxFileSize: "4MB", maxFileCount: 1 }, pdf: { maxFileSize: "4MB", maxFileCount: 1 } },
    { awaitServerData: false }
  )
    .middleware(async ({ req }) => {
      const customer = req.session?.role === "USER" && req.session.userId
        ? await Customer.findById(req.session.userId).select("status")
        : null;
      if (!customer || customer.status !== "ACTIVE") {
        throw new UploadThingError({ code: "UNAUTHORIZED", message: "Sign in with a customer account to upload a payment slip." });
      }
      return { userId: req.session.userId, role: req.session.role };
    })
    .onUploadComplete(({ file, metadata }) => ({ uploadedBy: metadata.userId, url: file.ufsUrl ?? file.url })),
};

const uploadThingRouteHandler = createRouteHandler({
  router: uploadRouter,
  config: {
    ...(uploadThingToken && { token: uploadThingToken }),
    ...(adminCallbackUrl && { callbackUrl: adminCallbackUrl }),
    handleDaemonPromise: "void",
  },
});

const customerUploadThingRouteHandler = createRouteHandler({
  router: customerUploadRouter,
  config: {
    ...(paymentUploadThingToken && { token: paymentUploadThingToken }),
    ...(customerCallbackUrl && { callbackUrl: customerCallbackUrl }),
    handleDaemonPromise: "void",
  },
});

export const uploadThingRouter = express.Router();

uploadThingRouter.use((req, res, next) => {
  if (!uploadThingToken) {
    return res.status(503).json({
      success: false,
      message:
        "UploadThing is not configured. Set UPLOADTHING_TOKEN in the backend environment and restart the server.",
    });
  }

  next();
});

uploadThingRouter.use(uploadThingRouteHandler);

export const customerUploadThingRouter = express.Router();

customerUploadThingRouter.use((req, res, next) => {
  if (!paymentUploadThingToken) {
    return res.status(503).json({
      success: false,
      message:
        "Payment slip uploads are not configured. Set UPLOADTHING_PAYMENT_TOKEN in the backend environment and restart the server.",
    });
  }

  next();
});

customerUploadThingRouter.use(customerUploadThingRouteHandler);

export const deleteUploadThingFile = async (req, res) => {
  const { key } = req.body;

  if (!key || typeof key !== "string") {
    return res
      .status(422)
      .json({ success: false, message: "UploadThing file key is required" });
  }

  try {
    const result = await deleteUploadThingFileByKey(key);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error("deleteUploadThingFile error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete uploaded image" });
  }
};
