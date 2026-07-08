import { createRouteHandler, createUploadthing } from "uploadthing/express";
import { UploadThingError } from "uploadthing/server";
import { deleteUploadThingFileByKey } from "../services/uploadthingService.js";

const f = createUploadthing();
const backendUrl =
  process.env.BACKEND_URL ||
  process.env.UPLOADTHING_CALLBACK_ORIGIN ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
const uploadThingCallbackUrl = backendUrl
  ? `${backendUrl.replace(/\/$/, "")}/admin/uploadthing`
  : undefined;

export const uploadRouter = {
  productImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
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
};

export const uploadThingRouter = createRouteHandler({
  router: uploadRouter,
  config: {
    ...(uploadThingCallbackUrl && { callbackUrl: uploadThingCallbackUrl }),
  },
});

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
