// Admin Basic Auth — single source used by BOTH the proxy (optimistic gate)
// and admin route handlers (defense in depth: a proxy misconfiguration must
// not silently open the API). Edge-safe: atob only, no Node APIs.

const REALM = 'Basic realm="BisaPrint Admin", charset="UTF-8"';

export function isAdminRequest(request: Request): boolean {
  const user = process.env.ADMIN_USERNAME;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) return false; // fail closed

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return false;

  let decoded: string;
  try {
    decoded = atob(header.slice(6));
  } catch {
    return false;
  }
  const sep = decoded.indexOf(":");
  if (sep < 0) return false;
  return decoded.slice(0, sep) === user && decoded.slice(sep + 1) === pass;
}

export function adminUnauthorized(): Response {
  return new Response("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": REALM },
  });
}
