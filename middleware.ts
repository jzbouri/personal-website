import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (new URL(request.url).pathname !== "/") {
    return NextResponse.next();
  }

  const refererHeader = request.headers.get("referer");
  if (!refererHeader) {
    return NextResponse.next();
  }

  let isInstagramReferrer = false;
  try {
    const refUrl = new URL(refererHeader);
    const hostname = refUrl.hostname.toLowerCase();
    isInstagramReferrer = hostname === "instagram.com" || hostname.endsWith(".instagram.com");
  } catch {
    isInstagramReferrer = /(^|[\/.])instagram\.com/i.test(refererHeader);
  }

  if (isInstagramReferrer) {
    const redirectUrl = new URL("/contact", request.url);
    return NextResponse.redirect(redirectUrl, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/",
};


