import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/clerk(.*)",
  "/api/auth/demo(.*)",
]);

// API routes authenticate in route handlers (return JSON 401), not via
// middleware protect() which rewrites to Clerk pages and breaks fetch().
const isApiRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware((auth, request) => {
  if (isPublicRoute(request) || isApiRoute(request)) {
    return;
  }
  auth().protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
