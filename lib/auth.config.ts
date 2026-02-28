import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

// This config is used by middleware (edge runtime)
// It doesn't include the Prisma adapter which requires Node.js runtime
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthPage = nextUrl.pathname.startsWith("/auth")
      const isApiRoute = nextUrl.pathname.startsWith("/api")
      const isPublicPage = nextUrl.pathname === "/"

      // Allow API routes to pass through (they handle their own auth)
      if (isApiRoute) {
        return true
      }

      // Redirect logged in users away from auth pages
      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL("/applications", nextUrl))
      }

      // Allow public pages
      if (isPublicPage || isAuthPage) {
        return true
      }

      // Require auth for all other pages
      return isLoggedIn
    },
  },
  trustHost: true,
}
