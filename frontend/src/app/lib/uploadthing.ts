import { API_BASE_URL } from "./api";
import { generateReactHelpers } from "@uploadthing/react";

const uploadThingUrl = `${API_BASE_URL}/admin/uploadthing`;

export const { useUploadThing } = generateReactHelpers<any>({
  url: uploadThingUrl,
  fetch: (input, init) => {
    const requestUrl = input instanceof Request ? input.url : input.toString();
    const isBackendUploadRoute = requestUrl.startsWith(uploadThingUrl);

    return fetch(input, {
      ...init,
      credentials: isBackendUploadRoute ? "include" : "omit",
    });
  },
});

const customerUploadThingUrl = `${API_BASE_URL}/user/uploadthing`;

export const { useUploadThing: useCustomerUploadThing } = generateReactHelpers<any>({
  url: customerUploadThingUrl,
  fetch: (input, init) => {
    const requestUrl = input instanceof Request ? input.url : input.toString();
    return fetch(input, {
      ...init,
      credentials: requestUrl.startsWith(customerUploadThingUrl) ? "include" : "omit",
    });
  },
});
