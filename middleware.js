import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { NextResponse } from "next/server";

import { protectedRoutes } from "./routes";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const isLoggedIn = !!req.auth;
  const isProtectedRoute = protectedRoutes.includes(req.nextUrl.pathname);
  const isAuthRoute = req.nextUrl.pathname.includes("/auth");
  const isApiRoute = req.nextUrl.pathname.startsWith("/api/");
  const isAuthCallback = req.nextUrl.pathname.includes("/api/auth/callback");

  if (isApiRoute || isAuthCallback || (isAuthRoute && isLoggedIn)) {
    return;
  }

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth", req.url));
  }
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"]
} 
