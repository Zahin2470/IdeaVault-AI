import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { checkRateLimit } from "@/lib/services/rate-limit.service";

// Central Auth.js config (§12). Database sessions via the Prisma adapter
// so sessions can be revoked server-side, not just by expiring a JWT.
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // Keyed by email rather than IP — this is the brute-force
      // protection for credential stuffing against one account, which
      // matters regardless of how reliable the caller's IP is behind a
      // proxy. A failed rate-limit check returns null, same as a wrong
      // password — the login form has no way to distinguish the two,
      // so it can't be used to confirm an account exists or is locked.
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const allowed = await checkRateLimit(
          `login:email:${credentials.email.toLowerCase()}`,
          10,
          15 * 60 * 1000 // 10 attempts / 15 minutes
        );
        if (!allowed) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
};
