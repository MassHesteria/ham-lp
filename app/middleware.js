// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const response = NextResponse.next();

  // Set cache headers for the main page
  if (request.nextUrl.pathname === "/") {
    response.headers.set(
      "Cache-Control", "public, max-age=1200, s-maxage=1200, stale-while-revalidate=60"
    );
  }

  return response;
}
