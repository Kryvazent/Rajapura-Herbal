export const ADMIN_BASE_PATH = "/rh-admin-7q4m9x";

export const adminPath = (path = "") =>
  `${ADMIN_BASE_PATH}${path ? `/${path.replace(/^\/+/, "")}` : ""}`;
