
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
        }),
        GitHub({
            clientId: process.env.AUTH_GITHUB_ID,
            clientSecret: process.env.AUTH_GITHUB_SECRET,
        }),
        Credentials({
            name: "Credentials",
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/passenger/find?email=${credentials.email}`);
                const user = await res.json();

                if (!user || !user.password) {
                    throw new Error("User not found!");
                }

                const isMatch = await bcrypt.compare(credentials.password, user.password);
                if (!isMatch) {
                    throw new Error("Invalid password!");
                }

                return {
                    id: user._id || user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role === "passenger" ? "user" : (user.role || "user")
                };
            },
        }),
    ],

    session: { strategy: "jwt" },
    pages: { signIn: "/login" },

    events: {
        async signIn({ user }) {
            const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
            try {
                await fetch(`${apiUrl}/passenger/update-login`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: user.email }),
                });
            } catch (error) {
                console.error("Error updating last login:", error);
            }
        }
    },

    callbacks: {
        async signIn({ user, account }) {
            if (account.provider === "google" || account.provider === "github") {
                const { name, email, image } = user;
                // Use server-side API URL — NEXT_PUBLIC_ vars may be undefined in server callbacks
                const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

                try {
                    const res = await fetch(`${apiUrl}/passenger/find?email=${email}`);
                    const existing = await res.json();

                    // /passenger/find returns 200 + null when user doesn't exist
                    if (!existing) {
                        const saveRes = await fetch(`${apiUrl}/passenger`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                name,
                                email,
                                image,
                                role: "passenger",
                                authProvider: account.provider,
                            }),
                        });

                        if (!saveRes.ok) {
                            const errBody = await saveRes.text();
                            console.error("Failed to save social user to DB:", saveRes.status, errBody);
                        } else {
                            console.log(`✅ New social user saved: ${email} (${account.provider})`);
                        }
                    }
                    return true;
                } catch (error) {
                    console.error("Error during social login sync:", error);
                    return true; // still allow sign-in even if DB save fails
                }
            }
            return true;
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }

            // For social logins or if role is missing, fetch it from DB
            if (token?.email && !token?.role) {
                const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
                try {
                    const res = await fetch(`${apiUrl}/passenger/find?email=${token.email}`);
                    if (res.ok) {
                        const userData = await res.json();
                        if (userData) {
                            const rawRole = userData.role || "passenger";
                            token.role = rawRole === "user" ? "passenger" : rawRole;
                            token.id = userData._id?.toString() || userData.id || token.id;
                        } else {
                            token.role = "passenger";
                        }
                    } else {
                        token.role = "passenger";
                    }
                } catch (error) {
                    console.error("Error fetching role in JWT callback:", error);
                    token.role = "passenger";
                }
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
    },
});