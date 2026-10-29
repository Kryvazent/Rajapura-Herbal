import { API_BASE_URL } from "./api";
import { generateReactHelpers } from "@uploadthing/react";

const isRequestToEndpoint = (input: RequestInfo | URL, endpoint: string) => {
  try {
    const requestUrl = new URL(input instanceof Request ? input.url : input.toString(), window.location.origin);
    const endpointUrl = new URL(endpoint, window.location.origin);
    return requestUrl.origin === endpointUrl.origin && requestUrl.pathname === endpointUrl.pathname;
  } catch {
    return false;
  }
};

const uploadThingUrl = `${API_BASE_URL}/admin/uploadthing`;

export const { useUploadThing } = generateReactHelpers<any>({
  url: uploadThingUrl,
  fetch: (input, init) => {
    const isBackendUploadRoute = isRequestToEndpoint(input, uploadThingUrl);

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
    return fetch(input, {
      ...init,
      credentials: isRequestToEndpoint(input, customerUploadThingUrl) ? "include" : "omit",
    });
  },
});
