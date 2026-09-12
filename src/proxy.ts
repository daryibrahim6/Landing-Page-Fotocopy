import { NextResponse, type NextRequest } from "next/server";
import { isAdminRequest, adminUnauthorized } from "@/lib/admin-auth";

// Optimistic admin gate — covers BOTH the admin pages and the admin API.
// Route handlers re-check via isAdminRequest anyway (defense in depth).
export function proxy(request: NextRequest) {
  if (isAdminRequest(request)) return NextResponse.next();
  return adminUnauthorized();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
