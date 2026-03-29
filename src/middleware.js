import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Custom logic can go here if needed
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Define which routes need auth protection.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - login
     * - register
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|login|register|_next/static|_next/image|favicon.ico).*)",
  ],
};
