import { generateReactHelpers } from "@uploadthing/react";

const uploadThingUrl = `${import.meta.env.VITE_BACKEND_URL}/admin/uploadthing`;

export const { useUploadThing } = generateReactHelpers<any>({
  url: uploadThingUrl,
  fetch: (input, init) => {
    const requestUrl = input instanceof Request ? input.url : input.toString();
    const isBackendUploadRoute = requestUrl.startsWith(uploadThingUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

    return fetch(input, {
      ...init,
      credentials: isBackendUploadRoute ? "include" : "omit",
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));
  },
});
