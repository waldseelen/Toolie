export const ADMIN_SESSION_COOKIE = "toolie-admin-session";

export function isValidAdminToken(token: string | undefined | null): boolean {
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken || !token) {
    return false;
  }

  return token === adminToken;
}

/**
 * Validates the admin session cookie on an incoming API request.
 * Route handlers receive a plain `Request`, so we parse the raw cookie
 * header instead of relying on `NextRequest.cookies`.
 */
export function isAdminRequest(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const entry = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`));

  if (!entry) {
    return false;
  }

  const value = decodeURIComponent(entry.slice(ADMIN_SESSION_COOKIE.length + 1));
  return isValidAdminToken(value);
}
