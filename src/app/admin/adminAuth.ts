// Admin authentication helpers — credentials are hardcoded for demo purposes.
// In production, replace with a real backend authentication system.

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "rajapura2026";
const AUTH_KEY = "rajapura_admin_auth";

export function login(username: string, password: string): boolean {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    sessionStorage.setItem(AUTH_KEY, "true");
    return true;
  }
  return false;
}

export function logout(): void {
  sessionStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(AUTH_KEY) === "true";
}
