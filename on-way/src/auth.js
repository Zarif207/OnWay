// pages/api/auth/[...nextauth].js (Version: 1.0.1)
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
          const res = await fetch(`${apiUrl}/passenger/find?email=${credentials.email}`);
          if (!res.ok) throw new Error("User not found");

          const user = await res.json();
          console.log("Auth debug - API response:", JSON.stringify(user));

          if (!user) {
            throw new Error("User not found in system");
          }

          const userData = user.data ? user.data : user;

          if (!userData || typeof userData !== 'object') {
            throw new Error("Invalid response format from server");
          }

          if (!userData.password) {
            throw new Error("Invalid user record: Missing password");
          }

          const isMatch = await bcrypt.compare(credentials.password, userData.password);
          if (!isMatch) throw new Error("Invalid password");

          return {
            id: userData._id || userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role || "passenger",
            image: userData.image || null,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    // JWT callback: only store minimal info to prevent cookie overflow
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "passenger";
        token.email = user.email;
        token.image = user.image || null;
      }
      return token;
    },

    // Session callback: populate session.user with minimal info
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.email = token.email;
        session.user.image = token.image;
      }
      return session;
    },

    // SignIn callback: handle OAuth user creation / sync
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

          // Check if user exists
          const res = await fetch(`${apiUrl}/passenger/find?email=${user.email}`);
          const existingUser = await res.json();

          if (!existingUser) {
            // Create new user
            await fetch(`${apiUrl}/passenger`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: user.name || user.email.split("@")[0],
                email: user.email,
                image: user.image || "",
                role: "passenger",
                authProvider: account.provider,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
              }),
            });
          }
        } catch (error) {
          console.error("Error syncing OAuth user:", error);
        }
      }
      return true;
    },
  },

  events: {
    async signIn({ user }) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
        await fetch(`${apiUrl}/passenger/update-login`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email }),
        });
      } catch (error) {
        console.error("Error updating last login:", error);
      }
    },
  },

  debug: process.env.NODE_ENV === "development",
});

export default auth;

