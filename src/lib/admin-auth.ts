export const ADMIN_SESSION_COOKIE = "toolie-admin-session";

export function isValidAdminToken(token: string | undefined | null): boolean {
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken || !token) {
    return false;
  }

  return token === adminToken;
}
