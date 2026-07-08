import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export const getUploadThingKeyFromUrl = (imageUrl) => {
  try {
    const url = new URL(imageUrl);
    const host = url.hostname.toLowerCase();
    const isUploadThingUrl =
      host.includes("uploadthing.com") ||
      host.includes("ufs.sh") ||
      host.includes("utfs.io");

    if (!isUploadThingUrl) return "";

    const parts = url.pathname.split("/").filter(Boolean);
    const fileSegmentIndex = parts.indexOf("f");
    const key =
      fileSegmentIndex >= 0
        ? parts[fileSegmentIndex + 1]
        : parts[parts.length - 1];

    return key ? decodeURIComponent(key) : "";
  } catch {
    return "";
  }
};

export const deleteUploadThingFileByKey = async (key) => {
  if (!key) return null;
  return await utapi.deleteFiles(key);
};

export const deleteUploadThingFileByUrl = async (imageUrl) => {
  const key = getUploadThingKeyFromUrl(imageUrl);
  if (!key) return null;
  return await deleteUploadThingFileByKey(key);
};
