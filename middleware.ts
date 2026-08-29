import { withAuth } from "next-auth/middleware";

// UX-level gate only: redirects signed-out users away from the app shell.
// This is NOT the authorization boundary — see lib/auth/session.ts.
export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/ideas/:path*",
    "/projects/:path*",
    "/ai/:path*",
    "/settings/:path*",
  ],
};
