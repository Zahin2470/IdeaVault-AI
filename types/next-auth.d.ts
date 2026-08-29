import "next-auth";

// Auth.js's default Session["user"] has no id — add it since every
// service function scopes queries by userId.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
