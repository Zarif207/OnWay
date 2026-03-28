
import { NextResponse } from "next/server";
import { auth } from "@/auth";

// Define role-based route mappings
const ROLE_ROUTES = {
  admin: "/dashboard/admin",
  rider: "/dashboard/rider",
  passenger: "/dashboard/passenger",
  supportAgent: "/dashboard/supportAgent",
};

// Define protected route patterns
const PROTECTED_ROUTES = [
  { path: "/dashboard/admin", allowedRoles: ["admin"] },
  { path: "/dashboard/rider", allowedRoles: ["rider"] },
  { path: "/dashboard/passenger", allowedRoles: ["passenger"] },
  { path: "/dashboard/supportAgent", allowedRoles: ["supportAgent"] },
];

export default auth(async function middleware(req) {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Allow public routes
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static")
  ) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated and trying to access protected routes
  if (!session?.user && pathname.startsWith("/dashboard")) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access for dashboard routes
  if (session?.user && pathname.startsWith("/dashboard")) {
    const userRole = session.user.role;

    // Handle base /dashboard route - redirect to user's dashboard
    if (pathname === "/dashboard") {
      const userDashboard = ROLE_ROUTES[userRole];
      if (userDashboard) {
        return NextResponse.redirect(new URL(userDashboard, req.url));
      }
      // Fallback to home if role not found
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Check if user is trying to access a protected route
    for (const route of PROTECTED_ROUTES) {
      if (pathname.startsWith(route.path)) {
        // If user's role is not in the allowed roles, redirect
        if (!route.allowedRoles.includes(userRole)) {
          // Redirect to user's own dashboard
          const userDashboard = ROLE_ROUTES[userRole];
          if (userDashboard) {
            return NextResponse.redirect(new URL(userDashboard, req.url));
          }
          // Fallback to home
          return NextResponse.redirect(new URL("/", req.url));
        }
        // User has correct role, allow access
        return NextResponse.next();
      }
    }
  }

  return NextResponse.next();
});


export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp).*)",
  ],
};
