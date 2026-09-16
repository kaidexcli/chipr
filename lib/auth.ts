/**
 * Chipr Exclusive Authentication Module
 * Predefined exclusive credentials for Benedict Fusin
 */

export const AUTHORIZED_USER = {
  email: "benedictfusin99@gmail.com",
  password: "kai@anthropic",
  name: "Benedict Fusin",
  role: "Owner & Administrator",
};

export const AUTH_COOKIE_NAME = "chipr_auth_session";
export const AUTH_STORAGE_KEY = "chipr_auth_session_v1";

export interface AuthSession {
  email: string;
  name: string;
  role: string;
  authenticatedAt: number;
}

/**
 * Validates provided credentials against the exclusive authorized account.
 * Email is case-insensitive, password is exact.
 */
export function validateCredentials(
  email?: string | null,
  password?: string | null
): boolean {
  if (!email || !password) return false;
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();
  return (
    cleanEmail === AUTHORIZED_USER.email.toLowerCase() &&
    cleanPassword === AUTHORIZED_USER.password
  );
}

/**
 * Creates an encoded session token.
 */
export function createSessionToken(): string {
  const timestamp = Date.now();
  const payload = `${AUTHORIZED_USER.email}:${timestamp}`;
  if (typeof btoa === "function") {
    return btoa(payload);
  }
  return Buffer.from(payload).toString("base64");
}

/**
 * Validates a session token.
 */
export function verifySessionToken(token?: string | null): boolean {
  if (!token) return false;
  try {
    const decoded =
      typeof atob === "function"
        ? atob(token)
        : Buffer.from(token, "base64").toString("utf-8");
    const [email] = decoded.split(":");
    return email?.toLowerCase() === AUTHORIZED_USER.email.toLowerCase();
  } catch {
    return false;
  }
}
