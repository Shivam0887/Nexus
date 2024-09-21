import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

const isProtectedRoute = createRouteMatcher([
  "/search(.*)",
  "/integration(.*)",
  "/analytics(.*)",
  "/settings(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
  const a = headers();
  // const nonce = crypto.randomUUID().toString();
  // const cspHeader = `
  //   default-src 'self';
  //   script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
  //   style-src 'self' 'nonce-${nonce}';
  //   img-src 'self' blob: data: https:;
  //   font-src 'self';
  //   object-src 'none';
  //   base-uri 'self';
  //   form-action 'self';
  //   frame-ancestors 'none';
  //   upgrade-insecure-requests;
  // `;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
