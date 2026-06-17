import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/clerk(.*)",
  "/api/auth/demo(.*)",
]);

// API routes authenticate in route handlers (return JSON 401), not via
// middleware protect() which rewrites to Clerk pages and breaks fetch().
const isApiRoute = createRouteMatcher(["/api(.*)"]);

function isClerkConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
      process.env.CLERK_SECRET_KEY?.trim()
  );
}

const clerkProtectedMiddleware = clerkMiddleware((auth, request) => {
  if (isPublicRoute(request) || isApiRoute(request)) {
    return;
  }

  const { userId } = auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
});

export default function middleware(request: NextRequest, event: NextFetchEvent) {
  if (!isClerkConfigured()) {
    console.error(
      "[middleware] Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY or CLERK_SECRET_KEY"
    );

    if (isPublicRoute(request) || isApiRoute(request)) {
      return NextResponse.next();
    }

    return new NextResponse(
      "Server misconfigured: add Clerk environment variables in Vercel project settings.",
      { status: 503 }
    );
  }

  return clerkProtectedMiddleware(request, event);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
